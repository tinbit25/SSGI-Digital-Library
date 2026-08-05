<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ResourceController;
use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\PdfStreamController;
use App\Http\Controllers\API\SearchController;
use App\Http\Controllers\API\FeedbackController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\AdminUserController;
use App\Http\Controllers\API\AdminReportController;

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

// ─── Public Read-Only Routes ─────────────────────────────────────────────────
Route::get('/categories',           [CategoryController::class, 'index']);
Route::get('/resources',            [ResourceController::class, 'index']);
Route::get('/resources/search',     [SearchController::class, 'index']);
Route::get('/search',               [SearchController::class, 'index']);
Route::get('/resources/{resource}', [ResourceController::class, 'show']);

// ─── AI Services ─────────────────────────────────────────────────────────────
Route::post('/ai/chat',      [ChatController::class, 'chat']);
Route::post('/ai/recommend', [ChatController::class, 'recommend']);
Route::post('/ai/search',    [ChatController::class, 'recommend']);
Route::post('/ai/summary',   [ChatController::class, 'summary']);

// ─── Authenticated Routes ────────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    // Auth
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::get('/profile',  [AuthController::class, 'profile']);
    Route::get('/me',       [AuthController::class, 'profile']);

    // PDF Viewer Stream Endpoint (Protected via Sanctum & ResourcePolicy)
    Route::get('/resources/{resource}/viewer', [PdfStreamController::class, 'show']);

    // Feedback Submissions
    Route::post('/feedback', [FeedbackController::class, 'store']);
    Route::get('/feedback',  [FeedbackController::class, 'index']);

    // Notifications
    Route::get('/notifications',                    [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    // ─── Librarian + Administrator — Category & Resource management ──────────
    Route::middleware(['role:Administrator|Librarian'])->group(function () {
        Route::post('/categories',            [CategoryController::class, 'store']);
        Route::put('/categories/{category}',  [CategoryController::class, 'update']);

        Route::post('/resources',             [ResourceController::class, 'store']);
        Route::put('/resources/{resource}',   [ResourceController::class, 'update']);

        Route::get('/admin/feedback',         [FeedbackController::class, 'index']);
        Route::put('/feedback/{feedback}',    [FeedbackController::class, 'update']);

        Route::get('/admin/reports',             [AdminReportController::class, 'index']);
        Route::get('/admin/reports/access-logs', [AdminReportController::class, 'accessLogs']);
    });

    // ─── Administrator only — Admin User & Permanent Deletions ───────────────
    Route::middleware(['role:Administrator'])->group(function () {
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        Route::delete('/resources/{resource}',  [ResourceController::class, 'destroy']);

        Route::get('/admin/users',              [AdminUserController::class, 'index']);
        Route::put('/admin/users/{user}/role',  [AdminUserController::class, 'updateRole']);
        Route::delete('/admin/users/{user}',    [AdminUserController::class, 'destroy']);
    });
});
