import React, { useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import CandidateLayout from '@/Layouts/CandidateLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FlashMessages } from '@/types';

interface CustomField {
    id: number;
    field_name: string;
    field_label: string;
    field_type: 'text' | 'textarea' | 'file' | 'select';
    is_required: boolean;
    options: string[] | null;
}

interface CustomValue {
    id: number;
    candidate_id: string;
    profile_field_id: number;
    value: string | null;
    file_path: string | null;
}

interface Props {
    candidate: any;
    customFields: CustomField[];
    customValues: Record<number, CustomValue>;
    job?: string;
}

export default function Edit({ candidate, customFields, customValues, job }: Props) {
    const flash = usePage().props.flash as FlashMessages;
    
    // Initialize form with candidate and custom fields data
    const initialFormState: Record<string, any> = {
        name: candidate.name || '',
        phone: candidate.phone || '',
        birth_date: candidate.birth_date ? candidate.birth_date.split('T')[0] : '',
        gender: candidate.gender || 'male',
        ktp_number: candidate.ktp_number || '',
        mother_name: candidate.mother_name || '',
        address: candidate.address || '',
        education_level: candidate.education_level || 'S1',
        cv: null,
        profile_photo: null,
        job: job || '',
    };

    // Populate custom fields values
    customFields.forEach((field) => {
        initialFormState[`custom_${field.id}`] = field.field_type === 'file' ? null : (customValues[field.id]?.value || '');
    });

    const { data, setData, post, processing, errors, progress } = useForm(initialFormState);

    const cvInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('candidate.profile.update'), {
            forceFormData: true,
        });
    };

    // Helper to render custom inputs
    const renderCustomFieldInput = (field: CustomField) => {
        const inputName = `custom_${field.id}`;
        
        switch (field.field_type) {
            case 'textarea':
                return (
                    <textarea
                        id={inputName}
                        name={inputName}
                        value={data[inputName] || ''}
                        className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm"
                        rows={3}
                        onChange={(e) => setData(inputName, e.target.value)}
                        required={field.is_required}
                    />
                );
            case 'select':
                return (
                    <select
                        id={inputName}
                        name={inputName}
                        value={data[inputName] || ''}
                        className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                        onChange={(e) => setData(inputName, e.target.value)}
                        required={field.is_required}
                    >
                        <option value="">Pilih Opsi</option>
                        {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                );
            case 'file':
                const fileVal = customValues[field.id];
                return (
                    <div className="mt-1 space-y-2">
                        {fileVal?.file_path && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary dark:text-primary-light">
                                <iconify-icon icon="solar:file-check-bold" width="16"></iconify-icon>
                                <span>Sudah ada file: {fileVal.value || 'Dokumen Pendukung'}</span>
                                <a
                                    href={fileVal.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 underline text-slate-500 hover:text-primary dark:hover:text-primary-light transition-colors"
                                >
                                    Lihat File
                                </a>
                            </div>
                        )}
                        <input
                            type="file"
                            id={inputName}
                            name={inputName}
                            className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer transition-all"
                            onChange={(e) => setData(inputName, e.target.files?.[0] || null)}
                            required={field.is_required && !fileVal?.file_path}
                        />
                    </div>
                );
            case 'text':
            default:
                return (
                    <TextInput
                        id={inputName}
                        type="text"
                        name={inputName}
                        value={data[inputName] || ''}
                        className="mt-1 block w-full"
                        onChange={(e) => setData(inputName, e.target.value)}
                        required={field.is_required}
                    />
                );
        }
    };

    return (
        <CandidateLayout title="Lengkapi Profil — ARUKarir">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Form Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lengkapi Profil Anda</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Isi informasi di bawah ini dengan lengkap untuk dapat melamar pekerjaan.
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-3 bg-white dark:bg-dark-surface/30 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <iconify-icon icon="solar:user-id-bold-duotone" width="22"></iconify-icon>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium leading-none">STATUS PROFIL</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                                {candidate.profile_completed_at ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Lengkap
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        Belum Lengkap
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Warning Alert */}
                {flash.warning && (
                    <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl text-amber-800 dark:text-amber-300 text-sm">
                        <iconify-icon icon="solar:danger-triangle-bold" width="20" className="shrink-0 mt-0.5"></iconify-icon>
                        <div>
                            <span className="font-bold">Perhatian:</span> {flash.warning}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* section 1: Data Diri */}
                    <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white flex items-center gap-2">
                            <iconify-icon icon="solar:user-bold-duotone" width="20" className="text-primary"></iconify-icon>
                            Data Pribadi
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Nama Lengkap" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Sesuai KTP"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Phone */}
                            <div>
                                <InputLabel htmlFor="phone" value="Nomor HP / WhatsApp" />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="0812XXXXXXXX"
                                    required
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            {/* Birth Date */}
                            <div>
                                <InputLabel htmlFor="birth_date" value="Tanggal Lahir" />
                                <TextInput
                                    id="birth_date"
                                    type="date"
                                    name="birth_date"
                                    value={data.birth_date}
                                    className="mt-1 block w-full cursor-pointer"
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.birth_date} className="mt-2" />
                            </div>

                            {/* Gender */}
                            <div>
                                <InputLabel htmlFor="gender" value="Jenis Kelamin" />
                                <select
                                    id="gender"
                                    name="gender"
                                    value={data.gender}
                                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                    onChange={(e) => setData('gender', e.target.value)}
                                    required
                                >
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                                <InputError message={errors.gender} className="mt-2" />
                            </div>

                            {/* NIK KTP */}
                            <div>
                                <InputLabel htmlFor="ktp_number" value="Nomor NIK KTP" />
                                <TextInput
                                    id="ktp_number"
                                    type="text"
                                    name="ktp_number"
                                    value={data.ktp_number}
                                    className="mt-1 block w-full"
                                    maxLength={16}
                                    onChange={(e) => setData('ktp_number', e.target.value)}
                                    placeholder="16 Digit NIK KTP"
                                    required
                                />
                                <InputError message={errors.ktp_number} className="mt-2" />
                            </div>

                            {/* Mother Name */}
                            <div>
                                <InputLabel htmlFor="mother_name" value="Nama Ibu Kandung" />
                                <TextInput
                                    id="mother_name"
                                    type="text"
                                    name="mother_name"
                                    value={data.mother_name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('mother_name', e.target.value)}
                                    placeholder="Nama Ibu Kandung"
                                    required
                                />
                                <InputError message={errors.mother_name} className="mt-2" />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <InputLabel htmlFor="address" value="Alamat Domisili" />
                            <textarea
                                id="address"
                                name="address"
                                value={data.address}
                                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm"
                                rows={3}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Alamat lengkap tempat tinggal saat ini"
                                required
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>

                        {/* Education Level */}
                        <div>
                            <InputLabel htmlFor="education_level" value="Pendidikan Terakhir" />
                            <select
                                id="education_level"
                                name="education_level"
                                value={data.education_level}
                                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                onChange={(e) => setData('education_level', e.target.value)}
                                required
                            >
                                <option value="SD">SD</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA/SMK">SMA/SMK / Sederajat</option>
                                <option value="D1/D2/D3">Diploma (D1/D2/D3)</option>
                                <option value="S1">Sarjana (S1)</option>
                                <option value="S2">Magister (S2)</option>
                                <option value="S3">Doktor (S3)</option>
                            </select>
                            <InputError message={errors.education_level} className="mt-2" />
                        </div>
                    </div>

                    {/* section 2: Dokumen (CV & Photo) */}
                    <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white flex items-center gap-2">
                            <iconify-icon icon="solar:folder-open-bold-duotone" width="20" className="text-primary"></iconify-icon>
                            Dokumen Pendukung
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CV Upload */}
                            <div>
                                <InputLabel htmlFor="cv" value="Curriculum Vitae (CV)" />
                                {candidate.cv_path && (
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                        <iconify-icon icon="solar:file-check-bold" width="16"></iconify-icon>
                                        <span>CV sudah diunggah</span>
                                        <a
                                            href={candidate.cv_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-auto underline text-slate-500 hover:text-primary transition-colors cursor-pointer"
                                        >
                                            Lihat PDF
                                        </a>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="cv"
                                    ref={cvInputRef}
                                    accept=".pdf"
                                    className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer transition-all mt-1"
                                    onChange={(e) => setData('cv', e.target.files?.[0] || null)}
                                    required={!candidate.cv_path}
                                />
                                <span className="text-xs text-slate-400 mt-1 block">Format PDF, maksimal 5MB.</span>
                                <InputError message={errors.cv} className="mt-2" />
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <InputLabel htmlFor="profile_photo" value="Foto Profil" />
                                {candidate.profile_photo_path && (
                                    <div className="mb-2 flex items-center gap-3">
                                        <img
                                            src={candidate.profile_photo_path}
                                            alt="Foto Profil"
                                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                        />
                                        <span className="text-xs font-semibold text-slate-500">Foto profil terpasang</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="profile_photo"
                                    ref={photoInputRef}
                                    accept="image/*"
                                    className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer transition-all mt-1"
                                    onChange={(e) => setData('profile_photo', e.target.files?.[0] || null)}
                                />
                                <span className="text-xs text-slate-400 mt-1 block">Format JPG/PNG, maksimal 2MB.</span>
                                <InputError message={errors.profile_photo} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* section 3: Custom Configurable Fields (Dynamic) */}
                    {customFields.length > 0 && (
                        <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white flex items-center gap-2">
                                <iconify-icon icon="solar:add-square-bold-duotone" width="20" className="text-primary"></iconify-icon>
                                Informasi Tambahan
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {customFields.map((field) => (
                                    <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <InputLabel htmlFor={`custom_${field.id}`}>
                                            {field.field_label}
                                            {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
                                        </InputLabel>
                                        
                                        <div className="mt-1">
                                            {renderCustomFieldInput(field)}
                                        </div>
                                        
                                        <InputError message={errors[`custom_${field.id}`]} className="mt-2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress Bar for uploads */}
                    {progress && (
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress.percentage}%` }}></div>
                            <span className="text-xs text-slate-500 mt-1 block text-right font-medium">Mengunggah: {progress.percentage}%</span>
                        </div>
                    )}

                    {/* Submit Bar */}
                    <div className="flex justify-end items-center gap-4">
                        <PrimaryButton type="submit" disabled={processing} className="px-8 py-3.5 text-sm font-bold cursor-pointer">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </CandidateLayout>
    );
}
