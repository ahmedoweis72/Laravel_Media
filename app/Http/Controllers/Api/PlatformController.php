<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use Illuminate\Http\Request;

class PlatformController extends Controller
{
    public function index()
    {
        return Platform::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|string',
        ]);

        $platform = Platform::create($validated);

        return response()->json($platform, 201);
    }

    public function show(Platform $platform)
    {
        return $platform->load('posts');
    }

    public function update(Request $request, Platform $platform)
    {
        $platform->update($request->all());

        return response()->json($platform);
    }

    public function destroy(Platform $platform)
    {
        $platform->delete();

        return response()->json(['message' => 'Platform deleted']);
    }
}
