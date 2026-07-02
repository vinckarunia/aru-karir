@extends('emails.layout')

@section('title', 'Undangan Interview Pekerjaan')

@section('content')
    <h1>Halo, {{ $candidate->name }}!</h1>
    <p>Selamat! Lamaran Anda untuk posisi <strong>{{ $jobListing->title }}</strong> telah terpilih untuk melanjutkan ke tahap wawancara (interview). Berikut adalah rincian jadwal interview Anda:</p>

    <table class="details-table">
        <tr>
            <td class="label">Posisi</td>
            <td class="value">{{ $jobListing->title }}</td>
        </tr>
        <tr>
            <td class="label">Tipe Interview</td>
            <td class="value"><span class="badge badge-primary">{{ $stageName === 'interview_hr' ? 'Interview HR' : 'Interview Client' }}</span></td>
        </tr>
        @if(!empty($scheduleNotes))
            <tr>
                <td class="label">Jadwal & Catatan</td>
                <td class="value">{{ $scheduleNotes }}</td>
            </tr>
        @endif
    </table>

    <p>Mohon konfirmasikan kehadiran Anda atau lakukan koordinasi lebih lanjut melalui halaman detail lamaran di portal ARUKarir.</p>

    <div style="text-align: center;">
        <a href="{{ route('candidate.applications.index') }}" class="button">Lihat Detail & Konfirmasi</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">Harap persiapkan diri Anda dengan baik dan hadir tepat waktu sesuai jadwal yang telah ditentukan.</p>
@endsection
