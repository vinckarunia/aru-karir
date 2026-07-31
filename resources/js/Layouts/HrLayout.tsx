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

    // Manage expanded/collapsed state for sidebar menus, mirroring HRIS
    const [collapsedMenus, setCollapsedMenus] = useState<Record<string, boolean>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('hrCollapsedMenus');
            return saved ? JSON.parse(saved) : {};
        }
        return {};
    });

    const toggleMenu = (menuKey: string) => {
        const newCollapsedMenus = { ...collapsedMenus, [menuKey]: !collapsedMenus[menuKey] };
        setCollapsedMenus(newCollapsedMenus);
        localStorage.setItem('hrCollapsedMenus', JSON.stringify(newCollapsedMenus));
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
        { href: '/hr/admin/options', icon: 'solar:list-check-linear', label: 'Opsi Pilihan', section: 'admin' },
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
                        <div
                            onClick={() => toggleMenu('rekrutmen')}
                            className={`mb-2 flex items-center justify-between text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300 ${isSidebarCollapsed ? 'lg:justify-center px-0' : 'px-4'}`}
                            title="Rekrutmen"
                        >
                            <div className="flex items-center gap-2">
                                <iconify-icon icon="solar:clipboard-list-linear" width="18" className={`shrink-0 transition-opacity duration-300 ${collapsedMenus['rekrutmen'] && isSidebarCollapsed ? 'opacity-50' : 'opacity-100'}`}></iconify-icon>
                                <span className={`text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isSidebarCollapsed ? 'lg:hidden' : 'inline'}`}>Rekrutmen</span>
                            </div>
                            <iconify-icon
                                icon="solar:alt-arrow-down-linear"
                                width="14"
                                className={`transition-transform duration-300 ${collapsedMenus['rekrutmen'] ? '-rotate-90' : ''} ${isSidebarCollapsed ? 'hidden' : 'block'}`}
                            ></iconify-icon>
                        </div>
                        <div className={`space-y-1 overflow-hidden transition-all duration-300 ${collapsedMenus['rekrutmen'] ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className={`flex items-center gap-3 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:shadow-sm hover:text-primary dark:hover:bg-slate-800 transition-all group ${isSidebarCollapsed ? 'lg:justify-center px-0' : 'px-4'}`} title={link.label}>
                                    <iconify-icon icon={link.icon} width="20" className="shrink-0 group-hover:text-primary transition-colors"></iconify-icon>
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100 block'}`}>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Admin Section */}
                    {(user.role === 'admin' || user.is_admin) && (
                        <div>
                            <div
                                onClick={() => toggleMenu('admin')}
                                className={`mb-2 flex items-center justify-between text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300 ${isSidebarCollapsed ? 'lg:justify-center px-0' : 'px-4'}`}
                                title="Admin"
                            >
                                <div className="flex items-center gap-2">
                                    <iconify-icon icon="solar:shield-keyhole-minimalistic-linear" width="18" className={`shrink-0 transition-opacity duration-300 ${collapsedMenus['admin'] && isSidebarCollapsed ? 'opacity-50' : 'opacity-100'}`}></iconify-icon>
                                    <span className={`text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isSidebarCollapsed ? 'lg:hidden' : 'inline'}`}>Admin</span>
                                </div>
                                <iconify-icon
                                    icon="solar:alt-arrow-down-linear"
                                    width="14"
                                    className={`transition-transform duration-300 ${collapsedMenus['admin'] ? '-rotate-90' : ''} ${isSidebarCollapsed ? 'hidden' : 'block'}`}
                                ></iconify-icon>
                            </div>
                            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${collapsedMenus['admin'] ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
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

                        {/* Profile Dropdown */}
                        <div id="profile-dropdown-container" className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 p-1.5 pr-3 rounded-full transition-all duration-200 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-bold shadow-sm border-2 border-white dark:border-slate-800 shrink-0">
                                    {getInitials(user.name)}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white leading-none">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-wider">
                                        {user.role === 'admin' || user.is_admin ? 'Super Admin' : 'HR Recruiter'}
                                    </p>
                                </div>
                                <iconify-icon icon="solar:alt-arrow-down-linear" width="16" className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></iconify-icon>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1b2330] border border-slate-200/80 dark:border-slate-800/80 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Link
                                        href={(user.role === 'admin' || user.is_admin) ? route('admin.users.index') : '#'}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <iconify-icon icon="solar:settings-linear" width="18" className="text-slate-400 dark:text-slate-500"></iconify-icon>
                                        Pengaturan Profil
                                    </Link>
                                    <Link
                                        href={route('hr.logout')}
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

                {/* Content */}
                <div className="p-6 md:p-8 w-full max-w-7xl mx-auto flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
