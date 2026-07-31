import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import HrLayout from '@/Layouts/HrLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { PageProps } from '@/types';

interface BusinessOption {
    id: number;
    group: string;
    code: string;
    label: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    groups: Record<string, string>;
    options: BusinessOption[];
}

export default function Index({ groups, options }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<BusinessOption | null>(null);
    const form = useForm({ group: Object.keys(groups)[0] || '', code: '', label: '', sort_order: '' as number | string, is_active: true });

    const openCreate = (group?: string) => {
        setEditing(null);
        form.setData({ group: group || Object.keys(groups)[0] || '', code: '', label: '', sort_order: '', is_active: true });
        form.clearErrors();
        setIsOpen(true);
    };

    const openEdit = (option: BusinessOption) => {
        setEditing(option);
        form.setData({ group: option.group, code: option.code, label: option.label, sort_order: option.sort_order, is_active: option.is_active });
        form.clearErrors();
        setIsOpen(true);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const request = editing
            ? form.put(route('admin.options.update', editing.id), { onSuccess: () => setIsOpen(false) })
            : form.post(route('admin.options.store'), { onSuccess: () => setIsOpen(false) });
        return request;
    };

    return (
        <HrLayout title="Opsi Pilihan" header="Konfigurasi Opsi Pilihan">
            <Head title="Opsi Pilihan" />

            {flash?.success && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
                    {flash.success}
                </div>
            )}

            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Master Opsi Bisnis</h2>
                    <p className="mt-1 text-xs text-slate-400">Kode disimpan sebagai nilai data; label adalah teks yang tampil kepada pengguna.</p>
                </div>
                <button type="button" onClick={() => openCreate()} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">
                    Tambah Opsi
                </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                {Object.entries(groups).map(([group, groupLabel]) => {
                    const groupOptions = options.filter((option) => option.group === group);
                    return (
                        <section key={group} className="glass overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4 dark:border-slate-800/60">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">{groupLabel}</h3>
                                    <p className="text-xs text-slate-400">{groupOptions.filter((item) => item.is_active).length} opsi aktif</p>
                                </div>
                                <button type="button" onClick={() => openCreate(group)} className="rounded-lg px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10">
                                    + Tambah
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {groupOptions.map((option) => (
                                    <button key={option.id} type="button" onClick={() => openEdit(option)} className={`flex w-full items-center justify-between gap-4 px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 ${!option.is_active ? 'opacity-50' : ''}`}>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{option.label}</span>
                                            <span className="font-mono text-[10px] text-slate-400">{option.code}</span>
                                        </span>
                                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${option.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'}`}>
                                            {option.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            <Modal show={isOpen} onClose={() => setIsOpen(false)}>
                <form onSubmit={submit} className="space-y-5 p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editing ? 'Ubah Opsi' : 'Tambah Opsi'}</h3>
                    <div>
                        <InputLabel htmlFor="option_group" value="Kelompok" />
                        <select id="option_group" value={form.data.group} disabled={!!editing} onChange={(e) => form.setData('group', e.target.value)} className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-dark-surface/50">
                            {Object.entries(groups).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <InputError message={form.errors.group} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="option_code" value="Kode Stabil" />
                        <TextInput id="option_code" value={form.data.code} disabled={!!editing} onChange={(e) => form.setData('code', e.target.value)} className="mt-1 block w-full" placeholder="contoh: pkwt" required />
                        <p className="mt-1 text-[10px] text-slate-400">Kode tidak dapat diubah setelah dibuat agar data lama tetap konsisten.</p>
                        <InputError message={form.errors.code} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="option_label" value="Label Tampilan" />
                        <TextInput id="option_label" value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} className="mt-1 block w-full" required />
                        <InputError message={form.errors.label} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="option_order" value="Urutan Tampilan" />
                        <TextInput id="option_order" type="number" min="1" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} className="mt-1 block w-full" placeholder="Otomatis di urutan terakhir" />
                        <InputError message={form.errors.sort_order} className="mt-2" />
                    </div>
                    {editing && (
                        <label className="flex items-center gap-3">
                            <Checkbox checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Opsi aktif</span>
                        </label>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500">Batal</button>
                        <button type="submit" disabled={form.processing} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">Simpan</button>
                    </div>
                </form>
            </Modal>
        </HrLayout>
    );
}
