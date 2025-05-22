<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use App\Models\Post;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['user', 'platforms'])
            ->where('user_id', auth()->id());
        
        return $query->latest()->get();
    }

    public function filterByStatus($status)
    {
        $validStatuses = ['draft', 'scheduled', 'published'];
        
        if (!in_array($status, $validStatuses)) {
            return response()->json([
                'message' => 'Invalid status. Must be one of: ' . implode(', ', $validStatuses)
            ], 400);
        }
        
        $posts = Post::with(['user', 'platforms'])
            ->where('user_id', auth()->id())
            ->where('status', $status)
            ->latest()
            ->get();
            
        return response()->json($posts);
    }
    
    public function filterByDate($date)
    {
        try {
            $parsedDate = Carbon::parse($date);
            
            $posts = Post::with(['user', 'platforms'])
                ->where('user_id', auth()->id())
                ->whereDate('created_at', $parsedDate)
                ->orWhereDate('scheduled_time', $parsedDate)
                ->latest()
                ->get();
                
            return response()->json($posts);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Invalid date format. Please use YYYY-MM-DD format.'
            ], 400);
        }
    }

    public function create()
    {
       return Platform::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,scheduled,published',
            'platform_ids' => 'required|array',
            'platform_ids.*' => 'exists:platforms,id',
            'image_url' => 'nullable|url',
            'scheduled_time' => 'required_if:status,scheduled|nullable|date|after:now',
        ]);

        $post = Post::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => $validated['status'],
            'image_url' => $request->input('image_url'),
            'scheduled_time' => $validated['status'] === 'scheduled' ? $request->input('scheduled_time') : null,
            'user_id' => auth()->id(),
        ]);

        // Validate platform-specific requirements
        foreach ($validated['platform_ids'] as $platformId) {
            $platform = Platform::find($platformId);
            $isValid = $this->validateForPlatform($post, $platform->type);
            
            $post->platforms()->attach($platformId, [
                'platform_status' => $isValid ? 'pending' : 'validation_failed',
            ]);
        }

        return response()->json([
            'message' => 'Post created successfully',
            'post' => $post->load('platforms')
        ], 201);
    }

    public function show(Post $post)
    {
        // Check if post belongs to authenticated user
        if ($post->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return $post->load(['user', 'platforms']);
    }

    public function update(Request $request, Post $post)
    {
        // Check if post belongs to authenticated user
        if ($post->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Validate the incoming request
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:draft,scheduled,published',
            'platform_ids' => 'sometimes|required|array',
            'platform_ids.*' => 'exists:platforms,id',
            'image_url' => 'nullable|url',
            'scheduled_time' => 'required_if:status,scheduled|nullable|date|after:now',
        ]);
        
        // Update the post
        $post->update([
            'title' => $request->input('title', $post->title),
            'content' => $request->input('content', $post->content),
            'status' => $request->input('status', $post->status),
            'image_url' => $request->input('image_url', $post->image_url),
            'scheduled_time' => $request->input('status') === 'scheduled' ? 
                $request->input('scheduled_time') : 
                ($post->status === 'scheduled' ? $post->scheduled_time : null),
        ]);
        
        // Update platforms if provided
        if ($request->has('platform_ids')) {
            $platformData = [];
            foreach ($request->input('platform_ids') as $platformId) {
                $platform = Platform::find($platformId);
                $isValid = $this->validateForPlatform($post, $platform->type);
                
                $platformData[$platformId] = [
                    'platform_status' => $isValid ? 'pending' : 'validation_failed',
                ];
            }
            
            $post->platforms()->sync($platformData);
        }
        
        return response()->json([
            'message' => 'Post updated successfully',
            'post' => $post->fresh()->load('platforms')
        ]);
    }

    public function destroy(Post $post)
    {
        // Check if post belongs to authenticated user
        if ($post->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
    
    /**
     * Validate post content for specific platform requirements
     */
    private function validateForPlatform(Post $post, string $platformType): bool
    {
        switch ($platformType) {
            case 'twitter':
                // Twitter character limit (280 characters)
                return strlen($post->content) <= 280;
                
            case 'instagram':
                // Instagram requires an image
                return !empty($post->image_url);
                
            case 'linkedin':
                // LinkedIn has a 3000 character limit for posts
                return strlen($post->content) <= 3000;
                
            case 'facebook':
                // Facebook has a 63,206 character limit
                return strlen($post->content) <= 63206;
                
            default:
                // For any other platform types, no specific validation
                return true;
        }
    }
}
