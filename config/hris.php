<?php

return [

    /*
    |--------------------------------------------------------------------------
    | HRIS Integration
    |--------------------------------------------------------------------------
    |
    | Configuration for internal API communication with ARU HRIS.
    | Used for project synchronization and candidate onboarding.
    |
    */

    'api_url' => env('HRIS_API_URL'),
    'api_key' => env('HRIS_API_KEY'),

    // Enable mock mode when HRIS is unreachable (for development)
    'mock_mode' => env('HRIS_MOCK_MODE', true),

    // Email address of the HRIS HR team for onboarding notifications
    'hr_email' => env('HRIS_HR_EMAIL', 'admin@aru.co.id'),

];
