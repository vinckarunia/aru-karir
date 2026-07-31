import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import CandidateLayout from '@/Layouts/CandidateLayout';
import { BusinessOption, JobListing, PageProps } from '@/types';

interface Props {
    job: JobListing;
    hasApplied?: boolean;
    contractTypes: BusinessOption[];
}

export default function JobDetail({ job, hasApplied, contractTypes }: Props) {
    const { auth } = usePage<PageProps>().props;

    // Helper to format currency
    const formatRupiah = (value?: number) => {
        if (!value) return '';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Helper to map contract type label
    const getContractTypeLabel = (type: string) => contractTypes.find((option) => option.code === type)?.label || type;

    const Layout = auth.candidate ? CandidateLayout : PublicLayout;
    const layoutProps = {
        title: auth.candidate ? `${job.title} - Detail Lowongan — ARUKarir` : `${job.title} - Detail Lowongan`
    };

    return (
        <Layout {...layoutProps}>
            <Head title={`${job.title} - Detail Lowongan`} />

            <div className="relative py-12">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[20%] right-[5%] w-[45%] h-[45%] rounded-full bg-primary/5 blur-[120px] dark:bg-primary/2"></div>
                    <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] dark:bg-primary/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-8">
                        <Link
                            href={route('home')}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary dark:hover:text-primary-light transition-colors group"
                        >
                            <iconify-icon icon="solar:arrow-left-linear" width="16" className="group-hover:-translate-x-1 transition-transform"></iconify-icon>
                            Kembali ke Daftar Lowongan
                        </Link>
                    </div>

                    {/* Job Header Info */}
                    <div className="bg-white dark:bg-dark-surface/40 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 mb-8 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {job.categories?.map((cat) => (
                                        <span
                                            key={cat.id}
                                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
                                        >
                                            {cat.name}
                                        </span>
                                    ))}
                                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {getContractTypeLabel(job.contract_type)}
                                    </span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
                                    {job.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <iconify-icon icon="solar:map-point-linear" width="16" className="text-primary dark:text-primary-light"></iconify-icon>
                                        <span>{job.location}</span>
                                    </div>
                                    {job.deadline_at && (
                                        <div className="flex items-center gap-1.5">
                                            <iconify-icon icon="solar:calendar-date-linear" width="16" className="text-primary dark:text-primary-light"></iconify-icon>
                                            <span>Batas Akhir: {new Date(job.deadline_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Large screen apply button */}
                            <div className="w-full md:w-auto shrink-0">
                                {auth.candidate ? (
                                    hasApplied ? (
                                        <button
                                            disabled
                                            className="w-full md:w-auto px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-center font-bold rounded-2xl border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                                        >
                                            Sudah Dilamar
                                        </button>
                                    ) : (
                                        <Link
                                            href={route('candidate.apply', job.id)}
                                            method="post"
                                            as="button"
                                            className="w-full md:w-auto px-8 py-4 bg-primary text-white text-center font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg cursor-pointer"
                                        >
                                            Lamar Sekarang
                                        </Link>
                                    )
                                ) : (
                                    <Link
                                        href={route('candidate.login', { job: job.slug })}
                                        className="w-full md:w-auto block px-8 py-4 bg-primary text-white text-center font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg cursor-pointer"
                                    >
                                        Login untuk Melamar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Description & Requirements (Left 2 cols) */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description Card */}
                            <div className="bg-white dark:bg-dark-surface/40 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <iconify-icon icon="solar:document-text-bold-duotone" width="22" className="text-primary dark:text-primary-light"></iconify-icon>
                                    Deskripsi Pekerjaan
                                </h2>
                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                                    {job.description}
                                </div>
                            </div>

                            {/* Requirements Card */}
                            <div className="bg-white dark:bg-dark-surface/40 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <iconify-icon icon="solar:checklist-bold-duotone" width="22" className="text-primary dark:text-primary-light"></iconify-icon>
                                    Persyaratan & Kualifikasi
                                </h2>
                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                                    {job.requirements}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Right 1 col) */}
                        <div className="space-y-6">
                            {/* Summary Details Panel */}
                            <div className="glass rounded-3xl p-6 sm:p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white">
                                    Ringkasan Pekerjaan
                                </h3>

                                <div className="space-y-4">
                                    {/* Contract Type */}
                                    <div className="flex gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary-light/5 text-primary dark:text-primary-light shrink-0">
                                            <iconify-icon icon="solar:document-bold-duotone" width="20"></iconify-icon>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">TIPE KONTRAK</p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{getContractTypeLabel(job.contract_type)}</p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary-light/5 text-primary dark:text-primary-light shrink-0">
                                            <iconify-icon icon="solar:map-point-bold-duotone" width="20"></iconify-icon>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">LOKASI</p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{job.location}</p>
                                        </div>
                                    </div>

                                    {/* Salary */}
                                    <div className="flex gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary-light/5 text-primary dark:text-primary-light shrink-0">
                                            <iconify-icon icon="solar:wad-of-money-bold-duotone" width="20"></iconify-icon>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">ESTIMASI GAJI</p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {job.salary_visible && (job.salary_range_min || job.salary_range_max) ? (
                                                    <span>
                                                        {job.salary_range_min ? formatRupiah(job.salary_range_min) : ''}
                                                        {job.salary_range_min && job.salary_range_max ? ' - ' : ''}
                                                        {job.salary_range_max ? formatRupiah(job.salary_range_max) : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 italic font-medium">Gaji Dirahasiakan</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quota */}
                                    <div className="flex gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary-light/5 text-primary dark:text-primary-light shrink-0">
                                            <iconify-icon icon="solar:users-group-two-rounded-bold-duotone" width="20"></iconify-icon>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">KUOTA KEBUTUHAN</p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {job.quota ? `${job.quota} Orang` : 'Tidak Dibatasi'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    {job.deadline_at && (
                                        <div className="flex gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary-light/5 text-primary dark:text-primary-light shrink-0">
                                                <iconify-icon icon="solar:calendar-date-bold-duotone" width="20"></iconify-icon>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">BATAS LAMARAN</p>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                    {new Date(job.deadline_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
