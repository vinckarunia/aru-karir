@extends('emails.layout')

@section('title', 'Lamaran Baru Diterima')

@section('content')
    <h1>Halo, {{ $hrUser->name }}!</h1>
    <p>Ada lamaran baru masuk untuk lowongan pekerjaan yang Anda buat:</p>

    <table class="details-table">
        <tr>
            <td class="label">Posisi Lowongan</td>
            <td class="value">{{ $jobListing->title }}</td>
        </tr>
        <tr>
            <td class="label">Nama Pelamar</td>
            <td class="value">{{ $candidate->name }}</td>
        </tr>
        <tr>
            <td class="label">Email Pelamar</td>
            <td class="value">{{ $candidate->email }}</td>
        </tr>
        <tr>
            <td class="label">Pendidikan Terakhir</td>
            <td class="value">{{ $candidate->education_level ?? '-' }}</td>
        </tr>
    </table>

    <p>Silakan tinjau profil dan dokumen CV pelamar ini di halaman recruitment pipeline Admin/HR portal.</p>

    <div style="text-align: center;">
        <a href="{{ route('hr.pipeline', $jobListing->id) }}" class="button">Lihat Recruitment Pipeline</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">Gunakan dashboard untuk memproses kandidat ini ke tahapan selanjutnya (Screening, Interview, dll.).</p>
@endsection
