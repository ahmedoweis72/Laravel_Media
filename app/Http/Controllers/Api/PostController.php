<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        return Post::with(['user', 'platforms'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'image_url' => 'nullable|string',
            'scheduled_time' => 'nullable|date',
            'status' => 'required|in:draft,scheduled,published',
            'user_id' => 'required|exists:users,id',
        ]);

        $post = Post::create($validated);

        return response()->json($post, 201);
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
