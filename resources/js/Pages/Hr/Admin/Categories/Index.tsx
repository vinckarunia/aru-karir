import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { PageProps } from '@/types';

interface JobCategory {
    id: number;
    name: string;
    slug: string;
    job_listings_count?: number;
}

interface Props {
    categories: JobCategory[];
}

export default function JobCategoryIndex({ categories }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null);

    // Create form
    const createForm = useForm({
        name: '',
        slug: '',
    });

    // Edit form
    const editForm = useForm({
        name: '',
        slug: '',
    });

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (category: JobCategory) => {
        setSelectedCategory(category);
        editForm.setData({
            name: category.name,
            slug: category.slug,
        });
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (category: JobCategory) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.categories.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        editForm.put(route('admin.categories.update', selectedCategory.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        
        editForm.delete(route('admin.categories.destroy', selectedCategory.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            },
        });
    };

    return (
        <HrLayout title="Kategori Pekerjaan" header="Manajemen Kategori Pekerjaan">
            <Head title="Kategori Pekerjaan" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm font-semibold shadow-sm">
                    <iconify-icon icon="solar:check-circle-bold" width="20" className="text-emerald-500 shrink-0"></iconify-icon>
                    <span>{flash.success}</span>
                </div>
            )}

            {flash?.error && (
                <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl text-red-800 dark:text-red-300 text-sm font-semibold shadow-sm">
                    <iconify-icon icon="solar:danger-circle-bold" width="20" className="text-red-500 shrink-0"></iconify-icon>
                    <span>{flash.error}</span>
                </div>
            )}

            {/* Header section with CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Daftar Kategori Lowongan</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Buat dan kelola kategori/departemen untuk mengelompokkan lowongan pekerjaan Anda.
                    </p>
                </div>
                
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                    <iconify-icon icon="solar:tag-bold" width="18"></iconify-icon>
                    Tambah Kategori
                </button>
            </div>

            {/* Table layout */}
            <div className="glass rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-surface/10 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Nama Kategori</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Total Lowongan</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-surface/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                                            {cat.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400 dark:text-slate-500">{cat.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {cat.job_listings_count ?? 0} lowongan
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title="Ubah"
                                                >
                                                    <iconify-icon icon="solar:pen-bold-duotone" width="18"></iconify-icon>
                                                </button>
                                                
                                                <button
                                                    onClick={() => openDeleteModal(cat)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Hapus"
                                                >
                                                    <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="18"></iconify-icon>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                                        Tidak ada kategori pekerjaan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Tambah Kategori Baru</h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Kategori" />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={createForm.data.name}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Teknisi, Driver, Cleaning Service..."
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="slug" value="Custom Slug (Opsional)" />
                            <TextInput
                                id="slug"
                                type="text"
                                name="slug"
                                value={createForm.data.slug}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('slug', e.target.value)}
                                placeholder="Biarkan kosong untuk auto-generate"
                            />
                            <InputError message={createForm.errors.slug} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <SecondaryButton type="button" onClick={() => setIsCreateModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={createForm.processing}>
                            {createForm.processing ? 'Menyimpan...' : 'Tambah Kategori'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleEditSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Ubah Kategori</h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Kategori" />
                            <TextInput
                                id="edit_name"
                                type="text"
                                name="name"
                                value={editForm.data.name}
                                className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_slug" value="Slug" />
                            <TextInput
                                id="edit_slug"
                                type="text"
                                name="slug"
                                value={editForm.data.slug}
                                className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('slug', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.slug} className="mt-2" />
                        </div>
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
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Hapus Kategori</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Apakah Anda yakin ingin menghapus kategori <strong>{selectedCategory?.name}</strong>? Tindakan ini akan melepas kategori dari semua lowongan pekerjaan terkait.
                    </p>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsDeleteModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton type="submit" disabled={editForm.processing}>
                            {editForm.processing ? 'Menghapus...' : 'Hapus Kategori'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </HrLayout>
    );
}
