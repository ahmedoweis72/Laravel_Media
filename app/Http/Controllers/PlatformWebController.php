<?php

namespace App\Http\Controllers;

use App\Models\Platform;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PlatformWebController extends Controller
{
    // Show all platforms
    public function index()
    {
        $platforms = Platform::latest()->get();

        return Inertia::render('Platforms/Index', [
            'platforms' => $platforms,
        ]);
    }

    // Store new platform
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:platforms,name'],
            'type' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'api_key' => ['nullable', 'string'],
            'api_secret' => ['nullable', 'string'],
            'access_token' => ['nullable', 'string'],
        ]);

        Platform::create($validated);

        return redirect()->back()->with('success', 'Platform created successfully.');
    }

    // Edit page (optional, if needed)
    public function edit(Platform $platform)
    {
        return Inertia::render('Platforms/Edit', [
            'platform' => $platform,
        ]);
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
            'is_active' => ['boolean'],
            'api_key' => ['nullable', 'string'],
            'api_secret' => ['nullable', 'string'],
            'access_token' => ['nullable', 'string'],
        ]);

        $platform->update($validated);

        return redirect()->back()->with('success', 'Platform updated successfully.');
    }

    // Delete a platform
    public function destroy(Platform $platform)
    {
        $platform->delete();

        return redirect()->back()->with('success', 'Platform deleted successfully.');
    }
}
    