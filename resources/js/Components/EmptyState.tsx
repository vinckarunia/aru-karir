import React from 'react';

interface Props {
    icon?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<Props> = ({ icon = 'solar:inbox-line-linear', title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <iconify-icon icon={icon} width="32" className="text-primary/60"></iconify-icon>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default EmptyState;
