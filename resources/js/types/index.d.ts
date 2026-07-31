import { Config } from 'ziggy-js';

export interface Candidate {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    ktp_number?: string;
    mother_name?: string;
    address?: string;
    education_level?: string;
    cv_path?: string;
    profile_photo_path?: string;
    profile_completed_at?: string;
    is_profile_complete: boolean;
    field_values?: any[];
    fieldValues?: any[];
    created_at: string;
    updated_at: string;

    // New biodata fields
    birth_place?: string;
    religion?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
    address_domicile?: string;
    phone_domicile?: string;
    housing_status?: string;
    npwp?: string;
    bank_name?: string;
    bank_account_number?: string;
    father_name?: string;
    father_birth_place_date?: string;
    father_job?: string;
    mother_birth_place_date?: string;
    mother_job?: string;
    sibling_order?: number;
    sibling_count?: number;
    marital_status?: string;
    spouse_name?: string;
    spouse_birth_place_date?: string;
    child_1_name?: string;
    child_1_birth_place_date?: string;
    child_2_name?: string;
    child_2_birth_place_date?: string;
    child_3_name?: string;
    child_3_birth_place_date?: string;
    school_name_city?: string;
    school_major?: string;
    school_graduation_year?: number;
    work_experience?: any[];
    reference_name?: string;
    reference_relationship?: string;
    reference_phone?: string;
    emergency_name?: string;
    emergency_relationship?: string;
    emergency_phone?: string;
    emergency_address?: string;
    size_shoe?: number;
    size_uniform?: string;
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
    contract_type: string;
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
    required_fields?: string[];
    created_at: string;
    updated_at: string;
}

export interface BusinessOption {
    id: number;
    group: string;
    code: string;
    label: string;
    sort_order: number;
    is_active: boolean;
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
    viewed_at?: string | null;
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
    businessOptions: Record<string, BusinessOption[]>;
};
