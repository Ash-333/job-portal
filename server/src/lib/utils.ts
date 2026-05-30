import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Slug generation
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Generate unique slug with nanoid suffix
export const generateUniqueSlug = (text: string): string => {
  const baseSlug = generateSlug(text);
  return `${baseSlug}-${nanoid(8)}`;
};

// Generate a company slug from name (unique per employer)
export const generateCompanySlug = (companyName: string): string => {
  const base = generateSlug(companyName) || 'company';
  return `${base}-${nanoid(8)}`;
};

// Pagination helper
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

export const getPaginationParams = (options: PaginationOptions) => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginationResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// File signatures (magic bytes) keyed by MIME type
// Hex strings to match at the start of the file buffer
const FILE_SIGNATURES: Record<string, string[]> = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e470d0a1a0a'],
  'image/webp': ['52494646'], // RIFF prefix; WEBP at offset 8 checked separately
  'image/gif': ['474946383761', '474946383961'], // GIF87a, GIF89a
  'application/pdf': ['25504446'], // %PDF
  'application/msword': [], // OLE compound document — no fixed signature
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504b0304'], // ZIP-based
};

export const validateFileType = (mimetype: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimetype);
};

/**
 * Validate file content by checking magic bytes (signature-based).
 * Catches spoofed MIME types where an attacker renames a malicious file.
 * Returns true if the file passes magic byte checks for the given MIME type.
 * Types without registered signatures (SVG, DOC, etc.) pass by default.
 */
export const validateFileMagicBytes = (buffer: Buffer, mimetype: string): boolean => {
  const signatures = FILE_SIGNATURES[mimetype];
  if (!signatures || signatures.length === 0) return true; // No signature to check

  const hex = buffer.subarray(0, 16).toString('hex').toLowerCase();

  // Special handling for WebP — check WEBP chunk at offset 8
  if (mimetype === 'image/webp') {
    if (!hex.startsWith('52494646')) return false;
    const webpHeader = buffer.subarray(8, 12).toString('ascii');
    return webpHeader === 'WEBP';
  }

  return signatures.some(sig => hex.startsWith(sig));
};

export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

// Generate random string
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
