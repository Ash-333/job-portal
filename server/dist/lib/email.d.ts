export declare const verifyEmailConfig: () => Promise<boolean>;
export declare const generateToken: () => string;
export declare const sendVerificationEmail: (email: string, token: string) => Promise<boolean>;
export declare const sendPasswordResetEmail: (email: string, token: string) => Promise<boolean>;
export declare const sendApplicationStatusEmail: (email: string, candidateName: string, jobTitle: string, companyName: string, status: string) => Promise<boolean>;
export declare function testEmailConfig(): Promise<boolean>;
//# sourceMappingURL=email.d.ts.map