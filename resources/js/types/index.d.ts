import { Config } from 'ziggy-js';

export interface Candidate {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    birth_date?: string;
    gender?: 'male' | 'female';
    ktp_number?: string;
    mother_name?: string;
    address?: string;
    education_level?: string;
    cv_path?: string;
    profile_photo_path?: string;
    profile_completed_at?: string;
    is_profile_complete: boolean;
    created_at: string;
    updated_at: string;
}

export interface HrUser {
    id: string;
    name: string;
    email: string;
    role: 'hr' | 'admin';
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}

export interface JobListing {
    id: string;
    title: string;
    slug: string;
    description: string;
    requirements: string;
    location: string;
    contract_type: 'pkwt' | 'pkwtt' | 'freelance';
    salary_range_min?: number;
    salary_range_max?: number;
    salary_visible: boolean;
    hris_project_id?: string;
    status: 'draft' | 'published' | 'closed';
    quota?: number;
    deadline_at?: string;
    created_by: string;
    creator?: HrUser;
    categories?: JobCategory[];
    applications_count?: number;
    created_at: string;
    updated_at: string;
}

export interface JobCategory {
    id: number;
    name: string;
    slug: string;
}

export type StageName = 'apply' | 'screening' | 'interview_hr' | 'interview_client' | 'offering' | 'onboarding';
export type StageStatus = 'in_progress' | 'passed' | 'failed' | 'no_show' | 'rescheduled' | 'withdrawn';

export interface Application {
    id: string;
    candidate_id: string;
    job_listing_id: string;
    current_stage: StageName;
    current_status: StageStatus;
    applied_at: string;
    candidate?: Candidate;
    job_listing?: JobListing;
    stages?: ApplicationStage[];
    created_at: string;
    updated_at: string;
}

export interface ApplicationStage {
    id: string;
    application_id: string;
    stage_name: StageName;
    status: StageStatus;
    rejection_reason?: string;
    notes?: string;
    actioned_by?: string;
    actioned_at?: string;
    actioned_by_user?: HrUser;
    created_at: string;
    updated_at: string;
}

export interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        candidate: Candidate | null;
        hr: HrUser | null;
    };
    ziggy: Config & { location: string };
    flash: FlashMessages;
};
