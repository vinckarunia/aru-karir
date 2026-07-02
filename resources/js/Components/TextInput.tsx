import { forwardRef, InputHTMLAttributes } from 'react';

const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean }>(
    ({ className = '', isFocused = false, ...props }, ref) => {
        return (
            <input
                {...props}
                ref={ref}
                autoFocus={isFocused}
                className={
                    'rounded-xl border-slate-300 shadow-sm transition-all duration-200 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-dark-surface dark:text-dark-text dark:focus:border-primary-light dark:focus:ring-primary-light ' +
                    className
                }
            />
        );
    },
);

TextInput.displayName = 'TextInput';
export default TextInput;
