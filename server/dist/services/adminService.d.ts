type PaginationParams = {
    page: number;
    limit: number;
    skip: number;
};
export declare const getUsers: (filters: any, { page, limit, skip }: PaginationParams) => Promise<import("../lib/utils").PaginationResult<{
    id: string;
    createdAt: Date;
    email: string;
    phone: string | null;
    experienceLevel: import(".prisma/client").$Enums.ExperienceLevel | null;
    role: import(".prisma/client").$Enums.UserRole;
    firstName: string | null;
    lastName: string | null;
    location: string | null;
    companyName: string | null;
    companySlug: string | null;
    isActive: boolean;
    profileCompleted: boolean;
    _count: {
        applications: number;
    };
}>>;
export declare const getUserById: (userId: string) => Promise<{
    user: {
        resume: string | null;
        id: string;
        createdAt: Date;
        email: string;
        phone: string | null;
        experienceLevel: import(".prisma/client").$Enums.ExperienceLevel | null;
        role: import(".prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        firstName: string | null;
        lastName: string | null;
        profilePicture: string | null;
        bio: string | null;
        skills: string[];
        experience: string | null;
        education: string | null;
        location: string | null;
        website: string | null;
        linkedin: string | null;
        github: string | null;
        companyName: string | null;
        companySlug: string | null;
        companyDescription: string | null;
        companyLogo: string | null;
        companyWebsite: string | null;
        companySize: string | null;
        industry: string | null;
        isActive: boolean;
        profileCompleted: boolean;
        updatedAt: Date;
        _count: {
            applications: number;
        };
    };
    recentApplications: ({
        job: {
            id: string;
            companyName: string;
            status: import(".prisma/client").$Enums.JobStatus;
            title: string;
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
}>;
export declare const deleteUser: (userId: string, actorId: string, ip?: string, ua?: string) => Promise<void>;
export declare const suspendUser: (userId: string, actorId: string, ip?: string, ua?: string) => Promise<void>;
export declare const unsuspendUser: (userId: string, actorId: string, ip?: string, ua?: string) => Promise<void>;
export declare const getAuditLogs: ({ page, limit, skip }: PaginationParams) => Promise<import("../lib/utils").PaginationResult<{
    id: string;
    actorId: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}>>;
export declare const cleanupAuditLogs: (retentionDays?: number) => Promise<{
    deletedCount: number;
    retentionDays: number;
    cutoff: Date;
}>;
export {};
//# sourceMappingURL=adminService.d.ts.map