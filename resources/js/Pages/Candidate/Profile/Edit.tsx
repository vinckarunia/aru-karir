import React, { useRef, useState } from 'react';
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
    jobRequiredFields?: string[];
}

export default function Edit({ candidate, customFields, customValues, job, jobRequiredFields = [] }: Props) {
    const flash = usePage().props.flash as FlashMessages;
    const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'education' | 'references' | 'custom'>('personal');

    const requiredByDefault = [
        'name',
        'phone',
        'birth_place',
        'birth_date',
        'gender',
        'religion',
        'ktp_number',
        'address',
        'cv',
        'profile_photo',
        'mother_name',
        'marital_status',
        'education_level',
        'school_graduation_year',
        'emergency_name',
        'emergency_relationship',
        'emergency_phone',
        'emergency_address',
    ];

    const isRequired = (fieldKey: string) => requiredByDefault.includes(fieldKey) || jobRequiredFields.includes(fieldKey);

    // Initialize children list from candidate data
    const [childrenList, setChildrenList] = useState<{name: string, birth_place_date: string}[]>(() => {
        const list = [];
        if (candidate.child_1_name || candidate.child_1_birth_place_date) {
            list.push({ name: candidate.child_1_name || '', birth_place_date: candidate.child_1_birth_place_date || '' });
        }
        if (candidate.child_2_name || candidate.child_2_birth_place_date) {
            list.push({ name: candidate.child_2_name || '', birth_place_date: candidate.child_2_birth_place_date || '' });
        }
        if (candidate.child_3_name || candidate.child_3_birth_place_date) {
            list.push({ name: candidate.child_3_name || '', birth_place_date: candidate.child_3_birth_place_date || '' });
        }
        return list;
    });

    const handleAddChild = () => {
        if (childrenList.length >= 3) return;
        const newList = [...childrenList, { name: '', birth_place_date: '' }];
        setChildrenList(newList);
        
        const update: Record<string, string> = {};
        for (let i = 0; i < 3; i++) {
            update[`child_${i + 1}_name`] = newList[i]?.name || '';
            update[`child_${i + 1}_birth_place_date`] = newList[i]?.birth_place_date || '';
        }
        setData((prev: any) => ({
            ...prev,
            ...update
        }));
    };

    const handleRemoveChild = (index: number) => {
        const newList = childrenList.filter((_, i) => i !== index);
        setChildrenList(newList);
        
        const update: Record<string, string> = {};
        for (let i = 0; i < 3; i++) {
            update[`child_${i + 1}_name`] = newList[i]?.name || '';
            update[`child_${i + 1}_birth_place_date`] = newList[i]?.birth_place_date || '';
        }
        setData((prev: any) => ({
            ...prev,
            ...update
        }));
    };

    const handleChildChange = (index: number, key: 'name' | 'birth_place_date', val: string) => {
        const newList = [...childrenList];
        newList[index] = { ...newList[index], [key]: val };
        setChildrenList(newList);
        setData(`child_${index + 1}_${key}` as any, val);
    };

    // Initialize form with candidate and custom fields data
    const initialFormState: Record<string, any> = {
        name: candidate.name || '',
        phone: candidate.phone || '',
        birth_date: candidate.birth_date ? candidate.birth_date.split('T')[0] : '',
        gender: candidate.gender || '',
        ktp_number: candidate.ktp_number || '',
        mother_name: candidate.mother_name || '',
        address: candidate.address || '',
        education_level: candidate.education_level || 'S1',
        cv: null,
        profile_photo: null,
        job: job || '',

        // New Personal & Domicile
        birth_place: candidate.birth_place || '',
        religion: candidate.religion || '',
        blood_type: candidate.blood_type || '',
        height: candidate.height || '',
        weight: candidate.weight || '',
        address_domicile: candidate.address_domicile || '',
        phone_domicile: candidate.phone_domicile || '',
        housing_status: candidate.housing_status || '',
        npwp: candidate.npwp || '',
        bank_name: candidate.bank_name || '',
        bank_account_number: candidate.bank_account_number || '',

        // New Family Details
        father_name: candidate.father_name || '',
        father_birth_place_date: candidate.father_birth_place_date || '',
        father_job: candidate.father_job || '',
        mother_birth_place_date: candidate.mother_birth_place_date || '',
        mother_job: candidate.mother_job || '',
        sibling_order: candidate.sibling_order || '',
        sibling_count: candidate.sibling_count || '',
        marital_status: candidate.marital_status || 'belum_nikah',
        spouse_name: candidate.spouse_name || '',
        spouse_birth_place_date: candidate.spouse_birth_place_date || '',
        child_1_name: candidate.child_1_name || '',
        child_1_birth_place_date: candidate.child_1_birth_place_date || '',
        child_2_name: candidate.child_2_name || '',
        child_2_birth_place_date: candidate.child_2_birth_place_date || '',
        child_3_name: candidate.child_3_name || '',
        child_3_birth_place_date: candidate.child_3_birth_place_date || '',

        // New Education Details
        school_name_city: candidate.school_name_city || '',
        school_major: candidate.school_major || '',
        school_graduation_year: candidate.school_graduation_year || '',
        work_experience: candidate.work_experience || [],

        // New References & Emergency Contacts
        reference_name: candidate.reference_name || '',
        reference_relationship: candidate.reference_relationship || '',
        reference_phone: candidate.reference_phone || '',
        emergency_name: candidate.emergency_name || '',
        emergency_relationship: candidate.emergency_relationship || '',
        emergency_phone: candidate.emergency_phone || '',
        emergency_address: candidate.emergency_address || '',

        // New Sizes
        size_shoe: candidate.size_shoe || '',
        size_uniform: candidate.size_uniform || '',
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

    // Work Experience Helpers
    const handleAddExperience = () => {
        if (data.work_experience.length >= 4) return;
        const newExp = { company: '', position: '', period: '', last_salary: '', resign_reason: '' };
        setData('work_experience', [...data.work_experience, newExp]);
    };

    const handleRemoveExperience = (index: number) => {
        const updated = [...data.work_experience];
        updated.splice(index, 1);
        setData('work_experience', updated);
    };

    const handleExperienceChange = (index: number, key: string, value: string) => {
        const updated = [...data.work_experience];
        updated[index] = { ...updated[index], [key]: value };
        setData('work_experience', updated);
    };

    // Determine which tabs have validation errors
    const tabHasErrors = (tab: 'personal' | 'family' | 'education' | 'references' | 'custom') => {
        const keys: Record<string, string[]> = {
            personal: [
                'name', 'phone', 'birth_date', 'gender', 'ktp_number', 'mother_name', 'address', 'education_level', 'cv', 'profile_photo',
                'birth_place', 'religion', 'blood_type', 'height', 'weight', 'address_domicile', 'phone_domicile',
                'housing_status', 'npwp', 'bank_name', 'bank_account_number', 'size_shoe', 'size_uniform'
            ],
            family: [
                'father_name', 'father_birth_place_date', 'father_job', 'mother_birth_place_date', 'mother_job',
                'sibling_order', 'sibling_count', 'marital_status', 'spouse_name', 'spouse_birth_place_date',
                'child_1_name', 'child_1_birth_place_date', 'child_2_name', 'child_2_birth_place_date', 'child_3_name', 'child_3_birth_place_date'
            ],
            education: ['school_name_city', 'school_major', 'school_graduation_year', 'work_experience'],
            references: [
                'reference_name', 'reference_relationship', 'reference_phone',
                'emergency_name', 'emergency_relationship', 'emergency_phone', 'emergency_address'
            ],
            custom: customFields.map(f => `custom_${f.id}`)
        };

        return keys[tab].some(key => errors[key] !== undefined || Object.keys(errors).some(ek => ek.startsWith(`${key}.`)));
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
                            Isi formulir biodata lengkap Anda untuk melamar pekerjaan secara resmi.
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

                {/* Tab Switcher */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-px overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveTab('personal')}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                            activeTab === 'personal'
                                ? 'border-primary text-primary dark:text-primary-light'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        <iconify-icon icon="solar:user-bold-duotone" width="18"></iconify-icon>
                        <span>Data Diri</span>
                        {tabHasErrors('personal') && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('family')}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                            activeTab === 'family'
                                ? 'border-primary text-primary dark:text-primary-light'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        <iconify-icon icon="solar:users-group-two-rounded-bold-duotone" width="18"></iconify-icon>
                        <span>Keluarga</span>
                        {tabHasErrors('family') && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('education')}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                            activeTab === 'education'
                                ? 'border-primary text-primary dark:text-primary-light'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        <iconify-icon icon="solar:square-academic-cap-bold-duotone" width="18"></iconify-icon>
                        <span>Pendidikan & Kerja</span>
                        {tabHasErrors('education') && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('references')}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                            activeTab === 'references'
                                ? 'border-primary text-primary dark:text-primary-light'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        <iconify-icon icon="solar:phone-calling-bold-duotone" width="18"></iconify-icon>
                        <span>Referensi & Darurat</span>
                        {tabHasErrors('references') && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                    </button>

                    {customFields.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('custom')}
                            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                                activeTab === 'custom'
                                    ? 'border-primary text-primary dark:text-primary-light'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                            }`}
                        >
                            <iconify-icon icon="solar:add-square-bold-duotone" width="18"></iconify-icon>
                            <span>Tambahan</span>
                            {tabHasErrors('custom') && (
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            )}
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* TAB 1: DATA DIRI & DOMISILI */}
                    {activeTab === 'personal' && (
                        <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white flex items-center gap-2">
                                <iconify-icon icon="solar:user-bold-duotone" width="20" className="text-primary"></iconify-icon>
                                Data Pribadi
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="name">Nama Lengkap {isRequired('name') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Sesuai KTP"
                                        required={isRequired('name')}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone">Nomor HP / WhatsApp {isRequired('phone') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="0812XXXXXXXX"
                                        required={isRequired('phone')}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="birth_place">Tempat Lahir {isRequired('birth_place') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="birth_place"
                                        type="text"
                                        name="birth_place"
                                        value={data.birth_place}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('birth_place', e.target.value)}
                                        placeholder="Kota Kelahiran"
                                        required={isRequired('birth_place')}
                                    />
                                    <InputError message={errors.birth_place} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="birth_date">Tanggal Lahir {isRequired('birth_date') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="birth_date"
                                        type="date"
                                        name="birth_date"
                                        value={data.birth_date}
                                        className="mt-1 block w-full cursor-pointer"
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        required={isRequired('birth_date')}
                                    />
                                    <InputError message={errors.birth_date} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="gender">Jenis Kelamin {isRequired('gender') && <span className="text-red-500">*</span>}</InputLabel>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={data.gender}
                                        className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                        onChange={(e) => setData('gender', e.target.value)}
                                        required={isRequired('gender')}
                                    >
                                        <option value="">Belum dipilih</option>
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                    </select>
                                    <InputError message={errors.gender} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="religion">Agama {isRequired('religion') && <span className="text-red-500">*</span>}</InputLabel>
                                    <select
                                        id="religion"
                                        name="religion"
                                        value={data.religion}
                                        className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                        onChange={(e) => setData('religion', e.target.value)}
                                        required={isRequired('religion')}
                                    >
                                        <option value="">Belum dipilih</option>
                                        <option value="Islam">Islam</option>
                                        <option value="Kristen">Kristen</option>
                                        <option value="Katolik">Katolik</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Budha">Budha</option>
                                        <option value="Konghucu">Konghucu</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    <InputError message={errors.religion} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="blood_type">Golongan Darah {isRequired('blood_type') && <span className="text-red-500">*</span>}</InputLabel>
                                    <select
                                        id="blood_type"
                                        name="blood_type"
                                        value={data.blood_type}
                                        className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                        onChange={(e) => setData('blood_type', e.target.value)}
                                        required={isRequired('blood_type')}
                                    >
                                        <option value="">Belum dipilih</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                    </select>
                                    <InputError message={errors.blood_type} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="height">Tinggi (cm) {isRequired('height') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="height"
                                            type="number"
                                            name="height"
                                            value={data.height}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('height', e.target.value)}
                                            placeholder="Tinggi"
                                            required={isRequired('height')}
                                        />
                                        <InputError message={errors.height} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="weight">Berat (kg) {isRequired('weight') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="weight"
                                            type="number"
                                            name="weight"
                                            value={data.weight}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('weight', e.target.value)}
                                            placeholder="Berat"
                                            required={isRequired('weight')}
                                        />
                                        <InputError message={errors.weight} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="ktp_number">Nomor NIK KTP {isRequired('ktp_number') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="ktp_number"
                                        type="text"
                                        name="ktp_number"
                                        value={data.ktp_number}
                                        className="mt-1 block w-full"
                                        maxLength={16}
                                        onChange={(e) => setData('ktp_number', e.target.value)}
                                        placeholder="16 Digit NIK KTP"
                                        required={isRequired('ktp_number')}
                                    />
                                    <InputError message={errors.ktp_number} className="mt-2" />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">Alamat & Keuangan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="address">Alamat Sesuai KTP {isRequired('address') && <span className="text-red-500">*</span>}</InputLabel>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={data.address}
                                            className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm"
                                            rows={3}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Alamat lengkap sesuai KTP"
                                            required={isRequired('address')}
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="address_domicile">Alamat Tinggal / Domisili {isRequired('address_domicile') && <span className="text-red-500">*</span>}</InputLabel>
                                        <textarea
                                            id="address_domicile"
                                            name="address_domicile"
                                            value={data.address_domicile}
                                            className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm"
                                            rows={3}
                                            onChange={(e) => setData('address_domicile', e.target.value)}
                                            placeholder="Alamat lengkap tempat tinggal saat ini"
                                            required={isRequired('address_domicile')}
                                        />
                                        <InputError message={errors.address_domicile} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="phone_domicile">No. Telp Domisili (Rumah) {isRequired('phone_domicile') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="phone_domicile"
                                            type="text"
                                            name="phone_domicile"
                                            value={data.phone_domicile}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('phone_domicile', e.target.value)}
                                            placeholder="No. Telepon Rumah"
                                            required={isRequired('phone_domicile')}
                                        />
                                        <InputError message={errors.phone_domicile} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="housing_status">Status Kepemilikan Rumah {isRequired('housing_status') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="housing_status"
                                            type="text"
                                            name="housing_status"
                                            value={data.housing_status}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('housing_status', e.target.value)}
                                            placeholder="Contoh: Milik Sendiri, Sewa, Kos, Orang Tua"
                                            required={isRequired('housing_status')}
                                        />
                                        <InputError message={errors.housing_status} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="npwp">Nomor NPWP {isRequired('npwp') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="npwp"
                                            type="text"
                                            name="npwp"
                                            value={data.npwp}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('npwp', e.target.value)}
                                            placeholder="Nomor NPWP"
                                            required={isRequired('npwp')}
                                        />
                                        <InputError message={errors.npwp} className="mt-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="bank_name">Bank {isRequired('bank_name') && <span className="text-red-500">*</span>}</InputLabel>
                                            <TextInput
                                                id="bank_name"
                                                type="text"
                                                name="bank_name"
                                                value={data.bank_name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('bank_name', e.target.value)}
                                                placeholder="Nama Bank"
                                                required={isRequired('bank_name')}
                                            />
                                            <InputError message={errors.bank_name} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="bank_account_number">No. Rekening {isRequired('bank_account_number') && <span className="text-red-500">*</span>}</InputLabel>
                                            <TextInput
                                                id="bank_account_number"
                                                type="text"
                                                name="bank_account_number"
                                                value={data.bank_account_number}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('bank_account_number', e.target.value)}
                                                placeholder="No Rek"
                                                required={isRequired('bank_account_number')}
                                            />
                                            <InputError message={errors.bank_account_number} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">Ukuran & Dokumen Pendukung</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="size_shoe">Ukuran Sepatu {isRequired('size_shoe') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="size_shoe"
                                            type="number"
                                            name="size_shoe"
                                            value={data.size_shoe}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('size_shoe', e.target.value)}
                                            placeholder="Contoh: 42"
                                            required={isRequired('size_shoe')}
                                        />
                                        <InputError message={errors.size_shoe} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="size_uniform">Ukuran Seragam / Baju {isRequired('size_uniform') && <span className="text-red-500">*</span>}</InputLabel>
                                        <select
                                            id="size_uniform"
                                            name="size_uniform"
                                            value={data.size_uniform}
                                            className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                            onChange={(e) => setData('size_uniform', e.target.value)}
                                            required={isRequired('size_uniform')}
                                        >
                                            <option value="">Pilih Ukuran</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                            <option value="XXXL">XXXL</option>
                                        </select>
                                        <InputError message={errors.size_uniform} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="cv">Curriculum Vitae (CV) - PDF {isRequired('cv') && <span className="text-red-500">*</span>}</InputLabel>
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
                                            required={isRequired('cv') && !candidate.cv_path}
                                        />
                                        <span className="text-xs text-slate-400 mt-1 block">Maksimal 5MB.</span>
                                        <InputError message={errors.cv} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="profile_photo">Foto Profil {isRequired('profile_photo') && <span className="text-red-500">*</span>}</InputLabel>
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
                                            required={isRequired('profile_photo') && !candidate.profile_photo_path}
                                        />
                                        <span className="text-xs text-slate-400 mt-1 block">Maksimal 2MB.</span>
                                        <InputError message={errors.profile_photo} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: KELUARGA */}
                    {activeTab === 'family' && (
                        <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white flex items-center gap-2">
                                <iconify-icon icon="solar:users-group-two-rounded-bold-duotone" width="20" className="text-primary"></iconify-icon>
                                Data Susunan Keluarga
                            </h3>

                            <div className="space-y-6">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-l-4 border-primary pl-2">Data Orang Tua</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <InputLabel htmlFor="father_name">Nama Ayah {isRequired('father_name') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="father_name"
                                            type="text"
                                            name="father_name"
                                            value={data.father_name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('father_name', e.target.value)}
                                            placeholder="Nama Lengkap"
                                            required={isRequired('father_name')}
                                        />
                                        <InputError message={errors.father_name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="father_birth_place_date">Tempat, Tgl Lahir Ayah {isRequired('father_birth_place_date') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="father_birth_place_date"
                                            type="text"
                                            name="father_birth_place_date"
                                            value={data.father_birth_place_date}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('father_birth_place_date', e.target.value)}
                                            placeholder="Contoh: Kota, YYYY-MM-DD"
                                            required={isRequired('father_birth_place_date')}
                                        />
                                        <InputError message={errors.father_birth_place_date} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="father_job">Pekerjaan Ayah {isRequired('father_job') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="father_job"
                                            type="text"
                                            name="father_job"
                                            value={data.father_job}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('father_job', e.target.value)}
                                            placeholder="Pekerjaan"
                                            required={isRequired('father_job')}
                                        />
                                        <InputError message={errors.father_job} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="mother_name">Nama Ibu Kandung {isRequired('mother_name') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="mother_name"
                                            type="text"
                                            name="mother_name"
                                            value={data.mother_name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('mother_name', e.target.value)}
                                            placeholder="Nama Lengkap"
                                            required={isRequired('mother_name')}
                                        />
                                        <InputError message={errors.mother_name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="mother_birth_place_date">Tempat, Tgl Lahir Ibu {isRequired('mother_birth_place_date') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="mother_birth_place_date"
                                            type="text"
                                            name="mother_birth_place_date"
                                            value={data.mother_birth_place_date}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('mother_birth_place_date', e.target.value)}
                                            placeholder="Contoh: Kota, YYYY-MM-DD"
                                            required={isRequired('mother_birth_place_date')}
                                        />
                                        <InputError message={errors.mother_birth_place_date} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="mother_job">Pekerjaan Ibu {isRequired('mother_job') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="mother_job"
                                            type="text"
                                            name="mother_job"
                                            value={data.mother_job}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('mother_job', e.target.value)}
                                            placeholder="Pekerjaan"
                                            required={isRequired('mother_job')}
                                        />
                                        <InputError message={errors.mother_job} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-l-4 border-primary pl-2">Status & Kedudukan Anak</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <InputLabel htmlFor="sibling_order">Anak Ke- (Urutan Sibling) {isRequired('sibling_order') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="sibling_order"
                                            type="number"
                                            name="sibling_order"
                                            value={data.sibling_order}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('sibling_order', e.target.value)}
                                            placeholder="Contoh: 1"
                                            required={isRequired('sibling_order')}
                                        />
                                        <InputError message={errors.sibling_order} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sibling_count">Dari Jumlah Bersaudara {isRequired('sibling_count') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="sibling_count"
                                            type="number"
                                            name="sibling_count"
                                            value={data.sibling_count}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('sibling_count', e.target.value)}
                                            placeholder="Contoh: 3"
                                            required={isRequired('sibling_count')}
                                        />
                                        <InputError message={errors.sibling_count} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="marital_status">Status Pernikahan {isRequired('marital_status') && <span className="text-red-500">*</span>}</InputLabel>
                                        <select
                                            id="marital_status"
                                            name="marital_status"
                                            value={data.marital_status}
                                            className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                            onChange={(e) => setData('marital_status', e.target.value)}
                                            required={isRequired('marital_status')}
                                        >
                                            <option value="belum_nikah">Belum Menikah</option>
                                            <option value="nikah">Menikah</option>
                                            <option value="duda">Duda</option>
                                            <option value="janda">Janda</option>
                                        </select>
                                        <InputError message={errors.marital_status} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Married Specific Section */}
                            {data.marital_status === 'nikah' && (
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-l-4 border-primary pl-2">Data Suami / Istri & Anak</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel htmlFor="spouse_name">Nama Suami / Istri {isRequired('spouse_name') && <span className="text-red-500">*</span>}</InputLabel>
                                            <TextInput
                                                id="spouse_name"
                                                type="text"
                                                name="spouse_name"
                                                value={data.spouse_name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('spouse_name', e.target.value)}
                                                placeholder="Nama Lengkap Pasangan"
                                                required={isRequired('spouse_name')}
                                            />
                                            <InputError message={errors.spouse_name} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="spouse_birth_place_date">Tempat, Tgl Lahir Pasangan {isRequired('spouse_birth_place_date') && <span className="text-red-500">*</span>}</InputLabel>
                                            <TextInput
                                                id="spouse_birth_place_date"
                                                type="text"
                                                name="spouse_birth_place_date"
                                                value={data.spouse_birth_place_date}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('spouse_birth_place_date', e.target.value)}
                                                placeholder="Contoh: Kota, YYYY-MM-DD"
                                                required={isRequired('spouse_birth_place_date')}
                                            />
                                            <InputError message={errors.spouse_birth_place_date} className="mt-2" />
                                        </div>

                                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 md:col-span-2 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h5 className="font-semibold text-xs text-slate-400">Data Anak (Maksimal 3)</h5>
                                                {childrenList.length < 3 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAddChild}
                                                        className="text-[10px] font-bold bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <iconify-icon icon="solar:add-circle-bold" width="14"></iconify-icon>
                                                        Tambah Anak
                                                    </button>
                                                )}
                                            </div>

                                            {childrenList.length === 0 ? (
                                                <div className="bg-slate-50 dark:bg-dark-surface/40 p-4 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada data anak yang ditambahkan.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {childrenList.map((child, index) => (
                                                        <div key={index} className="space-y-4 p-4 bg-slate-50 dark:bg-dark-surface/40 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-bold text-xs text-primary">Anak #{index + 1}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveChild(index)}
                                                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                                                                >
                                                                    <iconify-icon icon="solar:trash-bin-trash-bold" width="12"></iconify-icon>
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor={`child_${index + 1}_name`}>Nama Anak {isRequired(`child_${index + 1}_name`) && <span className="text-red-500">*</span>}</InputLabel>
                                                                <TextInput
                                                                    id={`child_${index + 1}_name`}
                                                                    type="text"
                                                                    value={child.name}
                                                                    className="mt-1 block w-full bg-white dark:bg-dark-surface"
                                                                    onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                                                                    placeholder="Nama"
                                                                    required={isRequired(`child_${index + 1}_name`)}
                                                                />
                                                                <InputError message={errors[`child_${index + 1}_name`]} className="mt-2" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor={`child_${index + 1}_birth_place_date`}>Tempat, Tgl Lahir {isRequired(`child_${index + 1}_birth_place_date`) && <span className="text-red-500">*</span>}</InputLabel>
                                                                <TextInput
                                                                    id={`child_${index + 1}_birth_place_date`}
                                                                    type="text"
                                                                    value={child.birth_place_date}
                                                                    className="mt-1 block w-full bg-white dark:bg-dark-surface"
                                                                    onChange={(e) => handleChildChange(index, 'birth_place_date', e.target.value)}
                                                                    placeholder="Kota, YYYY-MM-DD"
                                                                    required={isRequired(`child_${index + 1}_birth_place_date`)}
                                                                />
                                                                <InputError message={errors[`child_${index + 1}_birth_place_date`]} className="mt-2" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: PENDIDIKAN & PENGALAMAN KERJA */}
                    {activeTab === 'education' && (
                        <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white flex items-center gap-2">
                                <iconify-icon icon="solar:square-academic-cap-bold-duotone" width="20" className="text-primary"></iconify-icon>
                                Pendidikan Terakhir
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="education_level">Tingkat Pendidikan Terakhir {isRequired('education_level') && <span className="text-red-500">*</span>}</InputLabel>
                                    <select
                                        id="education_level"
                                        name="education_level"
                                        value={data.education_level}
                                        className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                        onChange={(e) => setData('education_level', e.target.value)}
                                        required={isRequired('education_level')}
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

                                <div>
                                    <InputLabel htmlFor="school_name_city">Nama Sekolah / Perguruan Tinggi & Kota {isRequired('school_name_city') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="school_name_city"
                                        type="text"
                                        name="school_name_city"
                                        value={data.school_name_city}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('school_name_city', e.target.value)}
                                        placeholder="Nama Sekolah, Kota"
                                        required={isRequired('school_name_city')}
                                    />
                                    <InputError message={errors.school_name_city} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="school_major">Jurusan {isRequired('school_major') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="school_major"
                                        type="text"
                                        name="school_major"
                                        value={data.school_major}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('school_major', e.target.value)}
                                        placeholder="Jurusan (Contoh: IPA, Teknik Informatika)"
                                        required={isRequired('school_major')}
                                    />
                                    <InputError message={errors.school_major} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="school_graduation_year">Tahun Kelulusan {isRequired('school_graduation_year') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="school_graduation_year"
                                        type="number"
                                        name="school_graduation_year"
                                        value={data.school_graduation_year}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('school_graduation_year', e.target.value)}
                                        placeholder="Contoh: 2020"
                                        required={isRequired('school_graduation_year')}
                                    />
                                    <InputError message={errors.school_graduation_year} className="mt-2" />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <iconify-icon icon="solar:case-round-bold-duotone" width="18" className="text-primary"></iconify-icon>
                                        Riwayat Pengalaman Kerja (Maksimal 4)
                                    </h4>
                                    <button
                                        type="button"
                                        disabled={data.work_experience.length >= 4}
                                        onClick={handleAddExperience}
                                        className="text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <iconify-icon icon="solar:add-circle-bold" width="16"></iconify-icon>
                                        Tambah Pengalaman
                                    </button>
                                </div>

                                {data.work_experience.length === 0 ? (
                                    <div className="bg-slate-50 dark:bg-dark-surface/40 p-8 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                                        <iconify-icon icon="solar:case-minimalistic-bold-duotone" width="40" className="text-slate-300 dark:text-slate-700"></iconify-icon>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Belum ada riwayat pengalaman kerja.</p>
                                        <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk menambahkan pengalaman kerja.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {data.work_experience.map((exp: any, index: number) => (
                                            <div key={index} className="bg-slate-50 dark:bg-dark-surface/40 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4 relative">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-primary">Pengalaman Kerja #{index + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExperience(index)}
                                                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                                                    >
                                                        <iconify-icon icon="solar:trash-bin-trash-bold" width="14"></iconify-icon>
                                                        Hapus
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <InputLabel value="Nama Perusahaan" />
                                                        <TextInput
                                                            type="text"
                                                            value={exp.company}
                                                            className="mt-1 block w-full bg-white dark:bg-dark-surface"
                                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                            placeholder="PT Contoh Indonesia"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Jabatan / Posisi" />
                                                        <TextInput
                                                            type="text"
                                                            value={exp.position}
                                                            className="mt-1 block w-full bg-white dark:bg-dark-surface"
                                                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                                            placeholder="Staff / Supervisor"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Masa Kerja (Period)" />
                                                        <TextInput
                                                            type="text"
                                                            value={exp.period}
                                                            className="mt-1 block w-full bg-white dark:bg-dark-surface"
                                                            onChange={(e) => handleExperienceChange(index, 'period', e.target.value)}
                                                            placeholder="Contoh: Jan 2020 - Des 2022"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Gaji Terakhir (IDR)" />
                                                        <TextInput
                                                            type="text"
                                                            value={exp.last_salary}
                                                            className="mt-1 block w-full bg-white dark:bg-dark-surface"
                                                            onChange={(e) => handleExperienceChange(index, 'last_salary', e.target.value)}
                                                            placeholder="Contoh: 5000000"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <InputLabel value="Alasan Resign" />
                                                        <TextInput
                                                            type="text"
                                                            value={exp.resign_reason}
                                                            className="mt-1 block w-full bg-white dark:bg-dark-surface"
                                                            onChange={(e) => handleExperienceChange(index, 'resign_reason', e.target.value)}
                                                            placeholder="Alasan pengunduran diri"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: REFERENSI & DARURAT */}
                    {activeTab === 'references' && (
                        <div className="bg-white dark:bg-dark-surface/20 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white flex items-center gap-2">
                                <iconify-icon icon="solar:phone-calling-bold-duotone" width="20" className="text-primary"></iconify-icon>
                                Kontak Referensi
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel htmlFor="reference_name">Nama Referensi {isRequired('reference_name') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="reference_name"
                                        type="text"
                                        name="reference_name"
                                        value={data.reference_name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('reference_name', e.target.value)}
                                        placeholder="Nama Lengkap"
                                        required={isRequired('reference_name')}
                                    />
                                    <InputError message={errors.reference_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="reference_relationship">Hubungan Referensi {isRequired('reference_relationship') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="reference_relationship"
                                        type="text"
                                        name="reference_relationship"
                                        value={data.reference_relationship}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('reference_relationship', e.target.value)}
                                        placeholder="Contoh: Mantan Atasan / Rekan Kerja"
                                        required={isRequired('reference_relationship')}
                                    />
                                    <InputError message={errors.reference_relationship} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="reference_phone">No. HP Referensi {isRequired('reference_phone') && <span className="text-red-500">*</span>}</InputLabel>
                                    <TextInput
                                        id="reference_phone"
                                        type="tel"
                                        name="reference_phone"
                                        value={data.reference_phone}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('reference_phone', e.target.value)}
                                        placeholder="08XXXXXXXX"
                                        required={isRequired('reference_phone')}
                                    />
                                    <InputError message={errors.reference_phone} className="mt-2" />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                                <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white flex items-center gap-2">
                                    <iconify-icon icon="solar:danger-bold-duotone" width="20" className="text-primary"></iconify-icon>
                                    Kontak Darurat
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <InputLabel htmlFor="emergency_name">Nama Kontak Darurat {isRequired('emergency_name') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="emergency_name"
                                            type="text"
                                            name="emergency_name"
                                            value={data.emergency_name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('emergency_name', e.target.value)}
                                            placeholder="Nama Lengkap"
                                            required={isRequired('emergency_name')}
                                        />
                                        <InputError message={errors.emergency_name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="emergency_relationship">Hubungan {isRequired('emergency_relationship') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="emergency_relationship"
                                            type="text"
                                            name="emergency_relationship"
                                            value={data.emergency_relationship}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('emergency_relationship', e.target.value)}
                                            placeholder="Contoh: Orang Tua / Saudara / Pasangan"
                                            required={isRequired('emergency_relationship')}
                                        />
                                        <InputError message={errors.emergency_relationship} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="emergency_phone">No. HP Darurat {isRequired('emergency_phone') && <span className="text-red-500">*</span>}</InputLabel>
                                        <TextInput
                                            id="emergency_phone"
                                            type="tel"
                                            name="emergency_phone"
                                            value={data.emergency_phone}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('emergency_phone', e.target.value)}
                                            placeholder="08XXXXXXXX"
                                            required={isRequired('emergency_phone')}
                                        />
                                        <InputError message={errors.emergency_phone} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-3">
                                        <InputLabel htmlFor="emergency_address">Alamat Lengkap Kontak Darurat {isRequired('emergency_address') && <span className="text-red-500">*</span>}</InputLabel>
                                        <textarea
                                            id="emergency_address"
                                            name="emergency_address"
                                            value={data.emergency_address}
                                            className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm"
                                            rows={3}
                                            onChange={(e) => setData('emergency_address', e.target.value)}
                                            placeholder="Alamat lengkap kontak darurat"
                                            required={isRequired('emergency_address')}
                                        />
                                        <InputError message={errors.emergency_address} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: INFORMASI TAMBAHAN (CUSTOM FIELDS) */}
                    {activeTab === 'custom' && customFields.length > 0 && (
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
