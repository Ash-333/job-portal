import { z } from 'zod';
export declare const adminJobFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "RESUBMITTED"]>, z.ZodArray<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "RESUBMITTED"]>, "many">]>>;
    isActive: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodBoolean]>, boolean, string | boolean>>;
    isApproved: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodBoolean]>, boolean, string | boolean>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    isActive?: boolean | undefined;
    status?: "PENDING" | "REJECTED" | "APPROVED" | "RESUBMITTED" | ("PENDING" | "REJECTED" | "APPROVED" | "RESUBMITTED")[] | undefined;
    category?: string | undefined;
    isApproved?: boolean | undefined;
}, {
    search?: string | undefined;
    isActive?: string | boolean | undefined;
    status?: "PENDING" | "REJECTED" | "APPROVED" | "RESUBMITTED" | ("PENDING" | "REJECTED" | "APPROVED" | "RESUBMITTED")[] | undefined;
    category?: string | undefined;
    page?: string | number | undefined;
    limit?: string | number | undefined;
    isApproved?: string | boolean | undefined;
}>;
export declare const adminUserFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["USER", "EMPLOYER"]>>;
    experienceLevel: z.ZodOptional<z.ZodEnum<["FRESHER", "ONE_TO_THREE_YEARS", "THREE_PLUS_YEARS"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    experienceLevel?: "FRESHER" | "ONE_TO_THREE_YEARS" | "THREE_PLUS_YEARS" | undefined;
    role?: "USER" | "EMPLOYER" | undefined;
}, {
    search?: string | undefined;
    experienceLevel?: "FRESHER" | "ONE_TO_THREE_YEARS" | "THREE_PLUS_YEARS" | undefined;
    role?: "USER" | "EMPLOYER" | undefined;
    page?: string | number | undefined;
    limit?: string | number | undefined;
}>;
export declare const adminApplicationFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    jobId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "REVIEWED", "SHORTLISTED", "ACCEPTED", "REJECTED", "HIRED"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "PENDING" | "REVIEWED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "HIRED" | undefined;
    jobId?: string | undefined;
}, {
    status?: "PENDING" | "REVIEWED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "HIRED" | undefined;
    page?: string | number | undefined;
    limit?: string | number | undefined;
    jobId?: string | undefined;
}>;
export declare const adminBlogFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    search: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodBoolean]>, boolean, string | boolean>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    isPublished?: boolean | undefined;
}, {
    search?: string | undefined;
    page?: string | number | undefined;
    limit?: string | number | undefined;
    isPublished?: string | boolean | undefined;
}>;
export declare const updateApplicationStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "REVIEWED", "SHORTLISTED", "ACCEPTED", "REJECTED", "HIRED"]>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "HIRED";
}, {
    status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "HIRED";
}>;
export declare const rejectJobSchema: z.ZodObject<{
    rejectionReason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rejectionReason: string;
}, {
    rejectionReason: string;
}>;
export type AdminJobFilters = z.infer<typeof adminJobFiltersSchema>;
export type AdminUserFilters = z.infer<typeof adminUserFiltersSchema>;
export type AdminApplicationFilters = z.infer<typeof adminApplicationFiltersSchema>;
export type AdminBlogFilters = z.infer<typeof adminBlogFiltersSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
//# sourceMappingURL=admin.d.ts.map