<?php

namespace App\Http\Controllers;

use Illuminate\Validation\Rule;
use App\Models\Platform;
use Illuminate\Http\Request;

class PlatformController extends Controller
{
     public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:platforms,name'],
            'type' => ['nullable', 'string', 'max:255'],
        ]);

        $platform = Platform::create($validated);

        return response()->json([
            'message' => 'Platform created successfully',
            'platform' => $platform,
        ], 201);
    }

    // Update existing platform
    public function update(Request $request, Platform $platform)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('platforms')->ignore($platform->id),
            ],
            'type' => ['nullable', 'string', 'max:255'],
        ]);

        $platform->update($validated);

        return response()->json([
            'message' => 'Platform updated successfully',
            'platform' => $platform,
        ]);
    }

    // Delete platform
    public function destroy(Platform $platform)
    {
        $platform->delete();

        return response()->json([
            'message' => 'Platform deleted successfully',
        ]);
    }
}