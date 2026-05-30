import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    experienceLevel: z.ZodOptional<z.ZodEnum<["STUDENT", "FRESHER", "INTERNSHIP_ONLY", "ZERO_TO_ONE_YEAR", "ONE_TO_THREE_YEARS", "THREE_TO_FIVE_YEARS", "FIVE_PLUS_YEARS", "THREE_PLUS_YEARS"]>>;
    bio: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    experience: z.ZodOptional<z.ZodString>;
    education: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    website: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    linkedin: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    github: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    experienceLevel?: "STUDENT" | "FRESHER" | "INTERNSHIP_ONLY" | "ZERO_TO_ONE_YEAR" | "ONE_TO_THREE_YEARS" | "THREE_TO_FIVE_YEARS" | "FIVE_PLUS_YEARS" | "THREE_PLUS_YEARS" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    bio?: string | undefined;
    skills?: string[] | undefined;
    experience?: string | undefined;
    education?: string | undefined;
    location?: string | undefined;
    website?: string | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
}, {
    phone?: string | undefined;
    experienceLevel?: "STUDENT" | "FRESHER" | "INTERNSHIP_ONLY" | "ZERO_TO_ONE_YEAR" | "ONE_TO_THREE_YEARS" | "THREE_TO_FIVE_YEARS" | "FIVE_PLUS_YEARS" | "THREE_PLUS_YEARS" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    bio?: string | undefined;
    skills?: string[] | undefined;
    experience?: string | undefined;
    education?: string | undefined;
    location?: string | undefined;
    website?: string | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
//# sourceMappingURL=user.d.ts.map