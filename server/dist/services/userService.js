"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyProfile = exports.updateEmployerProfile = exports.updateProfile = void 0;
const db_1 = require("../lib/db");
const errorHandler_1 = require("../middleware/errorHandler");
const utils_1 = require("../lib/utils");
const updateProfile = async (userId, data) => {
    const currentUser = await db_1.db.user.findUnique({
        where: { id: userId },
        select: {
            firstName: true, lastName: true, bio: true, skills: true,
            location: true, resume: true,
        },
    });
    if (!currentUser) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const merged = { ...currentUser, ...data };
    const isProfileComplete = !!(merged.firstName &&
        merged.lastName &&
        merged.bio &&
        merged.skills && merged.skills.length > 0 &&
        merged.location &&
        merged.resume);
    const updatedUser = await db_1.db.user.update({
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
exports.updateProfile = updateProfile;
const updateEmployerProfile = async (userId, data) => {
    const current = await db_1.db.user.findUnique({
        where: { id: userId },
        select: { companyName: true },
    });
    const updateData = { ...data, updatedAt: new Date() };
    if (data.companyName && data.companyName !== current?.companyName) {
        updateData.companySlug = (0, utils_1.generateUniqueSlug)(data.companyName);
    }
    const user = await db_1.db.user.update({
        where: { id: userId },
        data: updateData,
    });
    if (updateData.companySlug) {
        await db_1.db.job.updateMany({
            where: { postedById: userId },
            data: { companySlug: updateData.companySlug },
        });
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.updateEmployerProfile = updateEmployerProfile;
const getCompanyProfile = async (companySlug) => {
    const employer = await db_1.db.user.findFirst({
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
        throw (0, errorHandler_1.createError)('Company not found', 404);
    }
    return employer;
};
exports.getCompanyProfile = getCompanyProfile;
//# sourceMappingURL=userService.js.map