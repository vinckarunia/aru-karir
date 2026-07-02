import { Link } from '@inertiajs/react';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: LinkItem[];
}

export default function Pagination({ links }: Props) {
    if (links.length <= 3) return null; // Don't show if there's only one page (Prev, 1, Next)

    return (
        <div className="flex flex-wrap justify-center gap-2 mt-8">
            {links.map((link, key) => {
                const cleanLabel = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»');

                if (link.url === null) {
                    return (
                        <div
                            key={key}
                            className="px-4 py-2 text-sm text-slate-400 bg-white/50 dark:bg-dark-surface/50 border border-slate-200/50 dark:border-slate-800/50 rounded-xl cursor-default select-none backdrop-blur-sm"
                        >
                            {cleanLabel}
                        </div>
                    );
                }

                return (
                    <Link
                        key={key}
                        href={link.url}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 backdrop-blur-sm border ${
                            link.active
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'bg-white/80 dark:bg-dark-surface/80 border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:text-primary dark:hover:text-primary-light hover:scale-105'
                        }`}
                    >
                        {cleanLabel}
                    </Link>
                );
            })}
        </div>
    );
}
