import { Head, Link, useForm } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
import HrisProjectPicker, { HrisProject } from '@/Components/HrisProjectPicker';
import { BusinessOption, JobCategory } from '@/types';

interface Props {
    categories: JobCategory[];
    hrisProjects?: HrisProject[];
    contractTypes: BusinessOption[];
}

const optionalBiodataFields = [
    { key: 'blood_type', label: 'Golongan Darah' },
    { key: 'height', label: 'Tinggi Badan' },
    { key: 'weight', label: 'Berat Badan' },
    { key: 'address_domicile', label: 'Alamat Domisili' },
    { key: 'phone_domicile', label: 'Telepon Domisili' },
    { key: 'housing_status', label: 'Status Kepemilikan Rumah' },
    { key: 'npwp', label: 'NPWP' },
    { key: 'bank_name', label: 'Nama Bank' },
    { key: 'bank_account_number', label: 'Nomor Rekening Bank' },
    { key: 'size_shoe', label: 'Ukuran Sepatu' },
    { key: 'size_uniform', label: 'Ukuran Seragam' },
    { key: 'father_name', label: 'Nama Ayah' },
    { key: 'father_birth_place_date', label: 'Tempat & Tanggal Lahir Ayah' },
    { key: 'father_job', label: 'Pekerjaan Ayah' },
    { key: 'mother_birth_place_date', label: 'Tempat & Tanggal Lahir Ibu' },
    { key: 'mother_job', label: 'Pekerjaan Ibu' },
    { key: 'sibling_order', label: 'Anak Ke' },
    { key: 'sibling_count', label: 'Jumlah Bersaudara' },
    { key: 'spouse_name', label: 'Nama Pasangan (Suami/Istri)' },
    { key: 'spouse_birth_place_date', label: 'Tempat & Tanggal Lahir Pasangan' },
    { key: 'school_name_city', label: 'Nama Sekolah & Kota' },
    { key: 'school_major', label: 'Jurusan Sekolah' },
    { key: 'work_experience', label: 'Riwayat Pengalaman Kerja' },
    { key: 'reference_name', label: 'Nama Referensi' },
    { key: 'reference_relationship', label: 'Hubungan Referensi' },
    { key: 'reference_phone', label: 'Telepon Referensi' },
];

export default function Create({ categories, hrisProjects = [], contractTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        requirements: '',
        location: '',
        contract_type: contractTypes[0]?.code || '',
        salary_range_min: '' as number | string,
        salary_range_max: '' as number | string,
        salary_visible: false,
        quota: '' as number | string,
        deadline_at: '',
        categories: [] as number[],
        hris_project_id: '',
        status: 'draft' as 'draft' | 'published' | 'closed',
        required_fields: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('hr.lowongan.store'), {
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
        <HrLayout title="Buat Lowongan" header="Buat Lowongan Pekerjaan">
            <Head title="Buat Lowongan Baru" />

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
                                    onChange={(e) => setData('contract_type', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-surface/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    {contractTypes.map((option) => <option key={option.id} value={option.code}>{option.label}</option>)}
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
                                <InputLabel htmlFor="hris_project_id" value="Hubungkan dengan Project HRIS (Opsional)" />
                                <HrisProjectPicker
                                    projects={hrisProjects}
                                    selectedId={data.hris_project_id}
                                    onSelect={(projectId) => setData('hris_project_id', projectId)}
                                />
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    Pekerja baru akan otomatis disinkronkan ke project HRIS terpilih saat dinyatakan lolos rekrutmen.
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
                                <InputLabel htmlFor="status" value="Status Publish Awal" />
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

                    {/* Section 4: Persyaratan Kolom Biodata Tambahan */}
                    <div className="bg-white dark:bg-dark-surface/40 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                            <iconify-icon icon="solar:check-read-bold-duotone" width="22" className="text-primary dark:text-primary-light"></iconify-icon>
                            Persyaratan Kolom Biodata Tambahan (Opsional)
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Secara default, kolom wajib bagi kandidat meliputi: Nama Lengkap, Nomor HP, Tempat & Tanggal Lahir, Jenis Kelamin, Agama, NIK KTP, Alamat KTP, CV, Foto Profil, Ibu Kandung, Status Pernikahan, Pendidikan Terakhir, Tahun Kelulusan, Kontak Darurat. Centang kolom di bawah ini jika Anda ingin mewajibkan data tambahan lainnya.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {optionalBiodataFields.map((field) => (
                                <label
                                    key={field.key}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                        data.required_fields?.includes(field.key)
                                            ? 'bg-primary/5 border-primary text-primary dark:bg-primary-light/5 dark:border-primary-light dark:text-primary-light'
                                            : 'bg-white dark:bg-dark-surface/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.required_fields?.includes(field.key)}
                                        onChange={() => {
                                            const current = data.required_fields || [];
                                            if (current.includes(field.key)) {
                                                setData('required_fields', current.filter((k) => k !== field.key));
                                            } else {
                                                setData('required_fields', [...current, field.key]);
                                            }
                                        }}
                                        className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-dark-surface/50"
                                    />
                                    {field.label}
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.required_fields} className="mt-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href={route('hr.lowongan.index')}>
                            <SecondaryButton type="button" className="cursor-pointer">
                                Batal
                            </SecondaryButton>
                        </Link>
                        <PrimaryButton type="submit" disabled={processing} className="cursor-pointer">
                            {processing ? 'Menyimpan...' : 'Simpan Lowongan'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </HrLayout>
    );
}
