import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect } from 'react';
import { PageProps } from '@/types';

interface Props {
    title: string;
    header?: string;
}

export default function CandidateLayout({ title, header, children }: PropsWithChildren<Props>) {
    const { auth } = usePage<PageProps>().props;
    const candidate = auth.candidate!;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('#profile-dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const getInitials = (name: string): string => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-surface dark:bg-dark-bg text-slate-800 dark:text-dark-text font-sans antialiased selection:bg-primary selection:text-white flex flex-col">
            <Head title={title} />

            {/* Top Navigation */}
            <header className="h-20 glass sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <ApplicationLogo />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1 border-l border-slate-200 dark:border-slate-700/50 pl-8 h-10">
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <iconify-icon icon="solar:magnifer-linear" width="20"></iconify-icon>
                            Cari Lowongan
                        </Link>
                        <Link
                            href={route('candidate.applications.index')}
                            className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <iconify-icon icon="solar:file-check-linear" width="20"></iconify-icon>
                            Lamaran Saya
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 transition-all group">
                        <iconify-icon icon={isDarkMode ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"} width="22" className="group-hover:scale-110 transition-transform"></iconify-icon>
                    </button>

                    {/* Mobile Menu */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <iconify-icon icon={isMobileMenuOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} width="28"></iconify-icon>
                    </button>

                    {/* Profile Dropdown */}
                    <div id="profile-dropdown-container" className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 p-1.5 pr-3 rounded-full transition-all duration-200 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-bold shadow-sm border-2 border-white dark:border-slate-800 shrink-0">
                                {getInitials(candidate.name || candidate.email)}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white leading-none">{candidate.name || candidate.email}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-wider">Kandidat</p>
                            </div>
                            <iconify-icon icon="solar:alt-arrow-down-linear" width="16" className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></iconify-icon>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1b2330] border border-slate-200/80 dark:border-slate-800/80 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Link
                                    href={route('candidate.profile.edit')}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <iconify-icon icon="solar:settings-linear" width="18" className="text-slate-400 dark:text-slate-500"></iconify-icon>
                                    Pengaturan Profil
                                </Link>
                                <Link
                                    href={route('candidate.logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left cursor-pointer"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <iconify-icon icon="solar:logout-linear" width="18" className="text-rose-500 dark:text-rose-400"></iconify-icon>
                                    Log Out
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <iconify-icon icon="solar:magnifer-linear" width="20"></iconify-icon>
                        Cari Lowongan
                    </Link>
                    <Link href={route('candidate.applications.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <iconify-icon icon="solar:file-check-linear" width="20"></iconify-icon>
                        Lamaran Saya
                    </Link>
                </div>
            )}

            {/* Content */}
            <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
