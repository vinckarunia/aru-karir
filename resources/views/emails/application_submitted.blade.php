@extends('emails.layout')

@section('title', 'Lamaran Terkirim')

@section('content')
    <h1>Halo, {{ $candidate->name }}!</h1>
    <p>Terima kasih telah melamar pekerjaan di PT Alfa Reka Usaha. Lamaran Anda untuk posisi berikut telah berhasil kami terima:</p>

    <table class="details-table">
        <tr>
            <td class="label">Posisi</td>
            <td class="value">{{ $jobListing->title }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal Melamar</td>
            <td class="value">{{ now()->locale('id')->isoFormat('LL') }}</td>
        </tr>
        <tr>
            <td class="label">Status Awal</td>
            <td class="value"><span class="badge badge-primary">Apply (Dalam Proses)</span></td>
        </tr>
    </table>

    <p>Tim HR kami akan segera meninjau berkas lamaran Anda. Anda dapat memantau status perkembangan lamaran Anda secara langsung melalui dashboard kandidat ARUKarir.</p>

    <div style="text-align: center;">
        <a href="{{ route('candidate.applications.index') }}" class="button">Pantau Lamaran Saya</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi tim HR kami.</p>
@endsection
