import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function JobDetail({ slug }: { slug: string }) {
    return (
        <PublicLayout>
            <Head title="Detail Lowongan" />
            <div className="max-w-4xl mx-auto px-4 py-12">
                <p className="text-slate-500 dark:text-slate-400">Halaman detail lowongan: {slug}</p>
                <p className="text-sm text-slate-400 mt-2">Akan diimplementasikan di Module 2.</p>
            </div>
        </PublicLayout>
    );
}
