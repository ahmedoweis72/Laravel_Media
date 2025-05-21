<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PostPlatform;
use Illuminate\Http\Request;

class PostPlatformController extends Controller
{
    public function index()
    {
        return PostPlatform::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'platform_id' => 'required|exists:platforms,id',
            'platform_status' => 'nullable|string',
        ]);

        $pp = PostPlatform::create($validated);

        return response()->json($pp, 201);
    }

    public function show(PostPlatform $postPlatform)
    {
        return $postPlatform;
    }

    public function update(Request $request, PostPlatform $postPlatform)
    {
        $postPlatform->update($request->all());

        return response()->json($postPlatform);
    }

    public function destroy(PostPlatform $postPlatform)
    {
        $postPlatform->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
