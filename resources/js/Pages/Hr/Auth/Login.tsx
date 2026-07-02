import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login() {
    return (
        <GuestLayout>
            <Head title="Login HR" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Login HR</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Form login akan diimplementasikan di Module 2.</p>
        </GuestLayout>
    );
}
