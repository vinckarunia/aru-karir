<?php

use App\Http\Controllers\Hr\AuthController as HrAuthController;
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

Route::prefix('kandidat')->group(function () {
    Route::middleware('guest:candidate')->group(function () {
        Route::get('/login', function () {
            return Inertia::render('Candidate/Auth/Login');
        })->name('candidate.login');

        Route::get('/register', function () {
            return Inertia::render('Candidate/Auth/Register');
        })->name('candidate.register');
    });
});

/*
|--------------------------------------------------------------------------
| Candidate Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::prefix('kandidat')->middleware('auth.candidate')->group(function () {
    Route::get('/profil', function () {
        return Inertia::render('Candidate/Profile/Edit');
    })->name('candidate.profile.edit');

    Route::get('/lamaran', function () {
        return Inertia::render('Candidate/Application/Index');
    })->name('candidate.applications.index');

    Route::post('/apply/{id}', function () {
        return redirect()->back();
    })->name('candidate.apply');
});

/*
|--------------------------------------------------------------------------
| HR Auth Routes
|--------------------------------------------------------------------------
*/

Route::prefix('hr')->group(function () {
    Route::middleware('guest:hr')->group(function () {
        Route::get('/login', [HrAuthController::class, 'showLogin'])->name('hr.login');
        Route::post('/login', [HrAuthController::class, 'login']);
    });
});

/*
|--------------------------------------------------------------------------
| HR Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::prefix('hr')->middleware('auth.hr')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Hr/Dashboard');
    })->name('hr.dashboard');

    Route::get('/lowongan', [JobListingController::class, 'index'])->name('hr.lowongan.index');
    Route::get('/lowongan/create', [JobListingController::class, 'create'])->name('hr.lowongan.create');
    Route::post('/lowongan', [JobListingController::class, 'store'])->name('hr.lowongan.store');
    Route::get('/lowongan/{id}/edit', [JobListingController::class, 'edit'])->name('hr.lowongan.edit');
    Route::put('/lowongan/{id}', [JobListingController::class, 'update'])->name('hr.lowongan.update');
    Route::patch('/lowongan/{id}/toggle', [JobListingController::class, 'toggleStatus'])->name('hr.lowongan.toggle');
    Route::get('/pipeline/{id}', function () {
        return redirect()->back();
    })->name('hr.pipeline');
    Route::post('/logout', [HrAuthController::class, 'logout'])->name('hr.logout');
});

/*
|--------------------------------------------------------------------------
| Admin Routes (HR guard + admin role)
|--------------------------------------------------------------------------
*/

Route::prefix('hr/admin')->middleware('auth.hr:admin')->group(function () {
    Route::get('/users', function () {
        return Inertia::render('Hr/Admin/Users/Index');
    })->name('admin.users.index');

    Route::get('/categories', function () {
        return Inertia::render('Hr/Admin/Categories/Index');
    })->name('admin.categories.index');

    Route::get('/config', function () {
        return Inertia::render('Hr/Admin/Config/Index');
    })->name('admin.config.index');
});
