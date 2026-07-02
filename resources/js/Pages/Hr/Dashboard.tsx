import { Head } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';

export default function Dashboard() {
    return (
        <HrLayout title="Dashboard" header="Dashboard">
            <Head title="HR Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Lowongan Aktif', value: '—', icon: 'solar:document-text-bold-duotone', color: 'text-primary' },
                    { label: 'Lamaran Baru', value: '—', icon: 'solar:inbox-in-bold-duotone', color: 'text-blue-600' },
                    { label: 'Kandidat Diterima', value: '—', icon: 'solar:user-check-bold-duotone', color: 'text-emerald-600' },
                ].map((stat) => (
                    <div key={stat.label} className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <iconify-icon icon={stat.icon} width="28" className={stat.color}></iconify-icon>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Lamaran Terbaru</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada lamaran. Data akan muncul setelah Module 3 & 4 selesai.</p>
            </div>
        </HrLayout>
    );
}
