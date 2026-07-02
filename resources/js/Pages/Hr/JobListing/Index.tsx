import { Head } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';

export default function Index() {
    return (
        <HrLayout title="Lowongan" header="Manajemen Lowongan">
            <Head title="Lowongan" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Manajemen lowongan akan diimplementasikan di Module 2.</p>
        </HrLayout>
    );
}
