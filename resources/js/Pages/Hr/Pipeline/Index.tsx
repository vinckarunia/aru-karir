import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Application, JobListing } from '@/types';
import Modal from '@/Components/Modal';

interface Props {
    job: JobListing;
    applications: Application[];
}

const STAGES = [
    { key: 'apply', label: 'Pendaftaran', icon: 'solar:user-plus-bold-duotone', color: 'text-blue-500' },
    { key: 'screening', label: 'Screening', icon: 'solar:clipboard-check-bold-duotone', color: 'text-indigo-500' },
    { key: 'interview_hr', label: 'Interview HR', icon: 'solar:users-group-two-rounded-bold-duotone', color: 'text-purple-500' },
    { key: 'interview_client', label: 'Interview Klien', icon: 'solar:handshake-bold-duotone', color: 'text-amber-500' },
    { key: 'offering', label: 'Offering', icon: 'solar:document-bold-duotone', color: 'text-pink-500' },
    { key: 'onboarding', label: 'Onboarding', icon: 'solar:user-speak-bold-duotone', color: 'text-emerald-500' },
] as const;

export default function PipelineIndex({ job, applications }: Props) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionNotes, setActionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Group applications by stage
    const groupedApplications = useMemo(() => {
        const groups: Record<string, Application[]> = {
            apply: [],
            screening: [],
            interview_hr: [],
            interview_client: [],
            offering: [],
            onboarding: [],
        };
        
        applications.forEach((app) => {
            if (groups[app.current_stage]) {
                groups[app.current_stage].push(app);
            }
        });
        
        return groups;
    }, [applications]);

    // Active apps are those in_progress, rescheduled, or no_show
    const isActive = (app: Application) => {
        return ['in_progress', 'rescheduled', 'no_show'].includes(app.current_status);
    };

    const handleSelectAllInStage = (stageKey: string, checked: boolean) => {
        const stageApps = groupedApplications[stageKey] || [];
        const activeStageIds = stageApps.filter(isActive).map(app => app.id);
        
        if (checked) {
            setSelectedIds(prev => Array.from(new Set([...prev, ...activeStageIds])));
        } else {
            setSelectedIds(prev => prev.filter(id => !activeStageIds.includes(id)));
        }
    };

    const handleSelectOne = (appId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, appId]);
        } else {
            setSelectedIds(prev => prev.filter(id => id !== appId));
        }
    };

    const handleBulkAdvance = () => {
        if (selectedIds.length === 0) return;
        
        if (confirm(`Apakah Anda yakin ingin meloloskan ${selectedIds.length} kandidat terpilih ke tahapan berikutnya?`)) {
            setIsSubmitting(true);
            router.post(route('hr.pipeline.bulk'), {
                application_ids: selectedIds,
                action_type: 'advance',
                notes: 'Diloloskan secara massal.',
            }, {
                onSuccess: () => {
                    setSelectedIds([]);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const handleBulkRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0 || !rejectionReason.trim()) return;

        setIsSubmitting(true);
        router.post(route('hr.pipeline.bulk'), {
            application_ids: selectedIds,
            action_type: 'reject',
            rejection_reason: rejectionReason,
            notes: actionNotes,
        }, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsRejectModalOpen(false);
                setRejectionReason('');
                setActionNotes('');
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    return (
        <HrLayout title={`Pipeline — ${job.title}`} header={`Pipeline Rekrutmen`}>
            <Head title={`Pipeline — ${job.title}`} />

            {/* Job Header Card */}
            <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link 
                                href={route('hr.lowongan.index')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary dark:hover:text-primary-light transition-colors"
                            >
                                <iconify-icon icon="solar:arrow-left-linear" width="14"></iconify-icon>
                                Kembali ke Daftar
                            </Link>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{job.title}</h2>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <iconify-icon icon="solar:map-point-linear" width="14"></iconify-icon>
                                {job.location}
                            </span>
                            <span>•</span>
                            <span className="uppercase font-semibold">{job.contract_type}</span>
                            {job.quota && (
                                <>
                                    <span>•</span>
                                    <span>Kuota: {job.quota} Orang</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {job.categories?.map((cat) => (
                            <span key={cat.id} className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light">
                                {cat.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pipeline Columns Board */}
            <div className="overflow-x-auto pb-6 -mx-6 px-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                <div className="flex gap-6 min-w-[1200px] h-[calc(100vh-320px)] min-h-[500px]">
                    {STAGES.map((stage) => {
                        const stageApps = groupedApplications[stage.key] || [];
                        const activeApps = stageApps.filter(isActive);
                        const allChecked = activeApps.length > 0 && activeApps.every(app => selectedIds.includes(app.id));
                        const someChecked = activeApps.length > 0 && activeApps.some(app => selectedIds.includes(app.id)) && !allChecked;

                        return (
                            <div key={stage.key} className="flex flex-col w-[320px] bg-slate-50/60 dark:bg-dark-surface/20 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 h-full">
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <iconify-icon icon={stage.icon} width="20" className={stage.color}></iconify-icon>
                                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">{stage.label}</h3>
                                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                            {stageApps.length}
                                        </span>
                                    </div>

                                    {activeApps.length > 0 && (
                                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={allChecked}
                                                ref={el => {
                                                    if (el) el.indeterminate = someChecked;
                                                }}
                                                onChange={(e) => handleSelectAllInStage(stage.key, e.target.checked)}
                                                className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary h-3.5 w-3.5"
                                            />
                                            Pilih Semua
                                        </label>
                                    )}
                                </div>

                                {/* Column Cards */}
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {stageApps.length > 0 ? (
                                        stageApps.map((app) => {
                                            const isAppActive = isActive(app);
                                            const isChecked = selectedIds.includes(app.id);

                                            return (
                                                <div 
                                                    key={app.id} 
                                                    className={`group relative rounded-xl p-4 bg-white dark:bg-dark-surface/60 border transition-all duration-200 shadow-sm
                                                        ${isChecked ? 'border-primary dark:border-primary-light shadow-glow' : 'border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'}
                                                        ${!isAppActive ? 'opacity-60 bg-slate-50/50 dark:bg-dark-surface/30' : ''}
                                                    `}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {isAppActive && (
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => handleSelectOne(app.id, e.target.checked)}
                                                                className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary mt-1 cursor-pointer h-4 w-4 shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                                                                {app.candidate?.name || 'Kandidat Baru'}
                                                            </h4>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{app.candidate?.email}</p>
                                                            
                                                            <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                                                                <StatusBadge status={app.current_status} />
                                                                <span className="text-[10px] text-slate-400">
                                                                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short'
                                                                    }) : '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Hover Overlay Detail Link */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-white/95 to-white/80 dark:from-dark-surface/95 dark:to-dark-surface/85 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800">
                                                        <Link
                                                            href={route('hr.pipeline.show', app.id)}
                                                            className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark shadow-sm transition-all"
                                                        >
                                                            Lihat Profil
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-32 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                                            <iconify-icon icon="solar:user-linear" width="20" className="text-slate-300 mb-2"></iconify-icon>
                                            <p className="text-[11px] text-slate-400 font-medium">Kosong</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-dark-surface/95 backdrop-blur border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-glow flex items-center gap-6 max-w-lg w-full justify-between animate-fade-in">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <span className="text-primary dark:text-primary-light font-bold">{selectedIds.length}</span> Kandidat Terpilih
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsRejectModalOpen(true)}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-bold border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                            Tolak Massal
                        </button>
                        <button
                            type="button"
                            onClick={handleBulkAdvance}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                            Loloskan Massal
                        </button>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            <Modal show={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)}>
                <form onSubmit={handleBulkRejectSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Tolak Kandidat Terpilih</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Anda akan menolak <strong>{selectedIds.length} kandidat</strong> pada tahapan mereka saat ini. Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Alasan Penolakan</label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                            placeholder="Tulis alasan penolakan di sini..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-24 resize-none"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Catatan Tambahan (Opsional)</label>
                        <textarea
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            placeholder="Catatan tambahan untuk rekam medis tahapan..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-20 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsRejectModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !rejectionReason.trim()}
                            className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                            Tolak Kandidat
                        </button>
                    </div>
                </form>
            </Modal>
        </HrLayout>
    );
}
