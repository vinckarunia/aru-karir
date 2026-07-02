<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'ARUKarir') }}</title>

        <!-- Favicon with dark mode support -->
        <link rel="icon" href="/favicon.ico" media="(prefers-color-scheme: light)">
        <link rel="icon" href="/favicon-dark.ico" media="(prefers-color-scheme: dark)">

        <!-- Iconify for Solar icon pack -->
        <script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"></script>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
