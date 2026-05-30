type PaginationParams = {
    page: number;
    limit: number;
    skip: number;
};
export declare const getPlans: (onlyActive?: boolean) => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    isActive: boolean;
    updatedAt: Date;
    description: string | null;
    slug: string;
    price: number;
    duration: import(".prisma/client").$Enums.SubscriptionPlanDuration;
    features: import("@prisma/client/runtime/library").JsonValue;
    jobLimit: number | null;
    featuredJobLimit: number | null;
    sortOrder: number;
}[]>;
export declare const getPlanBySlug: (slug: string) => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    isActive: boolean;
    updatedAt: Date;
    description: string | null;
    slug: string;
    price: number;
    duration: import(".prisma/client").$Enums.SubscriptionPlanDuration;
    features: import("@prisma/client/runtime/library").JsonValue;
    jobLimit: number | null;
    featuredJobLimit: number | null;
    sortOrder: number;
}>;
export declare const getPlanById: (id: string) => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    isActive: boolean;
    updatedAt: Date;
    description: string | null;
    slug: string;
    price: number;
    duration: import(".prisma/client").$Enums.SubscriptionPlanDuration;
    features: import("@prisma/client/runtime/library").JsonValue;
    jobLimit: number | null;
    featuredJobLimit: number | null;
    sortOrder: number;
}>;
export declare const createPlan: (data: any, actorId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    isActive: boolean;
    updatedAt: Date;
    description: string | null;
    slug: string;
    price: number;
    duration: import(".prisma/client").$Enums.SubscriptionPlanDuration;
    features: import("@prisma/client/runtime/library").JsonValue;
    jobLimit: number | null;
    featuredJobLimit: number | null;
    sortOrder: number;
}>;
export declare const updatePlan: (id: string, data: any, actorId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    isActive: boolean;
    updatedAt: Date;
    description: string | null;
    slug: string;
    price: number;
    duration: import(".prisma/client").$Enums.SubscriptionPlanDuration;
    features: import("@prisma/client/runtime/library").JsonValue;
    jobLimit: number | null;
    featuredJobLimit: number | null;
    sortOrder: number;
}>;
export declare const deletePlan: (id: string, actorId: string, ip?: string, ua?: string) => Promise<void>;
export declare const subscribe: (employerId: string, planId: string) => Promise<{
    id: string;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.SubscriptionStatus;
    planId: string;
    employerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt: Date | null;
    autoRenew: boolean;
    cancelledAt: Date | null;
}>;
export declare const activateSubscription: (id: string, actorId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.SubscriptionStatus;
    planId: string;
    employerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt: Date | null;
    autoRenew: boolean;
    cancelledAt: Date | null;
}>;
export declare const cancelSubscription: (id: string, actorId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.SubscriptionStatus;
    planId: string;
    employerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt: Date | null;
    autoRenew: boolean;
    cancelledAt: Date | null;
}>;
export declare const getEmployerSubscription: (employerId: string) => Promise<{
    usage: {
        jobLimit: number | null;
        jobsUsed: number;
        jobsRemaining: number | null;
        featuredJobLimit: number | null;
        featuredUsed: number;
        featuredRemaining: number | null;
        features: string[];
    };
    plan: {
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        slug: string;
        price: number;
        duration: import(".prisma/client").$Enums.SubscriptionPlanDuration;
        features: import("@prisma/client/runtime/library").JsonValue;
        jobLimit: number | null;
        featuredJobLimit: number | null;
        sortOrder: number;
    };
    id: string;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.SubscriptionStatus;
    planId: string;
    employerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt: Date | null;
    autoRenew: boolean;
    cancelledAt: Date | null;
} | null>;
export declare const checkEmployerFeature: (employerId: string, featureKey: string) => Promise<boolean>;
export declare const enforceJobLimit: (employerId: string) => Promise<void>;
export declare const enforceFeaturedJobLimit: (employerId: string) => Promise<void>;
export declare const adminListSubscriptions: ({ page, limit, skip }: PaginationParams) => Promise<import("../lib/utils").PaginationResult<{
    employer: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        companyName: string | null;
    };
    plan: {
        id: string;
        name: string;
        slug: string;
    };
} & {
    id: string;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.SubscriptionStatus;
    planId: string;
    employerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt: Date | null;
    autoRenew: boolean;
    cancelledAt: Date | null;
}>>;
export declare const getSponsoredCompanies: () => Promise<({
    employer: {
        location: string | null;
        companyName: string | null;
        companySlug: string | null;
        companyDescription: string | null;
        companyLogo: string | null;
        industry: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    isActive: boolean;
    sortOrder: number;
    employerId: string;
    startDate: Date;
    endDate: Date;
})[]>;
export declare const createSponsoredCompany: (data: any, actorId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    createdAt: Date;
    isActive: boolean;
    sortOrder: number;
    employerId: string;
    startDate: Date;
    endDate: Date;
}>;
export declare const updateSponsoredCompany: (id: string, data: any, actorId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    createdAt: Date;
    isActive: boolean;
    sortOrder: number;
    employerId: string;
    startDate: Date;
    endDate: Date;
}>;
export declare const deleteSponsoredCompany: (id: string, actorId: string, ip?: string, ua?: string) => Promise<void>;
export declare const adminListSponsoredCompanies: ({ page, limit, skip }: PaginationParams) => Promise<import("../lib/utils").PaginationResult<{
    employer: {
        id: string;
        email: string;
        companyName: string | null;
        companySlug: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    isActive: boolean;
    sortOrder: number;
    employerId: string;
    startDate: Date;
    endDate: Date;
}>>;
export {};
//# sourceMappingURL=subscriptionService.d.ts.map