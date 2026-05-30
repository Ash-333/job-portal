import { db } from '../lib/db';
import { hashPassword, comparePassword, generateUniqueSlug } from '../lib/utils';
import { generateToken } from '../lib/jwt';
import { createError } from '../middleware/errorHandler';
import { generateToken as generateEmailToken, sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';
import type { RegisterInput, LoginInput } from '../schemas/auth';

export const register = async (data: RegisterInput) => {
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw createError('Email already registered', 409);
  }

  const nameParts = data.fullName.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  const hashedPassword = await hashPassword(data.password);
  const emailVerificationToken = generateEmailToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: data.phone || null,
      experienceLevel: data.experienceLevel as any || null,
      emailVerificationToken,
      emailVerificationExpires,
    },
  });

  sendVerificationEmail(user.email, emailVerificationToken).catch(() => {});

  return { requiresVerification: true };
};

export const registerEmployer = async (data: any) => {
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw createError('Email already registered', 409);
  }

  const nameParts = data.fullName.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  const hashedPassword = await hashPassword(data.password);
  const emailVerificationToken = generateEmailToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: data.phone || null,
      role: 'EMPLOYER',
      companyName: data.companyName,
      companySlug: generateUniqueSlug(data.companyName),
      companyDescription: data.companyDescription || null,
      companyWebsite: data.companyWebsite || null,
      companySize: data.companySize || null,
      industry: data.industry || null,
      profileCompleted: true,
      emailVerificationToken,
      emailVerificationExpires,
    },
  });

  sendVerificationEmail(user.email, emailVerificationToken).catch(() => {});

  return { requiresVerification: true };
};

export const login = async (email: string, password: string) => {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.emailVerified) {
    throw createError('Please verify your email before logging in', 403);
  }

  if (user.isActive === false) {
    throw createError('Account suspended. Contact administrator.', 403);
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getMe = async (userId: string) => {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createError('User not found', 404);
  }
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const adminRegister = async (data: { email: string; password: string; secretKey: string; name?: string }, ip: string) => {
  if (data.secretKey !== process.env.ADMIN_SECRET_KEY) {
    throw createError('Invalid admin secret key', 401);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw createError('Invalid email format', 400);
  }
  if (data.password.length < 8) {
    throw createError('Password must be at least 8 characters', 400);
  }
  if (!data.name || data.name.trim().length < 2) {
    throw createError('Full name is required', 400);
  }

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw createError('Admin email already registered', 409);
  }

  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  const hashedPassword = await hashPassword(data.password);

  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'ADMIN',
      emailVerified: true,
      profileCompleted: true,
    },
  });

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const adminLogin = async (email: string, password: string) => {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  if (user.role !== 'ADMIN') {
    throw createError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.emailVerified) {
    throw createError('Please verify your email before logging in', 403);
  }

  if (user.isActive === false) {
    throw createError('Account suspended. Contact administrator.', 403);
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getAdminProfile = async (userId: string) => {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createError('Admin not found', 404);
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const sendVerification = async (email: string) => {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.emailVerified) {
    throw createError('Email is already verified', 400);
  }

  const emailVerificationToken = generateEmailToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.user.update({
    where: { id: user.id },
    data: { emailVerificationToken, emailVerificationExpires },
  });

  sendVerificationEmail(user.email, emailVerificationToken).catch(() => {});
};

export const verifyEmail = async (token: string) => {
  const user = await db.user.findUnique({ where: { emailVerificationToken: token } });
  if (!user) {
    throw createError('Invalid verification token', 400);
  }

  if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
    throw createError('Verification token has expired', 400);
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  const jwtToken = generateToken({ userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
  return { token: jwtToken };
};

export const forgotPassword = async (email: string) => {
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return;
  }

  const passwordResetToken = generateEmailToken();
  const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

  await db.user.update({
    where: { id: user.id },
    data: { passwordResetToken, passwordResetExpires },
  });

  sendPasswordResetEmail(user.email, passwordResetToken).catch(() => {});
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await db.user.findUnique({ where: { passwordResetToken: token } });
  if (!user) {
    throw createError('Invalid reset token', 400);
  }

  if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
    throw createError('Reset token has expired', 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  const jwtToken = generateToken({ userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
  return { token: jwtToken };
};

export const logout = async () => {
  return { message: 'Logout successful' };
};
