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
        icon: 'solar:document-filter-bold-duotone',
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
                        {STAGE_ORDER.map((stageName, idx) => {
                            const meta = STAGES_METADATA[stageName];
                            const state = getStageState(stageName);
                            const historyRecords = application.stages.filter(s => s.stage_name === stageName);
                            
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

                                        {/* Historical Audit Notes / Logs */}
                                        {historyRecords.length > 0 && (
                                            <div className="mt-3 bg-slate-50 dark:bg-dark-surface/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 space-y-3">
                                                {historyRecords.map((record, rIdx) => (
                                                    <div key={record.id} className={`text-xs ${rIdx > 0 ? 'border-t border-slate-100 dark:border-slate-800/50 pt-2.5 mt-2.5' : ''}`}>
                                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                            <span>Log Pembaharuan</span>
                                                            <span>{record.actioned_at ? new Date(record.actioned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                        </div>
                                                        {record.notes && (
                                                            <p className="text-slate-600 dark:text-slate-300 font-semibold mt-1 leading-normal whitespace-pre-line">
                                                                {record.notes}
                                                            </p>
                                                        )}
                                                        {record.status === 'failed' && record.rejection_reason && (
                                                            <div className="mt-2 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/10 p-2.5 rounded-xl border border-red-100 dark:border-red-900/20 font-bold">
                                                                Alasan Gugur: {record.rejection_reason}
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
