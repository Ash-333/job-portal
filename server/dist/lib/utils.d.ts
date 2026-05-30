export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateSlug: (text: string) => string;
export declare const generateUniqueSlug: (text: string) => string;
export declare const generateCompanySlug: (companyName: string) => string;
export interface PaginationOptions {
    page?: number;
    limit?: number;
}
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare const getPaginationParams: (options: PaginationOptions) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const createPaginationResult: <T>(data: T[], total: number, page: number, limit: number) => PaginationResult<T>;
export declare const validateFileType: (mimetype: string, allowedTypes: string[]) => boolean;
export declare const validateFileMagicBytes: (buffer: Buffer, mimetype: string) => boolean;
export declare const validateFileSize: (size: number, maxSize: number) => boolean;
export declare const generateRandomString: (length: number) => string;
//# sourceMappingURL=utils.d.ts.map