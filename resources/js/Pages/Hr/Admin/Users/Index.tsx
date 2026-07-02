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

interface HrUser {
    id: string;
    name: string;
    email: string;
    role: 'hr' | 'admin';
}

interface Props {
    users: HrUser[];
}

export default function HrUserIndex({ users }: Props) {
    const { auth, flash } = usePage<PageProps>().props;
    const currentUser = auth.hr!;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<HrUser | null>(null);

    // Create form
    const createForm = useForm({
        name: '',
        email: '',
        role: 'hr' as 'hr' | 'admin',
        password: '',
    });

    // Edit form
    const editForm = useForm({
        name: '',
        email: '',
        role: 'hr' as 'hr' | 'admin',
        password: '',
    });

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user: HrUser) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
        });
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user: HrUser) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.users.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        editForm.put(route('admin.users.update', selectedUser.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        
        editForm.delete(route('admin.users.destroy', selectedUser.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            },
        });
    };

    return (
        <HrLayout title="Manajemen HR" header="Manajemen Akun HR & Admin">
            <Head title="Manajemen HR" />

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
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Daftar Akun Pengguna HR</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Kelola akun perekrut (HR Recruiter) dan administrator sistem ARUKarir Portal.
                    </p>
                </div>
                
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                    <iconify-icon icon="solar:user-plus-bold" width="18"></iconify-icon>
                    Tambah Akun HR
                </button>
            </div>

            {/* Table layout */}
            <div className="glass rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-surface/10 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Peran / Role</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-surface/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                                            {user.name}
                                            {user.id === currentUser.id && (
                                                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                                                    Saya
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{user.email}</td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:text-primary-light">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                                    HR Recruiter
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title="Ubah"
                                                >
                                                    <iconify-icon icon="solar:pen-bold-duotone" width="18"></iconify-icon>
                                                </button>
                                                
                                                {user.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Hapus"
                                                    >
                                                        <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="18"></iconify-icon>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                                        Tidak ada data akun HR.
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
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Tambah Akun HR Baru</h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={createForm.data.name}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={createForm.data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Peran / Role" />
                            <select
                                id="role"
                                name="role"
                                value={createForm.data.role}
                                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                onChange={(e) => createForm.setData('role', e.target.value as any)}
                                required
                            >
                                <option value="hr">HR Recruiter</option>
                                <option value="admin">Admin</option>
                            </select>
                            <InputError message={createForm.errors.role} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={createForm.data.password}
                                className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.password} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <SecondaryButton type="button" onClick={() => setIsCreateModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={createForm.processing}>
                            {createForm.processing ? 'Menyimpan...' : 'Tambah Akun'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleEditSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Ubah Akun HR</h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Lengkap" />
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
                            <InputLabel htmlFor="edit_email" value="Email" />
                            <TextInput
                                id="edit_email"
                                type="email"
                                name="email"
                                value={editForm.data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_role" value="Peran / Role" />
                            <select
                                id="edit_role"
                                name="role"
                                value={editForm.data.role}
                                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-surface/40 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring focus:ring-primary/20 dark:focus:ring-primary/10 transition-colors shadow-sm text-sm cursor-pointer"
                                onChange={(e) => editForm.setData('role', e.target.value as any)}
                                required
                            >
                                <option value="hr">HR Recruiter</option>
                                <option value="admin">Admin</option>
                            </select>
                            <InputError message={editForm.errors.role} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_password" value="Password Baru (Kosongkan jika tidak diubah)" />
                            <TextInput
                                id="edit_password"
                                type="password"
                                name="password"
                                value={editForm.data.password}
                                className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('password', e.target.value)}
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">Minimal 8 karakter.</span>
                            <InputError message={editForm.errors.password} className="mt-2" />
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
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Hapus Akun HR</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Apakah Anda yakin ingin menghapus akun <strong>{selectedUser?.name}</strong> ({selectedUser?.email})? Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsDeleteModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton type="submit" disabled={editForm.processing}>
                            {editForm.processing ? 'Menghapus...' : 'Hapus Akun'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </HrLayout>
    );
}
