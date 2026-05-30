type PaginationParams = {
    page: number;
    limit: number;
    skip: number;
};
export declare const applyForJob: (userId: string, jobId: string, message?: string) => Promise<{
    id: string;
    updatedAt: Date;
    message: string | null;
    status: import(".prisma/client").$Enums.ApplicationStatus;
    appliedAt: Date;
    userId: string;
    jobId: string;
}>;
export declare const getUserApplications: (userId: string, { page, limit, skip }: PaginationParams) => Promise<{
    applications: ({
        job: {
            id: string;
            location: string;
            companyName: string;
            isActive: boolean;
            title: string;
            jobType: import(".prisma/client").$Enums.JobType;
            salaryMin: number | null;
            salaryMax: number | null;
            currency: string;
            slug: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        message: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        appliedAt: Date;
        userId: string;
        jobId: string;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const getUserApplicationById: (applicationId: string, userId: string) => Promise<{
    job: {
        id: string;
        createdAt: Date;
        experienceLevel: import(".prisma/client").$Enums.ExperienceLevel;
        location: string;
        companyName: string;
        companyLogo: string | null;
        companyWebsite: string | null;
        title: string;
        description: string;
        category: string;
        jobType: import(".prisma/client").$Enums.JobType;
        workLocationType: import(".prisma/client").$Enums.WorkLocationType;
        salaryMin: number | null;
        salaryMax: number | null;
        currency: string;
        applicationDeadline: Date | null;
        slug: string;
    };
} & {
    id: string;
    updatedAt: Date;
    message: string | null;
    status: import(".prisma/client").$Enums.ApplicationStatus;
    appliedAt: Date;
    userId: string;
    jobId: string;
}>;
export declare const getApplicationHistory: (applicationId: string, userId: string) => Promise<{
    id: string;
    oldStatus: import(".prisma/client").$Enums.ApplicationStatus;
    newStatus: import(".prisma/client").$Enums.ApplicationStatus;
    changedBy: string | null;
    changedAt: Date;
    applicationId: string;
}[]>;
export declare const getJobApplications: (jobId: string, employerId: string, status?: string, { page, limit, skip }: PaginationParams) => Promise<{
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const updateApplicationStatus: (applicationId: string, newStatus: string, employerId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    updatedAt: Date;
    message: string | null;
    status: import(".prisma/client").$Enums.ApplicationStatus;
    appliedAt: Date;
    userId: string;
    jobId: string;
}>;
export declare const adminGetApplications: (filters: any, { page, limit, skip }: PaginationParams) => Promise<{
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const adminUpdateApplicationStatus: (applicationId: string, newStatus: string, adminId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    updatedAt: Date;
    message: string | null;
    status: import(".prisma/client").$Enums.ApplicationStatus;
    appliedAt: Date;
    userId: string;
    jobId: string;
}>;
export {};
//# sourceMappingURL=applicationService.d.ts.map