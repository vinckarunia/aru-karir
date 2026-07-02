@extends('emails.layout')

@section('title', 'Penawaran Kerja Terkirim')

@section('content')
    <h1>Halo, {{ $candidate->name }}!</h1>
    <p>Selamat! Kami dengan senang hati menawarkan Anda kesempatan untuk bergabung dengan PT Alfa Reka Usaha untuk posisi <strong>{{ $jobListing->title }}</strong>.</p>

    <p>Surat penawaran resmi (Offering Letter) beserta rincian hak, kewajiban, dan kompensasi Anda telah kami unggah ke akun portal Anda. Silakan pelajari dokumen tersebut.</p>

    <table class="details-table">
        <tr>
            <td class="label">Posisi Penawaran</td>
            <td class="value">{{ $jobListing->title }}</td>
        </tr>
        <tr>
            <td class="label">Status Lamaran</td>
            <td class="value"><span class="badge badge-primary">Offering (Penawaran)</span></td>
        </tr>
    </table>

    @if(!empty($notes))
        <div style="background-color: #f8fafc; border-left: 4px solid #8B2E8B; padding: 16px; margin: 20px 0; border-radius: 4px; font-style: italic;">
            <p style="margin: 0; font-size: 14px; color: #475569;">"{{ $notes }}"</p>
        </div>
    @endif

    <p>Anda diharapkan untuk memberikan konfirmasi persetujuan (Terima/Tolak) terhadap penawaran ini langsung melalui dashboard kandidat secepatnya.</p>

    <div style="text-align: center;">
        <a href="{{ route('candidate.applications.index') }}" class="button">Review Surat Penawaran</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">Apabila Anda memerlukan klarifikasi mengenai dokumen penawaran tersebut, jangan ragu untuk menghubungi tim HR kami.</p>
@endsection
