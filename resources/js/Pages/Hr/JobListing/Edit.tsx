import { Head, Link, useForm } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
import { JobCategory, JobListing } from '@/types';

interface Props {
    job: JobListing;
    categories: JobCategory[];
}

export default function Edit({ job, categories }: Props) {
    // Format deadline date to YYYY-MM-DD for HTML5 date input
    const formatDeadline = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    const { data, setData, put, processing, errors } = useForm({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        location: job.location || '',
        contract_type: (job.contract_type || 'pkwt') as 'pkwt' | 'pkwtt' | 'freelance',
        salary_range_min: job.salary_range_min ?? '',
        salary_range_max: job.salary_range_max ?? '',
        salary_visible: job.salary_visible || false,
        quota: job.quota ?? '',
        deadline_at: formatDeadline(job.deadline_at),
        categories: job.categories?.map((c) => c.id) || [] as number[],
        hris_project_id: job.hris_project_id || '',
        status: (job.status || 'draft') as 'draft' | 'published' | 'closed',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(route('hr.lowongan.update', job.id), {
            onSuccess: () => {},
        });
    };

    const handleCategoryToggle = (id: number) => {
        if (data.categories.includes(id)) {
            setData('categories', data.categories.filter((c) => c !== id));
        } else {
            setData('categories', [...data.categories, id]);
        }
    };

    return (
        <HrLayout title="Edit Lowongan" header="Edit Lowongan Pekerjaan">
            <Head title={`Edit Lowongan - ${job.title}`} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link
                        href={route('hr.lowongan.index')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary dark:hover:text-primary-light transition-colors group"
                    >
                        <iconify-icon icon="solar:arrow-left-linear" width="16" className="group-hover:-translate-x-1 transition-transform"></iconify-icon>
                        Kembali ke Daftar
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Informasi Dasar */}
                    <div className="bg-white dark:bg-dark-surface/40 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                            <iconify-icon icon="solar:info-circle-bold-duotone" width="22" className="text-primary dark:text-primary-light"></iconify-icon>
                            Informasi Dasar
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="title" value="Nama Lowongan / Posisi" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Contoh: Staff Administrasi, Security Officer, Driver Operasional"
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            {/* Location */}
                            <div>
                                <InputLabel htmlFor="location" value="Lokasi Kerja" />
                                <TextInput
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Contoh: Jakarta Barat, Surabaya, Medan"
                                    required
                                />
                                <InputError message={errors.location} className="mt-2" />
                            </div>

                            {/* Contract Type */}
                            <div>
                                <InputLabel htmlFor="contract_type" value="Tipe Kontrak" />
                                <select
                                    id="contract_type"
                                    value={data.contract_type}
                                    onChange={(e) => setData('contract_type', e.target.value as any)}
                                    className="mt-1 block w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-surface/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="pkwt">PKWT (Kontrak)</option>
                                    <option value="pkwtt">PKWTT (Karyawan Tetap)</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                                <InputError message={errors.contract_type} className="mt-2" />
                            </div>

                            {/* Categories */}
                            <div className="md:col-span-2">
                                <InputLabel value="Kategori Pekerjaan" />
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <label
                                            key={cat.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                                                data.categories.includes(cat.id)
                                                    ? 'bg-primary/5 border-primary text-primary dark:bg-primary-light/5 dark:border-primary-light dark:text-primary-light'
                                                    : 'bg-white dark:bg-dark-surface/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.categories.includes(cat.id)}
                                                onChange={() => handleCategoryToggle(cat.id)}
                                                className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-dark-surface/50"
                                            />
                                            {cat.name}
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.categories} className="mt-2" />
                            </div>

                            {/* HRIS Project ID */}
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="hris_project_id" value="Link HRIS Project ID (Optional)" />
                                <TextInput
                                    id="hris_project_id"
                                    type="text"
                                    value={data.hris_project_id}
                                    onChange={(e) => setData('hris_project_id', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Masukkan Project ID dari HRIS jika lowongan ini bagian dari project klien"
                                />
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    Digunakan untuk sinkronisasi otomatis ketika melakukan onboarding pekerja baru ke sistem HRIS.
                                </p>
                                <InputError message={errors.hris_project_id} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Gaji, Kuota & Status */}
                    <div className="bg-white dark:bg-dark-surface/40 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                            <iconify-icon icon="solar:wad-of-money-bold-duotone" width="22" className="text-primary dark:text-primary-light"></iconify-icon>
                            Gaji, Kuota & Batas Akhir
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Salary Min */}
                            <div>
                                <InputLabel htmlFor="salary_range_min" value="Estimasi Gaji Minimum (IDR)" />
                                <TextInput
                                    id="salary_range_min"
                                    type="number"
                                    value={data.salary_range_min}
                                    onChange={(e) => setData('salary_range_min', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Contoh: 4000000"
                                />
                                <InputError message={errors.salary_range_min} className="mt-2" />
                            </div>

                            {/* Salary Max */}
                            <div>
                                <InputLabel htmlFor="salary_range_max" value="Estimasi Gaji Maksimum (IDR)" />
                                <TextInput
                                    id="salary_range_max"
                                    type="number"
                                    value={data.salary_range_max}
                                    onChange={(e) => setData('salary_range_max', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Contoh: 6000000"
                                />
                                <InputError message={errors.salary_range_max} className="mt-2" />
                            </div>

                            {/* Salary Visible */}
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <Checkbox
                                        checked={data.salary_visible}
                                        onChange={(e) => setData('salary_visible', e.target.checked)}
                                    />
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Tampilkan estimasi gaji kepada publik / kandidat
                                    </span>
                                </label>
                                <InputError message={errors.salary_visible} className="mt-2" />
                            </div>

                            {/* Quota */}
                            <div>
                                <InputLabel htmlFor="quota" value="Kuota Kebutuhan (Orang)" />
                                <TextInput
                                    id="quota"
                                    type="number"
                                    value={data.quota}
                                    onChange={(e) => setData('quota', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Kosongkan jika kuota tidak dibatasi"
                                />
                                <InputError message={errors.quota} className="mt-2" />
                            </div>

                            {/* Deadline */}
                            <div>
                                <InputLabel htmlFor="deadline_at" value="Batas Akhir Pendaftaran" />
                                <input
                                    id="deadline_at"
                                    type="date"
                                    value={data.deadline_at}
                                    onChange={(e) => setData('deadline_at', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-surface/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                                <InputError message={errors.deadline_at} className="mt-2" />
                            </div>

                            {/* Status */}
                            <div>
                                <InputLabel htmlFor="status" value="Status Lowongan" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as any)}
                                    className="mt-1 block w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-surface/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="draft">Draft (Disimpan saja)</option>
                                    <option value="published">Published (Aktif & Tampil)</option>
                                    <option value="closed">Closed (Ditutup)</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Detail Deskripsi */}
                    <div className="bg-white dark:bg-dark-surface/40 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                            <iconify-icon icon="solar:document-text-bold-duotone" width="22" className="text-primary dark:text-primary-light"></iconify-icon>
                            Deskripsi & Kualifikasi
                        </h3>

                        <div className="space-y-6">
                            {/* Description */}
                            <div>
                                <InputLabel htmlFor="description" value="Deskripsi Pekerjaan" />
                                <textarea
                                    id="description"
                                    rows={6}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-surface/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Jelaskan secara detail tanggung jawab pekerjaan ini..."
                                    required
                                ></textarea>
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Requirements */}
                            <div>
                                <InputLabel htmlFor="requirements" value="Kualifikasi / Persyaratan" />
                                <textarea
                                    id="requirements"
                                    rows={6}
                                    value={data.requirements}
                                    onChange={(e) => setData('requirements', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-surface/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Tuliskan kualifikasi, tingkat pendidikan, keterampilan, atau sertifikat yang dibutuhkan..."
                                    required
                                ></textarea>
                                <InputError message={errors.requirements} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href={route('hr.lowongan.index')}>
                            <SecondaryButton type="button" className="cursor-pointer">
                                Batal
                            </SecondaryButton>
                        </Link>
                        <PrimaryButton type="submit" disabled={processing} className="cursor-pointer">
                            {processing ? 'Menyimpan...' : 'Perbarui Lowongan'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </HrLayout>
    );
}
