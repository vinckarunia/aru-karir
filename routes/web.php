<?php

use App\Http\Controllers\Hr\AuthController as HrAuthController;
use App\Http\Controllers\Hr\DashboardController;
use App\Http\Controllers\Hr\PipelineController;
use App\Http\Controllers\JobListingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [JobListingController::class, 'publicIndex'])->name('home');
Route::get('/lowongan/{slug}', [JobListingController::class, 'publicShow'])->name('job.detail');

/*
|--------------------------------------------------------------------------
| Candidate Auth Routes
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Candidate\AuthController as CandidateAuthController;
use App\Http\Controllers\Candidate\ProfileController as CandidateProfileController;
use App\Http\Controllers\Candidate\ApplicationController as CandidateApplicationController;

Route::prefix('kandidat')->group(function () {
    Route::middleware('guest:candidate')->group(function () {
        Route::get('/login', [CandidateAuthController::class, 'showLogin'])->name('candidate.login');
        Route::post('/login', [CandidateAuthController::class, 'login']);

        Route::get('/register', [CandidateAuthController::class, 'showRegister'])->name('candidate.register');
        Route::post('/register', [CandidateAuthController::class, 'register']);

        Route::get('/forgot-password', [CandidateAuthController::class, 'showForgotPassword'])->name('candidate.password.request');
        Route::post('/forgot-password', [CandidateAuthController::class, 'sendResetLink'])->name('candidate.password.email');

        Route::get('/reset-password/{token}', [CandidateAuthController::class, 'showResetPassword'])->name('candidate.password.reset');
        Route::post('/reset-password', [CandidateAuthController::class, 'resetPassword'])->name('candidate.password.update');
    });
});

/*
|--------------------------------------------------------------------------
| Candidate Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::prefix('kandidat')->middleware('auth.candidate')->group(function () {
    Route::post('/logout', [CandidateAuthController::class, 'logout'])->name('candidate.logout');

    Route::get('/profil', [CandidateProfileController::class, 'edit'])->name('candidate.profile.edit');
    Route::post('/profil', [CandidateProfileController::class, 'update'])->name('candidate.profile.update');

    Route::get('/lamaran', [CandidateApplicationController::class, 'index'])->name('candidate.applications.index');
    Route::post('/apply/{id}', [CandidateApplicationController::class, 'store'])->name('candidate.apply');
    Route::get('/lamaran/{id}', [CandidateApplicationController::class, 'show'])->name('candidate.applications.show');
});

/*
|--------------------------------------------------------------------------
| HR Auth Routes
|--------------------------------------------------------------------------
*/

Route::prefix('hr')->group(function () {
    Route::middleware('guest:hr')->group(function () {
        Route::get('/login', [HrAuthController::class, 'showLogin'])->name('hr.login');
        Route::redirect('/', '/hr/login');
        Route::post('/login', [HrAuthController::class, 'login']);
    });
});

/*
|--------------------------------------------------------------------------
| HR Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::prefix('hr')->middleware('auth.hr')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('hr.dashboard');

    Route::get('/lowongan', [JobListingController::class, 'index'])->name('hr.lowongan.index');
    Route::get('/lowongan/create', [JobListingController::class, 'create'])->name('hr.lowongan.create');
    Route::post('/lowongan', [JobListingController::class, 'store'])->name('hr.lowongan.store');
    Route::get('/lowongan/{id}/edit', [JobListingController::class, 'edit'])->name('hr.lowongan.edit');
    Route::put('/lowongan/{id}', [JobListingController::class, 'update'])->name('hr.lowongan.update');
    Route::patch('/lowongan/{id}/toggle', [JobListingController::class, 'toggleStatus'])->name('hr.lowongan.toggle');
    
    // Pipeline routes
    Route::get('/pipeline/{id}', [PipelineController::class, 'index'])->name('hr.pipeline');
    Route::get('/pipeline/lamaran/{id}', [PipelineController::class, 'show'])->name('hr.pipeline.show');
    Route::post('/pipeline/lamaran/{id}/advance', [PipelineController::class, 'advanceStage'])->name('hr.pipeline.advance');
    Route::post('/pipeline/lamaran/{id}/reject', [PipelineController::class, 'rejectStage'])->name('hr.pipeline.reject');
    Route::post('/pipeline/lamaran/{id}/status', [PipelineController::class, 'updateStatus'])->name('hr.pipeline.status');
    Route::post('/pipeline/lamaran/{id}/note', [PipelineController::class, 'addNote'])->name('hr.pipeline.note');
    Route::post('/pipeline/bulk-action', [PipelineController::class, 'bulkAction'])->name('hr.pipeline.bulk');
    
    Route::post('/logout', [HrAuthController::class, 'logout'])->name('hr.logout');
});

use App\Http\Controllers\Hr\Admin\HrUserController;
use App\Http\Controllers\Hr\Admin\JobCategoryController;
use App\Http\Controllers\Hr\Admin\ProfileFieldController;

Route::prefix('hr/admin')->middleware('auth.hr:admin')->group(function () {
    Route::get('/users', [HrUserController::class, 'index'])->name('admin.users.index');
    Route::post('/users', [HrUserController::class, 'store'])->name('admin.users.store');
    Route::put('/users/{id}', [HrUserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{id}', [HrUserController::class, 'destroy'])->name('admin.users.destroy');

    Route::get('/categories', [JobCategoryController::class, 'index'])->name('admin.categories.index');
    Route::post('/categories', [JobCategoryController::class, 'store'])->name('admin.categories.store');
    Route::put('/categories/{id}', [JobCategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('/categories/{id}', [JobCategoryController::class, 'destroy'])->name('admin.categories.destroy');

    Route::get('/config', [ProfileFieldController::class, 'index'])->name('admin.config.index');
    Route::post('/config', [ProfileFieldController::class, 'store'])->name('admin.config.store');
    Route::put('/config/{id}', [ProfileFieldController::class, 'update'])->name('admin.config.update');
    Route::delete('/config/{id}', [ProfileFieldController::class, 'destroy'])->name('admin.config.destroy');
    Route::post('/config/reorder', [ProfileFieldController::class, 'reorder'])->name('admin.config.reorder');
});
