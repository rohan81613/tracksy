<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RenewalController;
use App\Http\Controllers\VendorEntryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Tracksy
|--------------------------------------------------------------------------
*/

// ── Public auth routes ────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ── Protected routes (require Sanctum token) ─────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',          [AuthController::class, 'logout']);
        Route::get('/me',               [AuthController::class, 'me']);
        Route::put('/profile',          [AuthController::class, 'updateProfile']);
        Route::put('/change-password',  [AuthController::class, 'changePassword']);
    });

    // Renewals
    Route::prefix('renewals')->group(function () {
        Route::get('/',             [RenewalController::class, 'index']);
        Route::post('/',            [RenewalController::class, 'store']);
        Route::get('/stats',        [RenewalController::class, 'stats']);
        Route::post('/import',      [RenewalController::class, 'bulkImport']);

        // Vendor Entries — must be before /{renewal} catch-all
        Route::get('/{renewal}/vendor-entries',            [VendorEntryController::class, 'index']);
        Route::post('/{renewal}/vendor-entries',           [VendorEntryController::class, 'store']);
        Route::put('/{renewal}/vendor-entries/{entry}',    [VendorEntryController::class, 'update']);
        Route::delete('/{renewal}/vendor-entries/{entry}', [VendorEntryController::class, 'destroy']);

        // Single renewal CRUD
        Route::get('/{renewal}',    [RenewalController::class, 'show']);
        Route::put('/{renewal}',    [RenewalController::class, 'update']);
        Route::delete('/{renewal}', [RenewalController::class, 'destroy']);
    });

    // Categories
    Route::prefix('categories')->group(function () {
        Route::get('/',          [CategoryController::class, 'index']);
        Route::post('/',         [CategoryController::class, 'store']);
        Route::delete('/{name}', [CategoryController::class, 'destroy']);
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
});
