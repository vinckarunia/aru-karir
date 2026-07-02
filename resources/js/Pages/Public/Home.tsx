import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Home() {
    return (
        <PublicLayout>
            <Head title="Lowongan Kerja" />

            {/* Hero Section */}
            <section className="relative py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                            Temukan Karir
                            <span className="text-primary"> Impianmu</span>
                        </h1>
                        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Bergabung dengan PT Alfa Reka Usaha dan raih kesempatan berkarir
                            di berbagai project dan klien mitra terkemuka.
                        </p>

                        {/* Search Bar Placeholder */}
                        <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                            <div className="flex-1 relative">
                                <iconify-icon icon="solar:magnifer-linear" width="20" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></iconify-icon>
                                <input
                                    type="text"
                                    placeholder="Cari posisi, lokasi, atau kata kunci..."
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-dark-surface dark:text-dark-text focus:border-primary focus:ring-primary transition-all shadow-sm"
                                />
                            </div>
                            <button className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark shadow-md hover:shadow-lg transition-all">
                                Cari
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">—</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lowongan Aktif</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">—</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kandidat</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">—</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Klien Mitra</p>
                        </div>
                    </div>
                </div>

                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
                    <div className="absolute bottom-[0%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]"></div>
                </div>
            </section>
        </PublicLayout>
    );
}
