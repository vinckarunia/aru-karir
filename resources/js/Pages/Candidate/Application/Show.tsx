import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CandidateLayout from '@/Layouts/CandidateLayout';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface JobListing {
    id: string;
    title: string;
    slug: string;
    location: string;
    contract_type: string;
    categories: Category[];
}

interface ApplicationStage {
    id: number;
    application_id: string;
    stage_name: 'apply' | 'screening' | 'interview_hr' | 'interview_client' | 'offering' | 'onboarding';
    status: 'in_progress' | 'passed' | 'failed' | 'no_show' | 'rescheduled' | 'withdrawn';
    rejection_reason: string | null;
    notes: string | null;
    actioned_at: string | null;
    created_at: string;
}

interface Application {
    id: string;
    job_listing_id: string;
    current_stage: 'apply' | 'screening' | 'interview_hr' | 'interview_client' | 'offering' | 'onboarding';
    current_status: 'in_progress' | 'passed' | 'failed' | 'no_show' | 'rescheduled' | 'withdrawn';
    applied_at: string;
    created_at: string;
    job_listing: JobListing;
    stages: ApplicationStage[];
}

interface Props {
    application: Application;
}

const STAGE_ORDER = ['apply', 'screening', 'interview_hr', 'interview_client', 'offering', 'onboarding'] as const;

type StageName = typeof STAGE_ORDER[number];

interface StageInfo {
    key: StageName;
    label: string;
    icon: string;
    description: string;
}

const STAGES_METADATA: Record<StageName, StageInfo> = {
    apply: {
        key: 'apply',
        label: 'Lamaran Dikirim',
        icon: 'solar:send-square-bold-duotone',
        description: 'Berkas lamaran Anda telah berhasil dikirim dan menunggu verifikasi awal.',
    },
    screening: {
        key: 'screening',
        label: 'Seleksi Berkas (Screening)',
        icon: 'solar:document-text-bold-duotone',
        description: 'Tim rekrutmen sedang meninjau kesesuaian berkas, CV, dan profil Anda.',
    },
    interview_hr: {
        key: 'interview_hr',
        label: 'Wawancara HR',
        icon: 'solar:users-group-rounded-bold-duotone',
        description: 'Sesi wawancara dengan HR recruiter untuk mendalami minat dan kompetensi.',
    },
    interview_client: {
        key: 'interview_client',
        label: 'Wawancara Client / User',
        icon: 'solar:user-speak-bold-duotone',
        description: 'Sesi wawancara teknis/mendalam bersama tim user dari client perusahaan.',
    },
    offering: {
        key: 'offering',
        label: 'Offering Letter',
        icon: 'solar:letter-opened-bold-duotone',
        description: 'Penawaran kerja formal beserta rincian kompensasi dan benefit.',
    },
    onboarding: {
        key: 'onboarding',
        label: 'Onboarding',
        icon: 'solar:stars-line-bold-duotone',
        description: 'Proses pengenalan lingkungan kerja, administrasi masuk, dan mulai bekerja.',
    },
};

export default function Show({ application }: Props) {
    const currentStageIndex = STAGE_ORDER.indexOf(application.current_stage);
    const visibleStages = application.current_status === 'failed'
        ? STAGE_ORDER.slice(0, currentStageIndex + 1)
        : STAGE_ORDER;

    const getStageState = (stage: StageName): 'passed' | 'failed' | 'in_progress' | 'pending' | 'withdrawn' => {
        const stageIndex = STAGE_ORDER.indexOf(stage);
        
        // Find if a historical record exists
        const stageRecord = application.stages.find(s => s.stage_name === stage);
        
        // If candidate withdrew
        if (application.current_status === 'withdrawn' && stageIndex >= currentStageIndex) {
            return stageIndex === currentStageIndex ? 'withdrawn' : 'pending';
        }

        // If current stage
        if (stage === application.current_stage) {
            if (application.current_status === 'failed') return 'failed';
            if (application.current_status === 'passed') return 'passed';
            return 'in_progress';
        }

        // If historical stage
        if (stageIndex < currentStageIndex) {
            if (stageRecord && stageRecord.status === 'failed') return 'failed';
            return 'passed';
        }

        // Future stage
        return 'pending';
    };

    const getStageStatusLabel = (state: 'passed' | 'failed' | 'in_progress' | 'pending' | 'withdrawn') => {
        switch (state) {
            case 'passed': return 'Selesai';
            case 'failed': return 'Gugur';
            case 'in_progress': return 'Sedang Diproses';
            case 'withdrawn': return 'Mengundurkan Diri';
            case 'pending':
            default:
                return 'Belum Mulai';
        }
    };

    return (
        <CandidateLayout title="Detail Progress Lamaran — ARUKarir">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Back & Info Card */}
                <div className="space-y-4">
                    <Link
                        href={route('candidate.applications.index')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer"
                    >
                        <iconify-icon icon="solar:arrow-left-linear" width="18"></iconify-icon>
                        Kembali ke Lamaran Saya
                    </Link>

                    {/* Job Details Banner Card */}
                    <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light">
                                {application.job_listing.contract_type.toUpperCase()}
                            </span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{application.job_listing.title}</h2>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <iconify-icon icon="solar:map-point-linear" width="16"></iconify-icon>
                                {application.job_listing.location}
                            </p>
                        </div>

                        <div className="shrink-0 flex flex-col gap-1 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tanggal Melamar</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {new Date(application.applied_at || application.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Timeline Process */}
                <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Alur Proses Rekrutmen</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Berikut tahapan seleksi yang Anda lalui beserta catatan pendukung dari tim rekrutmen.
                        </p>
                    </div>

                    {/* Vertical Timeline */}
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-800/80 pl-6 sm:pl-8 ml-4 space-y-8">
                        {visibleStages.map((stageName) => {
                            const meta = STAGES_METADATA[stageName];
                            const state = getStageState(stageName);
                            const historyRecords = application.stages.filter(s => s.stage_name === stageName);
                            const meaningfulRecords = historyRecords.filter((record) => {
                                if (record.rejection_reason) return true;
                                const note = record.notes?.trim();
                                return note && ![
                                    'Lamaran dikirim oleh kandidat.',
                                    'Diloloskan ke tahapan berikutnya.',
                                ].includes(note);
                            });
                            
                            // Determine style based on state
                            let iconBgColor = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600';
                            let borderHighlight = 'border-transparent';
                            let titleColor = 'text-slate-400 dark:text-slate-600';

                            if (state === 'passed') {
                                iconBgColor = 'bg-emerald-500 text-white';
                                titleColor = 'text-slate-800 dark:text-slate-200 font-bold';
                            } else if (state === 'failed') {
                                iconBgColor = 'bg-red-500 text-white';
                                borderHighlight = 'border-l-4 border-red-500 pl-3';
                                titleColor = 'text-red-600 dark:text-red-400 font-bold';
                            } else if (state === 'in_progress') {
                                iconBgColor = 'bg-primary text-white shadow-md shadow-primary/20 ring-4 ring-primary/10';
                                borderHighlight = 'border-l-4 border-primary pl-3';
                                titleColor = 'text-primary dark:text-primary-light font-bold';
                            } else if (state === 'withdrawn') {
                                iconBgColor = 'bg-slate-400 text-white';
                                titleColor = 'text-slate-500 dark:text-slate-400 font-bold';
                            }

                            return (
                                <div key={stageName} className={`relative ${borderHighlight} transition-all`}>
                                    {/* Timeline Marker Icon */}
                                    <span className={`absolute -left-[43px] sm:-left-[51px] top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-surface dark:border-dark-bg ${iconBgColor} transition-all`}>
                                        <iconify-icon icon={meta.icon} width="16"></iconify-icon>
                                    </span>

                                    {/* Content Card */}
                                    <div className={`space-y-2`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                            <h4 className={`text-base font-bold ${titleColor}`}>
                                                {meta.label}
                                            </h4>
                                            
                                            {/* Status Badge */}
                                            <div>
                                                {state === 'passed' && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                                                        {getStageStatusLabel(state)}
                                                    </span>
                                                )}
                                                {state === 'failed' && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                                                        {getStageStatusLabel(state)}
                                                    </span>
                                                )}
                                                {state === 'in_progress' && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light animate-pulse">
                                                        {getStageStatusLabel(state)}
                                                    </span>
                                                )}
                                                {state === 'withdrawn' && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                        {getStageStatusLabel(state)}
                                                    </span>
                                                )}
                                                {state === 'pending' && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">
                                                        {getStageStatusLabel(state)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                                            {meta.description}
                                        </p>

                                        {/* Show only meaningful recruiter notes, not internal audit logs. */}
                                        {meaningfulRecords.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {meaningfulRecords.map((record) => (
                                                    <div key={record.id}>
                                                        {record.notes && !record.rejection_reason && (
                                                            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
                                                                <iconify-icon icon="solar:notes-linear" width="16" className="mt-0.5 shrink-0 text-slate-400"></iconify-icon>
                                                                <div>
                                                                    <p className="whitespace-pre-line font-medium leading-relaxed">{record.notes}</p>
                                                                    {record.actioned_at && (
                                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                                            {new Date(record.actioned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {record.rejection_reason && (
                                                            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50/60 px-3 py-2.5 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-950/10 dark:text-red-400">
                                                                <iconify-icon icon="solar:danger-triangle-linear" width="16" className="mt-0.5 shrink-0"></iconify-icon>
                                                                <div>
                                                                    <p className="font-bold">Alasan proses dihentikan</p>
                                                                    <p className="mt-0.5 whitespace-pre-line leading-relaxed">{record.rejection_reason}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </CandidateLayout>
    );
}
