<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserPlatformController extends Controller
{
    /**
     * Get all active platforms for the authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        
        // If we have a user_platform table in the future, we could use that relationship
        // For now, we'll just return all platforms with a flag
        // This is a placeholder for future implementation
        
        $platforms = Platform::all()->map(function($platform) use ($user) {
            // Logic to determine if platform is active for user
            // This would be replaced with actual relationship data
            $platform->is_active = true; // Placeholder - all platforms active by default
            return $platform;
        });
        
        return response()->json(['platforms' => $platforms]);
    }
    
    /**
     * Toggle active status of a platform for the authenticated user
     */
    public function toggle(Request $request, Platform $platform)
    {
        $user = Auth::user();
        
        // Validate request
        $request->validate([
            'is_active' => 'required|boolean',
        ]);
        
        $isActive = $request->input('is_active');
        
        // In a full implementation, this would update a user_platform pivot table
        // For demonstration, we'll just return success
        
        return response()->json([
            'message' => 'Platform status updated successfully',
            'platform_id' => $platform->id,
            'is_active' => $isActive,
        ]);
    }
} 