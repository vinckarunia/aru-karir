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

interface Application {
    id: string;
    job_listing_id: string;
    current_stage: 'apply' | 'screening' | 'interview_hr' | 'interview_client' | 'offering' | 'onboarding';
    current_status: 'in_progress' | 'passed' | 'failed' | 'no_show' | 'rescheduled' | 'withdrawn';
    applied_at: string;
    created_at: string;
    job_listing: JobListing;
}

interface Props {
    applications: Application[];
}

export default function Index({ applications }: Props) {
    const getStageLabel = (stage: string) => {
        const stages: Record<string, string> = {
            apply: 'Lamaran Dikirim',
            screening: 'Seleksi Berkas (Screening)',
            interview_hr: 'Wawancara HR',
            interview_client: 'Wawancara Client',
            offering: 'Offering Letter',
            onboarding: 'Onboarding',
        };
        return stages[stage] || stage;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'passed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Lolos Tahap Ini
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Gugur
                    </span>
                );
            case 'withdrawn':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Mengundurkan Diri
                    </span>
                );
            case 'in_progress':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Sedang Diproses
                    </span>
                );
        }
    };

    const getContractTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            pkwt: 'PKWT',
            pkwtt: 'PKWTT',
            freelance: 'Freelance',
        };
        return types[type] || type;
    };

    return (
        <CandidateLayout title="Lamaran Saya — ARUKarir">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lamaran Saya</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Pantau status lamaran kerja Anda secara berkala di sini.
                    </p>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-12 text-center border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
                            <iconify-icon icon="solar:folder-error-bold-duotone" width="32"></iconify-icon>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum Ada Lamaran</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                Anda belum pernah mengirimkan lamaran pekerjaan. Temukan berbagai peluang karir menarik sekarang.
                            </p>
                        </div>
                        <div className="pt-2">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg cursor-pointer"
                            >
                                <iconify-icon icon="solar:magnifer-linear" width="18"></iconify-icon>
                                Cari Lowongan Pekerjaan
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {applications.map((app) => (
                            <div
                                key={app.id}
                                className="bg-white dark:bg-dark-surface/20 rounded-3xl p-5 sm:p-6 border border-slate-200/60 dark:border-slate-800/60 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="space-y-3">
                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {app.job_listing.categories.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light"
                                            >
                                                {cat.name}
                                            </span>
                                        ))}
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {getContractTypeLabel(app.job_listing.contract_type)}
                                        </span>
                                    </div>

                                    {/* Title & Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                                            <Link href={route('job.detail', app.job_listing.slug)}>{app.job_listing.title}</Link>
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                                            <span className="flex items-center gap-1">
                                                <iconify-icon icon="solar:map-point-linear" width="14"></iconify-icon>
                                                {app.job_listing.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <iconify-icon icon="solar:calendar-date-linear" width="14"></iconify-icon>
                                                Dilamar pada {new Date(app.applied_at || app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0 shrink-0">
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status Lowongan</p>
                                        <div className="space-y-1.5">
                                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Tahap: <span className="font-bold text-primary dark:text-primary-light">{getStageLabel(app.current_stage)}</span>
                                            </div>
                                            <div>{getStatusBadge(app.current_status)}</div>
                                        </div>
                                    </div>

                                    <Link
                                        href={route('candidate.applications.show', app.id)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light hover:bg-primary/5 transition-all cursor-pointer"
                                    >
                                        Detail Progress
                                        <iconify-icon icon="solar:arrow-right-linear" width="14"></iconify-icon>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CandidateLayout>
    );
}
