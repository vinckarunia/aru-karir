import { Head } from '@inertiajs/react';
import CandidateLayout from '@/Layouts/CandidateLayout';

export default function Index() {
    return (
        <CandidateLayout title="Lamaran Saya">
            <Head title="Lamaran Saya" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Daftar lamaran akan diimplementasikan di Module 3.</p>
        </CandidateLayout>
    );
}
