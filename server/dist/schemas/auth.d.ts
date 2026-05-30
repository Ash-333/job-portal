import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    experienceLevel: z.ZodOptional<z.ZodEnum<["STUDENT", "FRESHER", "INTERNSHIP_ONLY", "ZERO_TO_ONE_YEAR", "ONE_TO_THREE_YEARS", "THREE_TO_FIVE_YEARS", "FIVE_PLUS_YEARS", "THREE_PLUS_YEARS"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    phone?: string | undefined;
    experienceLevel?: "STUDENT" | "FRESHER" | "INTERNSHIP_ONLY" | "ZERO_TO_ONE_YEAR" | "ONE_TO_THREE_YEARS" | "THREE_TO_FIVE_YEARS" | "FIVE_PLUS_YEARS" | "THREE_PLUS_YEARS" | undefined;
}, {
    email: string;
    password: string;
    fullName: string;
    phone?: string | undefined;
    experienceLevel?: "STUDENT" | "FRESHER" | "INTERNSHIP_ONLY" | "ZERO_TO_ONE_YEAR" | "ONE_TO_THREE_YEARS" | "THREE_TO_FIVE_YEARS" | "FIVE_PLUS_YEARS" | "THREE_PLUS_YEARS" | undefined;
}>;
export declare const registerEmployerSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    companyName: z.ZodString;
    companyDescription: z.ZodOptional<z.ZodString>;
    companyWebsite: z.ZodOptional<z.ZodString>;
    companySize: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    companyName: string;
    fullName: string;
    phone?: string | undefined;
    companyDescription?: string | undefined;
    companyWebsite?: string | undefined;
    companySize?: string | undefined;
    industry?: string | undefined;
}, {
    email: string;
    password: string;
    companyName: string;
    fullName: string;
    phone?: string | undefined;
    companyDescription?: string | undefined;
    companyWebsite?: string | undefined;
    companySize?: string | undefined;
    industry?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const sendVerificationSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const verifyEmailSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=auth.d.ts.map