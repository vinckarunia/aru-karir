import { Head, Link, router } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';
import Pagination from '@/Components/Pagination';
import { JobListing, PaginatedData } from '@/types';
import { useState } from 'react';

interface Props {
    listings: PaginatedData<JobListing>;
}

export default function Index({ listings }: Props) {
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    const handleStatusChange = (id: string, status: 'draft' | 'published' | 'closed') => {
        router.patch(route('hr.lowongan.toggle', id), { status }, {
            preserveScroll: true,
            onSuccess: () => setDropdownOpen(null),
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30';
            case 'closed':
                return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/30';
            default: // draft
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/30';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published': return 'Published';
            case 'closed': return 'Closed';
            default: return 'Draft';
        }
    };

    const getContractTypeLabel = (type: string) => {
        switch (type) {
            case 'pkwt': return 'PKWT';
            case 'pkwtt': return 'PKWTT';
            case 'freelance': return 'Freelance';
            default: return type;
        }
    };

    // Calculate stats from the listings page for display (can be mock / estimate based on current page or simple summary)
    const totalCount = listings.total;
    
    return (
        <HrLayout title="Daftar Lowongan" header="Manajemen Lowongan">
            <Head title="Manajemen Lowongan" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daftar Lowongan Pekerjaan</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total {totalCount} lowongan terdaftar di portal.</p>
                    </div>

                    <Link
                        href={route('hr.lowongan.create')}
                        className="px-5 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                        <iconify-icon icon="solar:add-folder-bold" width="20"></iconify-icon>
                        Tambah Lowongan Baru
                    </Link>
                </div>

                {/* Listings Card / Table */}
                <div className="bg-white dark:bg-dark-surface/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-surface/30">
                                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Lowongan</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tipe / Lokasi</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Deadline / Kuota</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pelamar</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {listings.data.length > 0 ? (
                                    listings.data.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50/30 dark:hover:bg-dark-surface/10 transition-colors">
                                            {/* Lowongan info */}
                                            <td className="p-5">
                                                <div>
                                                    <span className="font-bold text-slate-900 dark:text-white block hover:text-primary transition-colors mb-1">
                                                        <Link href={route('hr.lowongan.edit', job.id)}>{job.title}</Link>
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {job.categories?.map((cat) => (
                                                            <span
                                                                key={cat.id}
                                                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
                                                            >
                                                                {cat.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tipe / Lokasi */}
                                            <td className="p-5">
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {getContractTypeLabel(job.contract_type)}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                    <iconify-icon icon="solar:map-point-linear" width="14"></iconify-icon>
                                                    {job.location}
                                                </div>
                                            </td>

                                            {/* Deadline / Kuota */}
                                            <td className="p-5">
                                                {job.deadline_at ? (
                                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {new Date(job.deadline_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-slate-400 italic">No Deadline</div>
                                                )}
                                                <div className="text-xs text-slate-400 mt-1">
                                                    Kuota: {job.quota ? `${job.quota} Orang` : 'Unlimited'}
                                                </div>
                                            </td>

                                            {/* Pelamar count */}
                                            <td className="p-5">
                                                <Link
                                                    href={route('hr.pipeline', job.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/5 text-primary hover:bg-primary/10 dark:bg-primary-light/5 dark:text-primary-light hover:dark:bg-primary-light/10 transition-all cursor-pointer"
                                                >
                                                    <iconify-icon icon="solar:users-group-two-rounded-bold-duotone" width="16"></iconify-icon>
                                                    <span>{job.applications_count || 0} Pelamar</span>
                                                </Link>
                                            </td>

                                            {/* Status Badge with inline options */}
                                            <td className="p-5 relative">
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={() => setDropdownOpen(dropdownOpen === job.id ? null : job.id)}
                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide cursor-pointer ${getStatusStyles(job.status)}`}
                                                    >
                                                        {getStatusLabel(job.status)}
                                                        <iconify-icon icon="solar:alt-arrow-down-linear" width="12"></iconify-icon>
                                                    </button>

                                                    {/* Dropdown to change status */}
                                                    {dropdownOpen === job.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)}></div>
                                                            <div className="absolute left-0 mt-2 w-36 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/60 dark:border-slate-800 shadow-lg z-20 py-2">
                                                                {(['draft', 'published', 'closed'] as const).map((status) => (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => handleStatusChange(job.id, status)}
                                                                        disabled={job.status === status}
                                                                        className={`w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                                                                            job.status === status
                                                                                ? 'text-primary dark:text-primary-light bg-slate-50/50 dark:bg-slate-800/50'
                                                                                : 'text-slate-600 dark:text-slate-400'
                                                                        }`}
                                                                    >
                                                                        {getStatusLabel(status)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('hr.lowongan.edit', job.id)}
                                                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 dark:hover:text-primary-light transition-all cursor-pointer"
                                                        title="Edit Lowongan"
                                                    >
                                                        <iconify-icon icon="solar:pen-bold-duotone" width="18"></iconify-icon>
                                                    </Link>
                                                    <Link
                                                        href={route('hr.pipeline', job.id)}
                                                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 dark:hover:text-primary-light transition-all cursor-pointer"
                                                        title="Lihat Pipeline Pelamar"
                                                    >
                                                        <iconify-icon icon="solar:users-group-two-rounded-bold-duotone" width="18"></iconify-icon>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center">
                                            <div className="max-w-md mx-auto py-8">
                                                <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">Belum ada lowongan pekerjaan yang dibuat.</p>
                                                <Link
                                                    href={route('hr.lowongan.create')}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
                                                >
                                                    <iconify-icon icon="solar:add-folder-bold" width="16"></iconify-icon>
                                                    Buat Lowongan Pertama
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {listings.data.length > 0 && (
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800/80">
                            <Pagination links={listings.links} />
                        </div>
                    )}
                </div>
            </div>
        </HrLayout>
    );
}
