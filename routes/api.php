<?php

use App\Http\Controllers\Api\PlatformController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostPlatformController;
use App\Http\Controllers\Api\UserPlatformController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Platform routes
    Route::apiResource('platforms', PlatformController::class);
    
    // Post routes
    Route::apiResource('posts', PostController::class); 
    Route::get('/posts/filter/status/{status}', [PostController::class, 'filterByStatus']);
    Route::get('/posts/filter/date/{date}', [PostController::class, 'filterByDate']);
    
    // Post-Platform routes
    Route::apiResource('post-platforms', PostPlatformController::class);
    
    // User-Platform routes
    Route::get('/user/platforms', [UserPlatformController::class, 'index']);
    Route::post('/user/platforms/{platform}/toggle', [UserPlatformController::class, 'toggle']);
});
