import { Head } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';

export default function Index() {
    return (
        <HrLayout title="Manajemen HR" header="Manajemen HR Users">
            <Head title="Manajemen HR" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Akan diimplementasikan di Module 7.</p>
        </HrLayout>
    );
}
