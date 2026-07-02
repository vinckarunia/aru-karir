@extends('emails.layout')

@section('title', 'Pembaruan Status Lamaran')

@section('content')
    <h1>Halo, {{ $candidate->name }}!</h1>
    <p>Kami ingin menginformasikan pembaruan terkini mengenai status lamaran pekerjaan Anda untuk posisi <strong>{{ $jobListing->title }}</strong>:</p>

    <table class="details-table">
        <tr>
            <td class="label">Posisi</td>
            <td class="value">{{ $jobListing->title }}</td>
        </tr>
        <tr>
            <td class="label">Tahapan Saat Ini</td>
            <td class="value"><span class="badge badge-primary">{{ strtoupper($stageName) }}</span></td>
        </tr>
        <tr>
            <td class="label">Status Baru</td>
            <td class="value">
                @if($status === 'passed')
                    <span class="badge" style="background-color: #ecfdf5; color: #059669; border: 1px solid #d1fae5;">Lolos Tahapan</span>
                @elseif($status === 'failed')
                    <span class="badge" style="background-color: #fef2f2; color: #dc2626; border: 1px solid #fee2e2;">Tidak Lolos</span>
                @else
                    <span class="badge" style="background-color: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">{{ strtoupper($status) }}</span>
                @endif
            </td>
        </tr>
    </table>

    @if(!empty($notes))
        <div style="background-color: #f8fafc; border-left: 4px solid #8B2E8B; padding: 16px; margin: 20px 0; border-radius: 4px; font-style: italic;">
            <p style="margin: 0; font-size: 14px; color: #475569;">"{{ $notes }}"</p>
        </div>
    @endif

    @if($status === 'failed')
        <p>Terima kasih atas minat dan partisipasi Anda dalam proses rekrutmen di PT Alfa Reka Usaha. Meskipun saat ini kualifikasi Anda belum sesuai dengan kebutuhan posisi ini, profil Anda akan tetap tersimpan di database kami untuk peluang karir di masa mendatang.</p>
    @else
        <p>Silakan kunjungi dashboard kandidat Anda untuk informasi detail lebih lanjut mengenai langkah atau tahapan berikutnya.</p>
        <div style="text-align: center;">
            <a href="{{ route('candidate.applications.index') }}" class="button">Pantau Dashboard Lamaran</a>
        </div>
    @endif

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">Hormat kami,<br>Tim Rekrutmen PT Alfa Reka Usaha</p>
@endsection
