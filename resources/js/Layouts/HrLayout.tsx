import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect } from 'react';
import { PageProps } from '@/types';

interface Props {
    title: string;
    header?: string;
}

export default function HrLayout({ title, header, children }: PropsWithChildren<Props>) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.hr!;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

    const getInitials = (name: string): string => {
        const names = name.split(' ');
        if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const navLinks = [
        { href: '/hr/dashboard', icon: 'solar:widget-add-linear', label: 'Dashboard', section: 'general' },
        { href: '/hr/lowongan', icon: 'solar:document-text-linear', label: 'Lowongan', section: 'rekrutmen' },
    ];

    const adminLinks = [
        { href: '/hr/admin/users', icon: 'solar:users-group-rounded-linear', label: 'Manajemen HR', section: 'admin' },
        { href: '/hr/admin/categories', icon: 'solar:tag-linear', label: 'Kategori', section: 'admin' },
        { href: '/hr/admin/config', icon: 'solar:settings-linear', label: 'Konfigurasi', section: 'admin' },
    ];

    return (
        <div className="bg-surface text-slate-800 font-sans antialiased selection:bg-primary selection:text-white min-h-screen relative overflow-hidden dark:bg-dark-bg dark:text-dark-text flex">
            <Head title={title} />

            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen transition-all duration-300 glass flex flex-col border-r border-slate-200 dark:border-slate-800 shrink-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isSidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'} w-[280px]
            `}>
                {/* Logo */}
                <div className={`h-20 flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'lg:px-0 lg:justify-center px-8' : 'px-8'} border-b border-slate-100 dark:border-slate-800 shrink-0`}>
                    <Link href="/hr/dashboard" className="flex items-center gap-3 group">
                        <div className="flex items-center justify-center bg-white dark:bg-white/95 p-1.5 rounded-xl transition-colors shadow-sm border border-slate-100 dark:border-slate-800">
                            <img
                                src="/images/logo/logo-original.png"
                                alt="ARUKarir Logo"
                                className={`object-contain group-hover:scale-105 transition-transform drop-shadow-sm shrink-0 ${isSidebarCollapsed ? 'lg:h-9 lg:w-9' : 'h-10 w-auto'}`}
                            />
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">
                                ARU<span className="text-primary font-extrabold">Karir</span>
                            </span>
                        )}
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-6 space-y-8 px-4 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* Rekrutmen Section */}
                    <div>
                        <div className={`mb-2 flex items-center text-slate-400 ${isSidebarCollapsed ? 'lg:justify-center px-0' : 'px-4'}`}>
                            <iconify-icon icon="solar:clipboard-list-linear" width="18" className="shrink-0"></iconify-icon>
                            <span className={`text-xs font-bold uppercase tracking-wider ml-2 ${isSidebarCollapsed ? 'lg:hidden' : 'inline'}`}>Rekrutmen</span>
                        </div>
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className={`flex items-center gap-3 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:shadow-sm hover:text-primary dark:hover:bg-slate-800 transition-all group ${isSidebarCollapsed ? 'lg:justify-center px-0' : 'px-4'}`} title={link.label}>
                                    <iconify-icon icon={link.icon} width="20" className="shrink-0 group-hover:text-primary transition-colors"></iconify-icon>
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100 block'}`}>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Admin Section */}
                    {user.is_admin && (
                        <div>
                            <div className={`mb-2 flex items-center text-slate-400 ${isSidebarCollapsed ? 'lg:justify-center px-0' : 'px-4'}`}>
                                <iconify-icon icon="solar:shield-keyhole-minimalistic-linear" width="18" className="shrink-0"></iconify-icon>
                                <span className={`text-xs font-bold uppercase tracking-wider ml-2 ${isSidebarCollapsed ? 'lg:hidden' : 'inline'}`}>Admin</span>
                            </div>
                            <div className="space-y-1">
                                {adminLinks.map((link) => (
                                    <Link key={link.href} href={link.href} className={`flex items-center gap-3 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:shadow-sm hover:text-primary dark:hover:bg-slate-800 transition-all group ${isSidebarCollapsed ? 'lg:justify-center px-0' : 'px-4'}`} title={link.label}>
                                        <iconify-icon icon={link.icon} width="20" className="shrink-0 group-hover:text-primary transition-colors"></iconify-icon>
                                        <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100 block'}`}>{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 w-full min-w-0 flex flex-col h-screen overflow-y-auto">
                {/* Header */}
                <header className="h-20 glass sticky top-0 z-30 px-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <iconify-icon icon="solar:hamburger-menu-linear" width="24"></iconify-icon>
                        </button>
                        <button onClick={toggleSidebar} className="hidden lg:flex p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 transition-all group">
                            <iconify-icon icon="solar:hamburger-menu-linear" width="24" className="group-hover:scale-110 transition-transform"></iconify-icon>
                        </button>
                        <h1 className="hidden sm:block text-xl font-semibold text-slate-800 dark:text-white tracking-tight">{header || title}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 transition-all group">
                            <iconify-icon icon={isDarkMode ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"} width="22" className="group-hover:scale-110 transition-transform"></iconify-icon>
                        </button>

                        <div className="flex items-center gap-3 p-1.5 pr-3 rounded-full">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light text-white flex items-center justify-center font-bold shadow-sm border-2 border-white dark:border-slate-800">
                                {getInitials(user.name)}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-slate-700 dark:text-white leading-none">{user.name}</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">
                                    {user.role === 'admin' ? 'Admin' : 'HR Recruiter'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 md:p-8 w-full max-w-7xl mx-auto flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
