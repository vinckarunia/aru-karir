import React from 'react';
import { StageName, StageStatus } from '@/types';

interface Props {
    status: StageStatus | string | null | undefined;
    label?: string;
}

const statusColors: Record<string, string> = {
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    passed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    failed: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    no_show: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    rescheduled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    withdrawn: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

const statusLabels: Record<string, string> = {
    in_progress: 'Dalam Proses',
    passed: 'Lulus',
    failed: 'Tidak Lulus',
    no_show: 'Tidak Hadir',
    rescheduled: 'Dijadwalkan Ulang',
    withdrawn: 'Mengundurkan Diri',
};

const StatusBadge: React.FC<Props> = ({ status, label }) => {
    if (!status) return <span className="text-slate-400 italic text-xs">-</span>;

    const colorClass = statusColors[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
    const displayLabel = label ?? statusLabels[status] ?? status;

    return (
        <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${colorClass}`}>
            {displayLabel}
        </span>
    );
};

export default StatusBadge;
