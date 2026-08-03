<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ResourceController;
use App\Http\Controllers\API\SearchController;

/*
|--------------------------------------------------------------------------
| API Routes — SSGI Digital Library Portal
|--------------------------------------------------------------------------
*/

// Public Health Check
Route::get('/health', function () {
    return response()->json([
        'status'    => 'ok',
        'system'    => 'SSGI Digital Library Portal API',
        'version'   => '1.0.0',
        'timestamp' => now()->toISOString(),
    ]);
});

// ─── Authentication ─────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ─── Public Read-Only Routes (no auth required) ──────────────────────────────
Route::get('/categories',              [CategoryController::class, 'index']);
Route::get('/resources',               [ResourceController::class, 'index']);
Route::get('/resources/{resource}',    [ResourceController::class, 'show']);

// ─── Authenticated Routes ────────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    // Auth
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::get('/profile',  [AuthController::class, 'profile']);

    // ─── Librarian + Administrator — Category management ─────────────────────
    Route::middleware(['role:Administrator|Librarian'])->group(function () {
        Route::post('/categories',               [CategoryController::class, 'store']);
        Route::put('/categories/{category}',     [CategoryController::class, 'update']);
    });

    // ─── Administrator only — Delete categories ───────────────────────────────
    Route::middleware(['role:Administrator'])->group(function () {
        Route::delete('/categories/{category}',  [CategoryController::class, 'destroy']);
    });

    // ─── Librarian + Administrator — Resource management ─────────────────────
    Route::middleware(['role:Administrator|Librarian'])->group(function () {
        Route::post('/resources',                [ResourceController::class, 'store']);
        Route::put('/resources/{resource}',      [ResourceController::class, 'update']);
    });

    // ─── Administrator only — Delete resources ────────────────────────────────
    Route::middleware(['role:Administrator'])->group(function () {
        Route::delete('/resources/{resource}',   [ResourceController::class, 'destroy']);
    });
});
