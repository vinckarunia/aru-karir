<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title')</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
            width: 100% !important;
            height: 100% !important;
        }
        .wrapper {
            background-color: #f8fafc;
            width: 100%;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid #f1f5f9;
        }
        .header {
            background-color: #ffffff;
            padding: 32px;
            text-align: center;
            border-bottom: 1px solid #f1f5f9;
        }
        .logo {
            font-size: 24px;
            font-weight: 300;
            color: #1e293b;
            text-decoration: none;
        }
        .logo-bold {
            font-weight: 700;
            color: #8B2E8B;
        }
        .content {
            padding: 32px;
            line-height: 1.6;
        }
        .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #f1f5f9;
        }
        h1 {
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 16px;
        }
        p {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 15px;
            color: #475569;
        }
        .button {
            display: inline-block;
            background-color: #8B2E8B;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            font-weight: 600;
            font-size: 14px;
            border-radius: 8px;
            margin: 16px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #6d1f6d;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-primary {
            background-color: #fdf8ff;
            color: #8B2E8B;
            border: 1px solid #f5e6f5;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }
        .details-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        .details-table td.label {
            color: #64748b;
            font-weight: 500;
            width: 35%;
        }
        .details-table td.value {
            color: #1e293b;
            font-weight: 600;
        }
        .divider {
            height: 1px;
            background-color: #f1f5f9;
            margin: 24px 0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">
                    ARU<span class="logo-bold">Karir</span>
                </div>
            </div>
            <div class="content">
                @yield('content')
            </div>
            <div class="footer">
                <p style="margin-bottom: 8px; font-size: 12px; color: #64748b;">
                    Email ini dikirim secara otomatis oleh sistem ARUKarir PT Alfa Reka Usaha. Mohon tidak membalas email ini secara langsung.
                </p>
                <p style="margin-bottom: 0; font-size: 12px; color: #94a3b8;">
                    &copy; {{ date('Y') }} PT Alfa Reka Usaha. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
