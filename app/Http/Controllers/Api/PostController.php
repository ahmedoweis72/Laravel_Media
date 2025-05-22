<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        return Post::with(['user', 'platforms'])->get();
    }


    public function create()
    {
       return $platforms = Platform::all();

        
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published',
            'platform_ids' => 'required|array',
            'platform_ids.*' => 'exists:platforms,id',
        ]);

        $post = Post::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => $validated['status'],
            'user_id' => auth()->id(),
        ]);

        $post->platforms()->attach($validated['platform_ids'], ['platform_status' => 'pending']);

        return redirect()->route('newFeed')->with('success', 'Post created successfully.');
    }

    public function show(Post $post)
    {
        return $post->load(['user', 'platforms']);
    }

    public function update(Request $request, Post $post)
    {
        $post->update($request->all());

        return response()->json($post);
    }

    public function destroy(Post $post)
    {
        $post->delete();

        return response()->json(['message' => 'Post deleted']);
    }
}
