import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect } from 'react';
import { PageProps } from '@/types';

interface Props {
    title?: string;
}

export default function PublicLayout({ children, title }: PropsWithChildren<Props>) {
    const { auth } = usePage<PageProps>().props;

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

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <div className="min-h-screen bg-surface dark:bg-dark-bg text-slate-800 dark:text-dark-text font-sans antialiased selection:bg-primary selection:text-white">
            {/* Navigation */}
            <header className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <ApplicationLogo />
                        </Link>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            <button onClick={toggleTheme} className="flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 transition-all group">
                                <iconify-icon icon={isDarkMode ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"} width="22" className="group-hover:scale-110 transition-transform"></iconify-icon>
                            </button>

                            {auth.candidate ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('candidate.applications.index')}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Lamaran Saya
                                    </Link>
                                    <Link
                                        href={route('candidate.profile.edit')}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg transition-all"
                                    >
                                        Profil
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('candidate.login')}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('candidate.register')}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg transition-all"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        &copy; {new Date().getFullYear()} PT Alfa Reka Usaha. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
