import { Head } from '@inertiajs/react';
import CandidateLayout from '@/Layouts/CandidateLayout';

export default function Edit() {
    return (
        <CandidateLayout title="Profil">
            <Head title="Profil Kandidat" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Form profil akan diimplementasikan di Module 3.</p>
        </CandidateLayout>
    );
}
