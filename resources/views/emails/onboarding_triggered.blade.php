@extends('emails.layout')

@section('title', 'Notifikasi Onboarding Kandidat Baru')

@section('content')
    <h1>Halo, Tim HRIS!</h1>
    <p>Kami ingin menginformasikan bahwa proses rekrutmen untuk kandidat berikut telah selesai, dan data onboarding telah berhasil dikirimkan ke sistem HRIS:</p>

    <table class="details-table">
        <tr>
            <td class="label">Nama Karyawan</td>
            <td class="value">{{ $candidate->name }}</td>
        </tr>
        <tr>
            <td class="label">Nomor KTP (NIK)</td>
            <td class="value">{{ $candidate->ktp_number ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Email Karyawan</td>
            <td class="value">{{ $candidate->email }}</td>
        </tr>
        <tr>
            <td class="label">Project Terkait</td>
            <td class="value">{{ $jobListing->title }} (Project Link: {{ $jobListing->hris_project_id ?? '-' }})</td>
        </tr>
        <tr>
            <td class="label">Tanggal Onboarding</td>
            <td class="value">{{ now()->locale('id')->isoFormat('LL') }}</td>
        </tr>
    </table>

    <p>Silakan tinjau dan lakukan aktivasi akun karyawan atau persetujuan data request di panel administrasi HRIS untuk melanjutkan proses penempatan.</p>

    <div style="text-align: center;">
        <a href="{{ config('hris.api_url', 'http://localhost') }}" class="button">Buka Sistem HRIS</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">Gunakan detail data di atas untuk sinkronisasi payroll dan administrasi BPJS Ketenagakerjaan/Kesehatan.</p>
@endsection
