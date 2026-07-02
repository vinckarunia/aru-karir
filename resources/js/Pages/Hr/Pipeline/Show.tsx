import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import HrLayout from '@/Layouts/HrLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Application, PageProps } from '@/types';
import Modal from '@/Components/Modal';

interface Props {
    application: Application;
}

const stageLabels: Record<string, string> = {
    apply: 'Pendaftaran',
    screening: 'Screening',
    interview_hr: 'Interview HR',
    interview_client: 'Interview Klien',
    offering: 'Offering',
    onboarding: 'Onboarding',
};

const stagesList = ['apply', 'screening', 'interview_hr', 'interview_client', 'offering', 'onboarding'];

export default function PipelineShow({ application }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionNotes, setActionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Notes state for note appending form
    const [newNote, setNewNote] = useState('');
    
    // Status update state
    const [selectedStatus, setSelectedStatus] = useState(application.current_status);
    const [statusNotes, setStatusNotes] = useState('');

    const candidate = application.candidate!;
    const job = application.job_listing!;
    
    const currentIndex = stagesList.indexOf(application.current_stage);
    const hasNextStage = currentIndex < stagesList.length - 1;
    const nextStageName = hasNextStage ? stagesList[currentIndex + 1] : null;

    const isAppActive = ['in_progress', 'rescheduled', 'no_show'].includes(application.current_status);

    const handleAdvance = () => {
        if (!confirm(`Apakah Anda yakin ingin meloloskan ${candidate.name} ke tahapan berikutnya (${stageLabels[nextStageName!] || nextStageName})?`)) {
            return;
        }

        setIsSubmitting(true);
        router.post(route('hr.pipeline.advance', application.id), {
            notes: actionNotes || 'Diloloskan ke tahapan berikutnya.',
        }, {
            onSuccess: () => {
                setActionNotes('');
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectionReason.trim()) return;

        setIsSubmitting(true);
        router.post(route('hr.pipeline.reject', application.id), {
            rejection_reason: rejectionReason,
            notes: actionNotes,
        }, {
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setRejectionReason('');
                setActionNotes('');
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(route('hr.pipeline.status', application.id), {
            status: selectedStatus,
            notes: statusNotes,
        }, {
            onSuccess: () => {
                setStatusNotes('');
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsSubmitting(true);
        router.post(route('hr.pipeline.note', application.id), {
            notes: newNote,
        }, {
            onSuccess: () => {
                setNewNote('');
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    // Helper to get initials
    const getInitials = (name: string): string => {
        const names = name.split(' ');
        if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    // Dynamic field values
    const fieldValues = candidate.field_values || (candidate as any).fieldValues || [];

    return (
        <HrLayout title={`Profil Kandidat — ${candidate.name}`} header="Detail Pelamar">
            <Head title={`Profil Kandidat — ${candidate.name}`} />

            {/* Back link */}
            <div className="mb-6">
                <Link
                    href={route('hr.pipeline', job.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary dark:hover:text-primary-light transition-colors"
                >
                    <iconify-icon icon="solar:arrow-left-linear" width="16"></iconify-icon>
                    Kembali ke Pipeline
                </Link>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Candidate Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Summary Profile */}
                    <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white flex items-center justify-center text-2xl font-extrabold shadow-md border-2 border-white dark:border-slate-800 shrink-0">
                            {getInitials(candidate.name || 'Kandidat')}
                        </div>
                        <div className="text-center sm:text-left flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate">{candidate.name}</h2>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 truncate">{candidate.email}</p>
                            
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                                <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Lamaran posisi: <strong className="text-slate-700 dark:text-slate-300">{job.title}</strong>
                                </span>
                                <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light uppercase">
                                    Tahap: {stageLabels[application.current_stage] || application.current_stage}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Standard Biodata Details */}
                    <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                            <iconify-icon icon="solar:user-id-bold-duotone" width="20" className="text-primary"></iconify-icon>
                            Informasi Biodata Standar
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { label: 'Nomor HP', value: candidate.phone || '-' },
                                { label: 'NIK KTP', value: candidate.ktp_number || '-' },
                                { label: 'Nama Ibu Kandung', value: candidate.mother_name || '-' },
                                { label: 'Jenis Kelamin', value: candidate.gender === 'male' ? 'Laki-laki' : candidate.gender === 'female' ? 'Perempuan' : '-' },
                                { label: 'Tanggal Lahir', value: candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
                                { label: 'Pendidikan Terakhir', value: candidate.education_level || '-' },
                            ].map((item) => (
                                <div key={item.label}>
                                    <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1 block">{item.value}</span>
                                </div>
                            ))}
                            
                            <div className="sm:col-span-2">
                                <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alamat Lengkap</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1 block leading-relaxed">{candidate.address || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Uploaded CV Card */}
                    <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                            <iconify-icon icon="solar:document-bold-duotone" width="20" className="text-primary"></iconify-icon>
                            Curriculum Vitae (CV)
                        </h3>

                        {candidate.cv_path ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-dark-surface/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                                        <iconify-icon icon="solar:document-text-bold-duotone" width="26"></iconify-icon>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">Dokumen CV Pelamar</p>
                                        <p className="text-xs text-slate-400">Tersedia untuk diunduh</p>
                                    </div>
                                </div>
                                <a
                                    href={candidate.cv_path.startsWith('/') ? candidate.cv_path : `/${candidate.cv_path}`}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-dark shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                    <iconify-icon icon="solar:download-linear" width="16"></iconify-icon>
                                    Unduh CV
                                </a>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 dark:text-slate-500 italic text-sm">
                                CV belum diunggah oleh kandidat.
                            </div>
                        )}
                    </div>

                    {/* Custom Configured Profile Fields */}
                    <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                            <iconify-icon icon="solar:folder-with-files-bold-duotone" width="20" className="text-primary"></iconify-icon>
                            Informasi Tambahan (Custom Fields)
                        </h3>

                        {fieldValues.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {fieldValues.map((fv: any) => {
                                    const field = fv.profile_field || fv.profileField;
                                    if (!field) return null;
                                    
                                    const isFile = field.field_type === 'file';
                                    
                                    return (
                                        <div key={fv.id} className={field.field_type === 'textarea' ? 'sm:col-span-2' : ''}>
                                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{field.field_label}</span>
                                            {isFile ? (
                                                fv.file_path ? (
                                                    <a
                                                        href={fv.file_path.startsWith('/') ? fv.file_path : `/${fv.file_path}`}
                                                        download
                                                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 text-primary dark:text-primary-light hover:bg-primary/5 text-xs font-bold transition-all"
                                                    >
                                                        <iconify-icon icon="solar:download-linear" width="14"></iconify-icon>
                                                        Unduh Dokumen
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-slate-400 italic mt-1 block">File belum diunggah</span>
                                                )
                                            ) : (
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1 block whitespace-pre-wrap leading-relaxed">
                                                    {fv.value || '-'}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 dark:text-slate-500 italic text-sm">
                                Tidak ada field tambahan yang terisi.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions & Timeline */}
                <div className="space-y-6">
                    {/* Recruitment Action Panel */}
                    <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                            <iconify-icon icon="solar:tuning-bold-duotone" width="20" className="text-primary"></iconify-icon>
                            Tindakan HR
                        </h3>

                        {isAppActive ? (
                            <div className="space-y-6">
                                <div className="p-3 bg-slate-50 dark:bg-dark-surface/30 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs font-medium text-slate-500">
                                    Lakukan tindakan untuk memajukan kandidat secara sekuensial atau mengelola detail pendaftaran.
                                </div>

                                {/* Main advance and reject CTA */}
                                <div className="space-y-3">
                                    {hasNextStage ? (
                                        <button
                                            type="button"
                                            onClick={handleAdvance}
                                            disabled={isSubmitting}
                                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                                        >
                                            <iconify-icon icon="solar:user-check-bold" width="18"></iconify-icon>
                                            Loloskan ke Tahap {stageLabels[nextStageName!] || nextStageName}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleAdvance}
                                            disabled={isSubmitting}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                                        >
                                            <iconify-icon icon="solar:cup-bold" width="18"></iconify-icon>
                                            Selesaikan Rekrutmen (Passed)
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setIsRejectModalOpen(true)}
                                        disabled={isSubmitting}
                                        className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                                    >
                                        <iconify-icon icon="solar:user-block-bold" width="16"></iconify-icon>
                                        Tolak Lamaran
                                    </button>
                                </div>

                                {/* Update Stage Status */}
                                <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Ubah Status Tahap Ini</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value as any)}
                                        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="in_progress">Dalam Proses</option>
                                        <option value="no_show">Tidak Hadir (No-Show)</option>
                                        <option value="rescheduled">Dijadwalkan Ulang</option>
                                        <option value="withdrawn">Mengundurkan Diri</option>
                                    </select>
                                    
                                    <textarea
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        placeholder="Catatan status tahapan..."
                                        className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all h-14 resize-none"
                                    />

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Simpan Status
                                    </button>
                                </form>

                                {/* Quick Note Appender */}
                                <form onSubmit={handleAddNote} className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tambah Catatan Internal</label>
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        required
                                        placeholder="Tulis catatan internal untuk tahapan rekrutmen ini..."
                                        className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all h-20 resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !newNote.trim()}
                                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Tambah Catatan
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto mb-3">
                                    <iconify-icon icon="solar:lock-bold-duotone" width="24" className="text-slate-400"></iconify-icon>
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Tahapan Terkunci</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                    Lamaran telah diselesaikan atau ditolak. Status akhir: 
                                </p>
                                <div className="mt-3">
                                    <StatusBadge status={application.current_status} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline Audit Trail */}
                    <div className="glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-card">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                            <iconify-icon icon="solar:history-bold-duotone" width="20" className="text-primary"></iconify-icon>
                            Riwayat Tahapan (Timeline)
                        </h3>

                        <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-8">
                            {application.stages?.map((stageRecord) => (
                                <div key={stageRecord.id} className="relative">
                                    {/* Timeline dot */}
                                    <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-900 bg-primary/80 shadow-sm flex items-center justify-center"></span>
                                    
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                                {stageLabels[stageRecord.stage_name] || stageRecord.stage_name}
                                            </h4>
                                            <StatusBadge status={stageRecord.status} />
                                        </div>
                                        
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                            {stageRecord.actioned_at ? new Date(stageRecord.actioned_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : '-'}
                                            {stageRecord.actioned_by && (
                                                <span> Oleh: <strong className="text-slate-500 dark:text-slate-400">
                                                    {typeof stageRecord.actioned_by === 'object' 
                                                        ? (stageRecord.actioned_by as any).name 
                                                        : ((stageRecord as any).actioned_by_user?.name || stageRecord.actioned_by)}
                                                </strong></span>
                                            )}
                                        </p>

                                        {stageRecord.rejection_reason && (
                                            <div className="mt-2 p-2.5 rounded-lg border border-red-100 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                                                <strong>Alasan Penolakan:</strong> {stageRecord.rejection_reason}
                                            </div>
                                        )}

                                        {stageRecord.notes && (
                                            <div className="mt-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:bg-dark-surface/20 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed italic">
                                                {stageRecord.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            <Modal show={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)}>
                <form onSubmit={handleRejectSubmit} className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Tolak Lamaran Kandidat</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Anda akan menolak lamaran <strong>{candidate.name}</strong> pada tahapan <strong>{stageLabels[application.current_stage]}</strong>.
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
                            placeholder="Catatan tambahan..."
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
                            className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer"
                        >
                            Tolak Kandidat
                        </button>
                    </div>
                </form>
            </Modal>
        </HrLayout>
    );
}
