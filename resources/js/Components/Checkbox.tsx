import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-primary shadow-sm focus:ring-primary dark:border-slate-700 dark:bg-dark-surface dark:focus:ring-primary-light ' +
                className
            }
        />
    );
}
