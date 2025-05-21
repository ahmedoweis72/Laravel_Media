<?php

use App\Http\Controllers\LoginController;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Route;

Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
