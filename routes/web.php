<?php

use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\PlatformWebController;
use App\Http\Controllers\PostWebController;
use App\Http\Controllers\ProfileController;
use App\Models\Post;
use App\Models\Platform;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Home', [
        'posts' => Post::with(['user', 'platforms'])->get(),
        'authUser' => Auth::check() ? Auth::user() : null,
    ]);
})->name('home');

Route::middleware(['auth'])->get('/newFeed', function () {
    return Inertia::render('NewFeed', [
        'posts' => Post::with(['user', 'platforms'])->get(),
    ]);
})->name('newFeed');

Route::middleware(['auth'])->get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'initialPosts' => Post::with(['user', 'platforms'])->get(),
        'platforms' => Platform::all(),
    ]);
})->name('dashboard');

Route::middleware(['auth'])->get('/settings', function () {
    return Inertia::render('Settings', [
        'initialPlatforms' => Platform::all(),
    ]);
})->name('settings');


// List posts
Route::get('/posts', [PostWebController::class, 'index'])->name('posts.index');

// Show create form
Route::get('/posts/create', [PostWebController::class, 'create'])->middleware('auth')->name('posts.create');

// Store new post
Route::post('/posts', [PostWebController::class, 'store'])->middleware('auth')->name('posts.store');

// Show single post
Route::get('/posts/{post}', [PostWebController::class, 'show'])->name('posts.show');

// Show edit form
Route::get('/posts/{post}/edit', [PostWebController::class, 'edit'])->middleware('auth')->name('posts.edit');

// Update post
Route::put('/posts/{post}', [PostWebController::class, 'update'])->middleware('auth')->name('posts.update');

// Delete post
Route::delete('/posts/{post}', [PostWebController::class, 'destroy'])->middleware('auth')->name('posts.destroy');

Route::middleware(['auth'])->group(function () {
    Route::resource('platforms', PlatformWebController::class)->except(['show', 'create']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
