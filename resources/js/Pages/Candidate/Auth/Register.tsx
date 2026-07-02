import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Register() {
    return (
        <GuestLayout>
            <Head title="Daftar Kandidat" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Daftar Akun</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Form registrasi akan diimplementasikan di Module 3.</p>
        </GuestLayout>
    );
}
