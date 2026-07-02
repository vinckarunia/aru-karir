<?php

use App\Models\Candidate;
use App\Models\HrUser;

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'candidate'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'candidates'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Dual-guard setup: 'candidate' for public job seekers,
    | 'hr' for internal HR/Admin users.
    |
    */

    'guards' => [
        'candidate' => [
            'driver' => 'session',
            'provider' => 'candidates',
        ],

        'hr' => [
            'driver' => 'session',
            'provider' => 'hr_users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    */

    'providers' => [
        'candidates' => [
            'driver' => 'eloquent',
            'model' => Candidate::class,
        ],

        'hr_users' => [
            'driver' => 'eloquent',
            'model' => HrUser::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    */

    'passwords' => [
        'candidates' => [
            'provider' => 'candidates',
            'table' => 'candidate_password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],

        'hr_users' => [
            'provider' => 'hr_users',
            'table' => 'hr_password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
