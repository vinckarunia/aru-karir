import React from 'react';

interface Props {
    variant?: 'primary' | 'white' | 'dark';
    className?: string;
}

const ApplicationLogo: React.FC<Props> = ({ variant = 'primary', className = '' }) => {
    const logoSrc = variant === 'white'
        ? '/images/logo/logo-white.png'
        : variant === 'dark'
            ? '/images/logo/logo-dark.png'
            : '/images/logo/logo-original.png';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="flex items-center justify-center bg-white dark:bg-white/95 p-1.5 rounded-xl transition-colors shadow-sm border border-slate-100 dark:border-slate-800">
                <img
                    src={logoSrc}
                    alt="ARUKarir Logo"
                    className="h-10 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm shrink-0"
                />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                ARU<span className="text-primary font-extrabold">Karir</span>
            </span>
        </div>
    );
};

export default ApplicationLogo;
