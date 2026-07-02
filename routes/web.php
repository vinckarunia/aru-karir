<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Public/Home');
})->name('home');

Route::get('/lowongan/{slug}', function (string $slug) {
    return Inertia::render('Public/JobDetail', ['slug' => $slug]);
})->name('job.detail');

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
});

/*
|--------------------------------------------------------------------------
| HR Auth Routes
|--------------------------------------------------------------------------
*/

Route::prefix('hr')->group(function () {
    Route::middleware('guest:hr')->group(function () {
        Route::get('/login', function () {
            return Inertia::render('Hr/Auth/Login');
        })->name('hr.login');
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

    Route::get('/lowongan', function () {
        return Inertia::render('Hr/JobListing/Index');
    })->name('hr.lowongan.index');
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
