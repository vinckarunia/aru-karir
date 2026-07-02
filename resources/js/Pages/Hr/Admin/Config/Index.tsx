import { Head } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';

export default function Index() {
    return (
        <HrLayout title="Konfigurasi" header="Konfigurasi Sistem">
            <Head title="Konfigurasi" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Akan diimplementasikan di Module 7.</p>
        </HrLayout>
    );
}
