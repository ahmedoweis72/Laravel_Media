<?php

use App\Http\Controllers\Api\PlatformController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostPlatformController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LoginController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('posts', PostController::class);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('platforms', PlatformController::class);
    Route::apiResource('post-platforms', PostPlatformController::class);
});
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
