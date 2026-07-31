import { Head, Link } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Application } from '@/types';

interface DashboardStats {
    active_listings: number;
    total_applications: number;
    unread_applications: number;
    accepted_candidates: number;
}

interface Props {
    stats: DashboardStats;
    unreadApplications: Application[];
}

const stageLabels: Record<string, string> = {
    apply: 'Pendaftaran',
    screening: 'Screening',
    interview_hr: 'Interview HR',
    interview_client: 'Interview Klien',
    offering: 'Offering',
    onboarding: 'Onboarding',
};

export default function Dashboard({ stats, unreadApplications }: Props) {
    return (
        <HrLayout title="Dashboard" header="Dashboard">
            <Head title="HR Dashboard" />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Lowongan Aktif', value: stats.active_listings, icon: 'solar:document-text-bold-duotone', color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Total Pelamar', value: stats.total_applications, icon: 'solar:users-group-two-rounded-bold-duotone', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Lamaran Belum Dilihat', value: stats.unread_applications, icon: 'solar:inbox-in-bold-duotone', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Kandidat Diterima', value: stats.accepted_candidates, icon: 'solar:user-check-bold-duotone', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map((stat) => (
                    <div key={stat.label} className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-extrabold mt-2 text-slate-800 dark:text-slate-100">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
                                <iconify-icon icon={stat.icon} width="28" className={stat.color}></iconify-icon>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Unread Applications Table */}
            <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Lamaran Belum Dilihat</h2>
                    <span className="text-xs text-slate-400 font-medium">{unreadApplications.length} Belum Dilihat</span>
                </div>

                {unreadApplications.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Kandidat</th>
                                    <th className="py-3 px-4">Posisi Lowongan</th>
                                    <th className="py-3 px-4">Tahapan Saat Ini</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Tanggal Daftar</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                                {unreadApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-surface/10 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {app.candidate?.name || 'Kandidat Baru'}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {app.candidate?.email}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                                            {app.job_listing?.title}
                                        </td>
                                        <td className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            {stageLabels[app.current_stage] || app.current_stage}
                                        </td>
                                        <td className="py-4 px-4">
                                            <StatusBadge status={app.current_status} />
                                        </td>
                                        <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : '-'}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Link
                                                href={route('hr.pipeline.show', app.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary dark:text-primary-light hover:bg-primary/10 dark:hover:bg-primary-light/10 transition-all"
                                            >
                                                Detail
                                                <iconify-icon icon="solar:arrow-right-linear" width="14"></iconify-icon>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <iconify-icon icon="solar:inbox-line-linear" width="32" className="text-slate-400"></iconify-icon>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Semua lamaran sudah dilihat.</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Lamaran baru yang belum dilihat akan ditampilkan di sini.</p>
                    </div>
                )}
            </div>
        </HrLayout>
    );
}
