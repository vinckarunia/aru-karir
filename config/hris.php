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

];
