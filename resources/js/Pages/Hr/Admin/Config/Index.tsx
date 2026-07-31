import { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Checkbox from '@/Components/Checkbox';
import { PageProps } from '@/types';

interface CandidateProfileField {
    id: number;
    field_name: string;
    field_label: string;
    field_type: 'text' | 'textarea' | 'file' | 'select' | 'checklist';
    form_section: 'personal' | 'family' | 'education' | 'references' | 'custom';
    is_required: boolean;
    sort_order: number;
    options: string[] | null;
    is_active: boolean;
}

interface Props {
    fields: CandidateProfileField[];
}

export default function ProfileFieldsIndex({ fields }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<CandidateProfileField | null>(null);

    // Temp state for options
    const [tempOptions, setTempOptions] = useState<string[]>([]);
    const [newOptionText, setNewOptionText] = useState('');

    // Create form
    const createForm = useForm({
        field_name: '',
        field_label: '',
        field_type: 'text' as 'text' | 'textarea' | 'file' | 'select' | 'checklist',
        form_section: 'custom' as CandidateProfileField['form_section'],
        is_required: false,
        options: [] as string[],
    });

    // Edit form
    const editForm = useForm({
        field_label: '',
        field_type: 'text' as 'text' | 'textarea' | 'file' | 'select' | 'checklist',
        form_section: 'custom' as CandidateProfileField['form_section'],
        is_required: false,
        options: [] as string[],
        is_active: true,
    });

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setTempOptions([]);
        setNewOptionText('');
        setIsCreateModalOpen(true);
    };

    const openEditModal = (field: CandidateProfileField) => {
        setSelectedField(field);
        editForm.setData({
            field_label: field.field_label,
            field_type: field.field_type,
            form_section: field.form_section,
            is_required: field.is_required,
            options: field.options || [],
            is_active: field.is_active,
        });
        setTempOptions(field.options || []);
        setNewOptionText('');
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (field: CandidateProfileField) => {
        setSelectedField(field);
        setIsDeleteModalOpen(true);
    };

    // Add option helper
    const handleAddOption = () => {
        if (!newOptionText.trim()) return;
        if (tempOptions.includes(newOptionText.trim())) return;

        const updated = [...tempOptions, newOptionText.trim()];
        setTempOptions(updated);
        setNewOptionText('');
        
        createForm.setData('options', updated);
        editForm.setData('options', updated);
    };

    // Remove option helper
    const handleRemoveOption = (index: number) => {
        const updated = tempOptions.filter((_, i) => i !== index);
        setTempOptions(updated);
        
        createForm.setData('options', updated);
        editForm.setData('options', updated);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.config.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedField) return;
        editForm.put(route('admin.config.update', selectedField.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedField) return;
        
        editForm.delete(route('admin.config.destroy', selectedField.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            },
        });
    };

    // Reordering helper (shifts item up or down in array and syncs with backend)
    const handleMove = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= fields.length) return;

        const newFields = [...fields];
        const temp = newFields[index];
        newFields[index] = newFields[targetIndex];
        newFields[targetIndex] = temp;

        const ids = newFields.map((f) => f.id);
        
        router.post(route('admin.config.reorder'), { ids }, {
            preserveScroll: true,
        });
    };

    return (
        <HrLayout title="Konfigurasi Profil" header="Konfigurasi Profil Kandidat">
            <Head title="Konfigurasi Profil" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm font-semibold shadow-sm">
                    <iconify-icon icon="solar:check-circle-bold" width="20" className="text-emerald-500 shrink-0"></iconify-icon>
                    <span>{flash.success}</span>
                </div>
            )}

            {/* Header section with CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Field Profil Kustom</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Buat formulir biodata tambahan yang harus diisi pelamar ketika melengkapi profil rekrutmen.
                    </p>
                </div>
                
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                    <iconify-icon icon="solar:add-square-bold" width="18"></iconify-icon>
                    Tambah Field Kustom
                </button>
            </div>

            {/* List with sorting */}
            <div className="space-y-4">
                {fields.length > 0 ? (
                    fields.map((field, index) => (
                        <div
                            key={field.id}
                            className={`glass rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                                !field.is_active ? 'opacity-60 bg-slate-50/50 dark:bg-dark-surface/5' : ''
                            }`}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Sorting buttons */}
                                <div className="flex flex-col gap-1.5 shrink-0">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                        title="Pindahkan ke atas"
                                    >
                                        <iconify-icon icon="solar:alt-arrow-up-linear" width="14"></iconify-icon>
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === fields.length - 1}
                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                        title="Pindahkan ke bawah"
                                    >
                                        <iconify-icon icon="solar:alt-arrow-down-linear" width="14"></iconify-icon>
                                    </button>
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-slate-800 dark:text-white truncate">
                                            {field.field_label}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                            {field.field_name}
                                        </span>
                                        {field.is_required && (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                                                Wajib
                                            </span>
                                        )}
                                        {!field.is_active && (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-400">
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <iconify-icon icon={
                                            field.field_type === 'text' ? 'solar:text-bold-duotone' :
                                            field.field_type === 'textarea' ? 'solar:align-left-bold-duotone' :
                                            field.field_type === 'file' ? 'solar:file-bold-duotone' : 'solar:list-down-minimalistic-bold-duotone'
                                        } width="14"></iconify-icon>
                                        Tipe: <span className="font-medium text-slate-500 dark:text-slate-300 uppercase">{field.field_type}</span>
                                    </p>
                                    
                                    <p className="mt-1 text-xs text-slate-400">Penempatan: {field.form_section}</p>
                                    {['select', 'checklist'].includes(field.field_type) && field.options && (
                                        <div className="flex flex-wrap gap-1 mt-2.5">
                                            {field.options.map((opt) => (
                                                <span key={opt} className="px-2 py-0.5 rounded bg-primary/5 border border-primary/10 text-primary dark:text-primary-light text-[10px] font-semibold">
                                                    {opt}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <button
                                    onClick={() => openEditModal(field)}
                                    className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Ubah"
                                >
                                    <iconify-icon icon="solar:pen-bold-duotone" width="18"></iconify-icon>
                                </button>
                                <button
                                    onClick={() => openDeleteModal(field)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus"
                                >
                                    <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="18"></iconify-icon>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass rounded-3xl p-10 text-center text-slate-400 border border-slate-200/60 dark:border-slate-800/60 italic text-sm">
                        Belum ada field profil kustom yang ditambahkan.
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Tambah Field Kustom</h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="field_label" value="Label Form (Bahasa Indonesia)" />
                            <TextInput
                                id="field_label"
                                type="text"
                                value={createForm.data.field_label}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('field_label', e.target.value)}
                                placeholder="Contoh: Nomor Pokok Wajib Pajak (NPWP)"
                                required
                            />
                            <InputError message={createForm.errors.field_label} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="field_name" value="Nama Field Database (snake_case)" />
                            <TextInput
                                id="field_name"
                                type="text"
                                value={createForm.data.field_name}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('field_name', e.target.value)}
                                placeholder="Contoh: npwp, bpjs_kesehatan, tinggi_badan"
                                required
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                                Gunakan huruf kecil, angka, dan underscore saja. Pastikan unik dan tidak tabrakan dengan kolom standar.
                            </span>
                            <InputError message={createForm.errors.field_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="field_type" value="Tipe Field Input" />
                            <select
                                id="field_type"
                                value={createForm.data.field_type}
                                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                onChange={(e) => {
                                    const val = e.target.value as any;
                                    createForm.setData('field_type', val);
                                }}
                                required
                            >
                                <option value="text">Text (Satu Baris)</option>
                                <option value="textarea">Textarea (Paragraf)</option>
                                <option value="file">File Upload (PDF/Dokumen)</option>
                                <option value="select">Dropdown (Pilihan)</option>
                                <option value="checklist">Checklist (Bisa Pilih Banyak)</option>
                            </select>
                            <InputError message={createForm.errors.field_type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="form_section" value="Penempatan pada Form Profil" />
                            <select id="form_section" value={createForm.data.form_section} onChange={(e) => createForm.setData('form_section', e.target.value as CandidateProfileField['form_section'])} className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3">
                                <option value="personal">Data Diri</option><option value="family">Keluarga</option><option value="education">Pendidikan & Kerja</option><option value="references">Referensi & Darurat</option><option value="custom">Bagian Tambahan</option>
                            </select>
                            <InputError message={createForm.errors.form_section} className="mt-2" />
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <Checkbox
                                id="is_required"
                                checked={createForm.data.is_required}
                                onChange={(e) => createForm.setData('is_required', e.target.checked)}
                            />
                            <InputLabel htmlFor="is_required" value="Field Wajib Diisi (Required)" className="cursor-pointer" />
                        </div>

                        {['select', 'checklist'].includes(createForm.data.field_type) && (
                            <div className="border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl bg-slate-50/50 dark:bg-dark-surface/10 space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opsi Pilihan Dropdown</h4>
                                
                                <div className="flex items-center gap-2">
                                    <TextInput
                                        type="text"
                                        value={newOptionText}
                                        onChange={(e) => setNewOptionText(e.target.value)}
                                        className="w-full !px-3 !py-2 text-xs"
                                        placeholder="Ketik opsi lalu tekan Tambah"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                                    >
                                        Tambah Opsi
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {tempOptions.map((opt, idx) => (
                                        <span key={opt} className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                                            {opt}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(idx)}
                                                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                            >
                                                <iconify-icon icon="solar:close-circle-bold" width="14"></iconify-icon>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <InputError message={createForm.errors.options} className="mt-2" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <SecondaryButton type="button" onClick={() => setIsCreateModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={createForm.processing}>
                            {createForm.processing ? 'Menyimpan...' : 'Tambah Field'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleEditSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Ubah Field Kustom</h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_field_label" value="Label Form" />
                            <TextInput
                                id="edit_field_label"
                                type="text"
                                value={editForm.data.field_label}
                                className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('field_label', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.field_label} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_field_type" value="Tipe Field Input" />
                            <select
                                id="edit_field_type"
                                value={editForm.data.field_type}
                                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                onChange={(e) => {
                                    const val = e.target.value as any;
                                    editForm.setData('field_type', val);
                                }}
                                required
                            >
                                <option value="text">Text (Satu Baris)</option>
                                <option value="textarea">Textarea (Paragraf)</option>
                                <option value="file">File Upload (PDF/Dokumen)</option>
                                <option value="select">Dropdown (Pilihan)</option>
                                <option value="checklist">Checklist (Bisa Pilih Banyak)</option>
                            </select>
                            <InputError message={editForm.errors.field_type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_form_section" value="Penempatan pada Form Profil" />
                            <select id="edit_form_section" value={editForm.data.form_section} onChange={(e) => editForm.setData('form_section', e.target.value as CandidateProfileField['form_section'])} className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3">
                                <option value="personal">Data Diri</option><option value="family">Keluarga</option><option value="education">Pendidikan & Kerja</option><option value="references">Referensi & Darurat</option><option value="custom">Bagian Tambahan</option>
                            </select>
                            <InputError message={editForm.errors.form_section} className="mt-2" />
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <Checkbox
                                id="edit_is_required"
                                checked={editForm.data.is_required}
                                onChange={(e) => editForm.setData('is_required', e.target.checked)}
                            />
                            <InputLabel htmlFor="edit_is_required" value="Field Wajib Diisi (Required)" className="cursor-pointer" />
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <Checkbox
                                id="edit_is_active"
                                checked={editForm.data.is_active}
                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                            />
                            <InputLabel htmlFor="edit_is_active" value="Aktif (Tampilkan di Formulir Pelamar)" className="cursor-pointer" />
                        </div>

                        {['select', 'checklist'].includes(editForm.data.field_type) && (
                            <div className="border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl bg-slate-50/50 dark:bg-dark-surface/10 space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opsi Pilihan Dropdown</h4>
                                
                                <div className="flex items-center gap-2">
                                    <TextInput
                                        type="text"
                                        value={newOptionText}
                                        onChange={(e) => setNewOptionText(e.target.value)}
                                        className="w-full !px-3 !py-2 text-xs"
                                        placeholder="Ketik opsi lalu tekan Tambah"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                                    >
                                        Tambah Opsi
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {tempOptions.map((opt, idx) => (
                                        <span key={opt} className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                                            {opt}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(idx)}
                                                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                            >
                                                <iconify-icon icon="solar:close-circle-bold" width="14"></iconify-icon>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <InputError message={editForm.errors.options} className="mt-2" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <SecondaryButton type="button" onClick={() => setIsEditModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={editForm.processing}>
                            {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <form onSubmit={handleDeleteSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Hapus Field Kustom</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Apakah Anda yakin ingin menghapus field kustom <strong>{selectedField?.field_label}</strong>? Tindakan ini akan menghapus permanen data isian dari semua pelamar yang telah mengisinya.
                    </p>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsDeleteModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton type="submit" disabled={editForm.processing}>
                            {editForm.processing ? 'Menghapus...' : 'Hapus Field'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </HrLayout>
    );
}
