import { PropsWithChildren } from 'react';

interface ModalProps {
    show: boolean;
    onClose: () => void;
}

export default function Modal({ show, onClose, children }: PropsWithChildren<ModalProps>) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0 flex items-center justify-center">
            {/* Background Overlay */}
            <div 
                className="fixed inset-0 transform transition-all bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div className="glass bg-white/95 dark:bg-dark-surface/95 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-glow transform transition-all sm:w-full sm:max-w-lg z-10 animate-scale-up">
                {children}
            </div>
        </div>
    );
}
