import { useMemo, useState } from 'react';
import Modal from '@/Components/Modal';

export interface HrisProject {
    id: string | number;
    name: string;
    client?: {
        id: string | number;
        name: string;
    } | null;
}

interface Props {
    projects: HrisProject[];
    selectedId: string;
    onSelect: (projectId: string) => void;
}

export default function HrisProjectPicker({ projects, selectedId, onSelect }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [clientId, setClientId] = useState('');

    const selectedProject = projects.find((project) => String(project.id) === selectedId);

    const clients = useMemo(() => {
        const uniqueClients = new Map<string, string>();

        projects.forEach((project) => {
            if (project.client) {
                uniqueClients.set(String(project.client.id), project.client.name);
            }
        });

        return Array.from(uniqueClients, ([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name, 'id'));
    }, [projects]);

    const filteredProjects = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase('id');

        return projects.filter((project) => {
            const matchesClient = !clientId || String(project.client?.id) === clientId;
            const matchesKeyword = !keyword
                || project.name.toLocaleLowerCase('id').includes(keyword)
                || project.client?.name.toLocaleLowerCase('id').includes(keyword);

            return matchesClient && matchesKeyword;
        });
    }, [clientId, projects, search]);

    const close = () => {
        setIsOpen(false);
        setSearch('');
        setClientId('');
    };

    const selectProject = (project: HrisProject) => {
        onSelect(String(project.id));
        close();
    };

    return (
        <>
            <div className="mt-1 flex w-full items-stretch rounded-xl border border-slate-200 bg-white transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary dark:border-slate-800 dark:bg-dark-surface/50">
                <button
                    id="hris_project_id"
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-l-xl px-4 py-3 text-left focus:outline-none"
                >
                    <span className="min-w-0">
                        {selectedProject ? (
                            <>
                                <span className="block truncate font-semibold text-slate-700 dark:text-slate-200">
                                    {selectedProject.name}
                                </span>
                                {selectedProject.client && (
                                    <span className="block truncate text-xs text-slate-400 mt-0.5">
                                        {selectedProject.client.name}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-slate-400">Pilih project HRIS</span>
                        )}
                    </span>
                    <iconify-icon icon="solar:magnifer-linear" width="20" className="shrink-0 text-slate-400"></iconify-icon>
                </button>
                {selectedProject && (
                    <button
                        type="button"
                        onClick={() => onSelect('')}
                        className="flex items-center border-l border-slate-200 px-3 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:border-slate-800 dark:hover:bg-slate-800"
                        aria-label="Hapus project terpilih"
                    >
                        <iconify-icon icon="solar:close-circle-linear" width="18"></iconify-icon>
                    </button>
                )}
            </div>

            <Modal show={isOpen} onClose={close}>
                <div className="flex max-h-[80vh] flex-col">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 p-5 dark:border-slate-800">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pilih Project HRIS</h3>
                            <p className="mt-1 text-xs text-slate-400">
                                Cari berdasarkan nama project atau filter berdasarkan client.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                            aria-label="Tutup"
                        >
                            <iconify-icon icon="solar:close-circle-linear" width="22"></iconify-icon>
                        </button>
                    </div>

                    <div className="grid gap-3 border-b border-slate-200/70 p-5 sm:grid-cols-2 dark:border-slate-800">
                        <div className="relative">
                            <iconify-icon
                                icon="solar:magnifer-linear"
                                width="18"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            ></iconify-icon>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nama project..."
                                autoFocus
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-dark-surface/50 dark:text-slate-200"
                            />
                        </div>
                        <select
                            value={clientId}
                            onChange={(event) => setClientId(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-dark-surface/50 dark:text-slate-200"
                        >
                            <option value="">Semua client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-400">
                        <span>{filteredProjects.length} project ditemukan</span>
                        {(search || clientId) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setClientId('');
                                }}
                                className="font-semibold text-primary hover:text-primary-dark"
                            >
                                Reset filter
                            </button>
                        )}
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                        {filteredProjects.length > 0 ? (
                            <div className="space-y-1">
                                {filteredProjects.map((project) => {
                                    const isSelected = String(project.id) === selectedId;

                                    return (
                                        <button
                                            key={project.id}
                                            type="button"
                                            onClick={() => selectProject(project)}
                                            className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                                                isSelected
                                                    ? 'bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light'
                                                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70'
                                            }`}
                                        >
                                            <span className="flex items-center justify-between gap-3">
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold">{project.name}</span>
                                                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                                                        {project.client?.name || 'Client tidak tersedia'}
                                                    </span>
                                                </span>
                                                {isSelected && (
                                                    <iconify-icon icon="solar:check-circle-bold" width="20" className="shrink-0"></iconify-icon>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <iconify-icon icon="solar:magnifer-linear" width="32" className="text-slate-300 dark:text-slate-600"></iconify-icon>
                                <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Project tidak ditemukan
                                </p>
                                <p className="mt-1 text-xs text-slate-400">Coba kata kunci atau client lain.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
