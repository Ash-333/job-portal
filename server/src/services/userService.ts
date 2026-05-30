import { db } from '../lib/db';
import { createError } from '../middleware/errorHandler';
import { generateUniqueSlug } from '../lib/utils';
import type { UpdateProfileInput } from '../schemas/user';

export const updateProfile = async (userId: string, data: UpdateProfileInput) => {
  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true, lastName: true, bio: true, skills: true,
      location: true, resume: true,
    },
  });
  if (!currentUser) {
    throw createError('User not found', 404);
  }

  const merged = { ...currentUser, ...data };

  const isProfileComplete = !!(
    merged.firstName &&
    merged.lastName &&
    merged.bio &&
    merged.skills && merged.skills.length > 0 &&
    merged.location &&
    merged.resume
  );

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      ...data,
      updatedAt: new Date(),
      profileCompleted: isProfileComplete,
    },
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const updateEmployerProfile = async (userId: string, data: any) => {
  const current = await db.user.findUnique({
    where: { id: userId },
    select: { companyName: true },
  });

  const updateData: any = { ...data, updatedAt: new Date() };

  if (data.companyName && data.companyName !== current?.companyName) {
    updateData.companySlug = generateUniqueSlug(data.companyName);
  }

  const user = await db.user.update({
    where: { id: userId },
    data: updateData,
  });

  if (updateData.companySlug) {
    await db.job.updateMany({
      where: { postedById: userId },
      data: { companySlug: updateData.companySlug },
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getCompanyProfile = async (companySlug: string) => {
  const employer = await db.user.findFirst({
    where: {
      role: 'EMPLOYER',
      isActive: true,
      companySlug,
    },
    select: {
      id: true, companyName: true, companySlug: true, companyDescription: true,
      companyLogo: true, companyWebsite: true, companySize: true,
      industry: true, location: true,
    },
  });
  if (!employer) {
    throw createError('Company not found', 404);
  }
  return employer;
};
