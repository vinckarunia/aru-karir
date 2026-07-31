import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import CandidateLayout from '@/Layouts/CandidateLayout';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import { BusinessOption, JobCategory, JobListing, PaginatedData, PageProps } from '@/types';

interface Props {
    listings: PaginatedData<JobListing>;
    categories: JobCategory[];
    locations: string[];
    filters: {
        search?: string;
        category?: string;
        contract_type?: string;
        location?: string;
    };
    contractTypes: BusinessOption[];
}

export default function JobIndex({ listings, categories, locations, filters, contractTypes }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [contractType, setContractType] = useState(filters.contract_type || '');
    const [location, setLocation] = useState(filters.location || '');

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        router.get(route('home'), {
            search,
            category,
            contract_type: contractType,
            location,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Auto-search when filters change
    useEffect(() => {
        if (category !== (filters.category || '') || 
            contractType !== (filters.contract_type || '') || 
            location !== (filters.location || '')) {
            handleSearch();
        }
    }, [category, contractType, location]);

    const handleReset = () => {
        setSearch('');
        setCategory('');
        setContractType('');
        setLocation('');
        router.get(route('home'));
    };

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
        title: auth.candidate ? "Cari Lowongan — ARUKarir" : "Temukan Karir Impianmu"
    };

    return (
        <Layout {...layoutProps}>
            <Head title="Temukan Karir Impianmu" />

            <div className="relative py-16 sm:py-24">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] dark:bg-primary/2"></div>
                    <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Text */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
                            Temukan Karir <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Impianmu</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            Bergabung dengan PT Alfa Reka Usaha dan raih kesempatan berkarir di berbagai project dan klien mitra terkemuka.
                        </p>
                    </div>

                    {/* Search & Filter Container */}
                    <div className="glass rounded-3xl p-6 sm:p-8 shadow-glow border border-slate-200/50 dark:border-slate-800/50 mb-12">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search bar */}
                            <div className="relative flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <iconify-icon icon="solar:magnifer-linear" width="20" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon>
                                    <input
                                        type="text"
                                        placeholder="Cari posisi, lokasi, atau kata kunci..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 dark:bg-dark-surface/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                                    >
                                        <iconify-icon icon="solar:magnifer-bold" width="18"></iconify-icon>
                                        Cari
                                    </button>
                                    {(search || category || contractType || location) && (
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="px-4 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                                            title="Reset Filters"
                                        >
                                            <iconify-icon icon="solar:restart-linear" width="20"></iconify-icon>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Dropdown Filters */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                {/* Category Filter */}
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-dark-surface/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Location Filter */}
                                <div className="relative">
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-dark-surface/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                                    >
                                        <option value="">Semua Lokasi</option>
                                        {locations.map((loc) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Contract Type Filter */}
                                <div className="relative">
                                    <select
                                        value={contractType}
                                        onChange={(e) => setContractType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-dark-surface/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                                    >
                                        <option value="">Tipe Kontrak</option>
                                        {contractTypes.map((option) => <option key={option.id} value={option.code}>{option.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Stats strip */}
                    <div className="flex justify-center gap-8 sm:gap-16 mb-12 text-slate-500 dark:text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-1 border-b-2 border-primary/20 pb-2 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-base">{listings.total}</span>
                            <span>Lowongan Aktif</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 border-b-2 border-primary/20 pb-2 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-base">Mitra</span>
                            <span>Klien Terbaik</span>
                        </div>
                    </div>

                    {/* Job Cards Grid */}
                    {listings.data.length > 0 ? (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.data.map((job) => (
                                    <div
                                        key={job.id}
                                        className="flex flex-col h-full bg-white dark:bg-dark-surface/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 hover:shadow-glow transition-all duration-300 overflow-hidden group"
                                    >
                                        <div className="p-6 flex-1">
                                            {/* Categories */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {job.categories?.map((cat) => (
                                                    <span
                                                        key={cat.id}
                                                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
                                                    >
                                                        {cat.name}
                                                    </span>
                                                ))}
                                                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-auto shrink-0">
                                                    {getContractTypeLabel(job.contract_type)}
                                                </span>
                                            </div>

                                            {/* Job Title */}
                                            <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                <Link href={route('job.detail', job.slug)}>{job.title}</Link>
                                            </h2>

                                            {/* Location */}
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-4">
                                                <iconify-icon icon="solar:map-point-linear" width="16"></iconify-icon>
                                                <span>{job.location}</span>
                                            </div>

                                            {/* Salary info */}
                                            {job.salary_visible && (job.salary_range_min || job.salary_range_max) ? (
                                                <div className="flex items-center gap-2 text-primary dark:text-primary-light font-semibold text-sm mb-4">
                                                    <iconify-icon icon="solar:wad-of-money-linear" width="18"></iconify-icon>
                                                    <span>
                                                        {job.salary_range_min ? formatRupiah(job.salary_range_min) : ''}
                                                        {job.salary_range_min && job.salary_range_max ? ' - ' : ''}
                                                        {job.salary_range_max ? formatRupiah(job.salary_range_max) : ''}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm mb-4 italic">
                                                    <iconify-icon icon="solar:wad-of-money-linear" width="18"></iconify-icon>
                                                    <span>Gaji dirahasiakan</span>
                                                </div>
                                            )}

                                            {/* Deadline */}
                                            {job.deadline_at && (
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                                                    <iconify-icon icon="solar:calendar-date-linear" width="16"></iconify-icon>
                                                    <span>Batas Akhir: {new Date(job.deadline_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action footer */}
                                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-dark-surface/20 flex items-center justify-between">
                                            {job.quota ? (
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    Kuota: <strong className="text-slate-800 dark:text-slate-200">{job.quota} orang</strong>
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Kuota tidak dibatasi</span>
                                            )}

                                            <Link
                                                href={route('job.detail', job.slug)}
                                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary dark:text-primary-light hover:text-primary-dark hover:underline transition-colors cursor-pointer"
                                            >
                                                Lamar Sekarang
                                                <iconify-icon icon="solar:arrow-right-linear" width="14"></iconify-icon>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <Pagination links={listings.links} />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-surface/30 rounded-3xl p-12 border border-slate-200/50 dark:border-slate-800/50">
                            <EmptyState
                                title="Lowongan Tidak Ditemukan"
                                description="Maaf, kami tidak menemukan lowongan pekerjaan yang cocok dengan kata kunci atau filter Anda. Coba reset filter atau gunakan kata kunci lain."
                            />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
