<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Platform;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostWebController extends Controller
{
    public function index()
    {
        return Inertia::render('Posts/Index', [
            'posts' => Post::with(['user', 'platforms'])->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Posts/PostForm', [
            'platforms' => Platform::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,scheduled',
            'platform_ids' => 'required|array',
            'platform_ids.*' => 'exists:platforms,id',
            'scheduled_at' => 'nullable|date|after:now',
            'image_url' => 'nullable|string',
        ]);

        $post = Post::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => $validated['status'],
            'scheduled_at' => $validated['status'] === 'scheduled' ? $request->input('scheduled_at') : null,
            'image_url' => $request->input('image_url'),
            'user_id' => auth()->id(),
        ]);

        $platformData = [];
        foreach ($validated['platform_ids'] as $platformId) {
            $platformData[$platformId] = ['platform_status' => 'pending'];
        }
        $post->platforms()->attach($platformData);

        return redirect()->route('newFeed')->with('success', 'Post created.');
    }

    public function edit(Post $post)
    {
        return Inertia::render('Posts/PostForm', [
            'post' => $post->load('platforms'),
            'platforms' => Platform::all(),
        ]);
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,scheduled',
            'platform_ids' => 'required|array',
            'platform_ids.*' => 'exists:platforms,id',
            'scheduled_at' => 'nullable|date|after:now',
            'image_url' => 'nullable|string',
        ]);

        $post->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => $validated['status'],
            'scheduled_at' => $validated['status'] === 'scheduled' ? $request->input('scheduled_at') : null,
            'image_url' => $request->input('image_url'),
        ]);

        $platformData = [];
        foreach ($validated['platform_ids'] as $platformId) {
            $platformData[$platformId] = ['platform_status' => $validated['status']];
        }
        $post->platforms()->sync($platformData);

        return redirect()->route('newFeed')->with('success', 'Post updated.');
    }

    public function destroy(Post $post)
    {
        $post->delete();

        return redirect('/newFeed')->with('success', 'Post deleted.');
    }

    public function show($id)
    {
        $post = Post::with(['user', 'platforms'])->findOrFail($id);

        return Inertia::render('Posts/Show', [
            'post' => $post,
            'authUser' => auth()->user(),
        ]);
    }
}
