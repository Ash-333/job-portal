"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.sendVerification = exports.getAdminProfile = exports.adminLogin = exports.adminRegister = exports.getMe = exports.login = exports.registerEmployer = exports.register = void 0;
const db_1 = require("../lib/db");
const utils_1 = require("../lib/utils");
const jwt_1 = require("../lib/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const email_1 = require("../lib/email");
const register = async (data) => {
    const existing = await db_1.db.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw (0, errorHandler_1.createError)('Email already registered', 409);
    }
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    const hashedPassword = await (0, utils_1.hashPassword)(data.password);
    const emailVerificationToken = (0, email_1.generateToken)();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = await db_1.db.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: data.phone || null,
            experienceLevel: data.experienceLevel || null,
            emailVerificationToken,
            emailVerificationExpires,
        },
    });
    (0, email_1.sendVerificationEmail)(user.email, emailVerificationToken).catch(() => { });
    return { requiresVerification: true };
};
exports.register = register;
const registerEmployer = async (data) => {
    const existing = await db_1.db.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw (0, errorHandler_1.createError)('Email already registered', 409);
    }
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    const hashedPassword = await (0, utils_1.hashPassword)(data.password);
    const emailVerificationToken = (0, email_1.generateToken)();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = await db_1.db.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: data.phone || null,
            role: 'EMPLOYER',
            companyName: data.companyName,
            companySlug: (0, utils_1.generateUniqueSlug)(data.companyName),
            companyDescription: data.companyDescription || null,
            companyWebsite: data.companyWebsite || null,
            companySize: data.companySize || null,
            industry: data.industry || null,
            profileCompleted: true,
            emailVerificationToken,
            emailVerificationExpires,
        },
    });
    (0, email_1.sendVerificationEmail)(user.email, emailVerificationToken).catch(() => { });
    return { requiresVerification: true };
};
exports.registerEmployer = registerEmployer;
const login = async (email, password) => {
    const user = await db_1.db.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    const isPasswordValid = await (0, utils_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    if (!user.emailVerified) {
        throw (0, errorHandler_1.createError)('Please verify your email before logging in', 403);
    }
    if (user.isActive === false) {
        throw (0, errorHandler_1.createError)('Account suspended. Contact administrator.', 403);
    }
    const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};
exports.login = login;
const getMe = async (userId) => {
    const user = await db_1.db.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getMe = getMe;
const adminRegister = async (data, ip) => {
    if (data.secretKey !== process.env.ADMIN_SECRET_KEY) {
        throw (0, errorHandler_1.createError)('Invalid admin secret key', 401);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw (0, errorHandler_1.createError)('Invalid email format', 400);
    }
    if (data.password.length < 8) {
        throw (0, errorHandler_1.createError)('Password must be at least 8 characters', 400);
    }
    if (!data.name || data.name.trim().length < 2) {
        throw (0, errorHandler_1.createError)('Full name is required', 400);
    }
    const existing = await db_1.db.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw (0, errorHandler_1.createError)('Admin email already registered', 409);
    }
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    const hashedPassword = await (0, utils_1.hashPassword)(data.password);
    const user = await db_1.db.user.create({
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
    const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};
exports.adminRegister = adminRegister;
const adminLogin = async (email, password) => {
    const user = await db_1.db.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    if (user.role !== 'ADMIN') {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    const isPasswordValid = await (0, utils_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    if (!user.emailVerified) {
        throw (0, errorHandler_1.createError)('Please verify your email before logging in', 403);
    }
    if (user.isActive === false) {
        throw (0, errorHandler_1.createError)('Account suspended. Contact administrator.', 403);
    }
    const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};
exports.adminLogin = adminLogin;
const getAdminProfile = async (userId) => {
    const user = await db_1.db.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw (0, errorHandler_1.createError)('Admin not found', 404);
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getAdminProfile = getAdminProfile;
const sendVerification = async (email) => {
    const user = await db_1.db.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    if (user.emailVerified) {
        throw (0, errorHandler_1.createError)('Email is already verified', 400);
    }
    const emailVerificationToken = (0, email_1.generateToken)();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db_1.db.user.update({
        where: { id: user.id },
        data: { emailVerificationToken, emailVerificationExpires },
    });
    (0, email_1.sendVerificationEmail)(user.email, emailVerificationToken).catch(() => { });
};
exports.sendVerification = sendVerification;
const verifyEmail = async (token) => {
    const user = await db_1.db.user.findUnique({ where: { emailVerificationToken: token } });
    if (!user) {
        throw (0, errorHandler_1.createError)('Invalid verification token', 400);
    }
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        throw (0, errorHandler_1.createError)('Verification token has expired', 400);
    }
    const updatedUser = await db_1.db.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        },
    });
    const jwtToken = (0, jwt_1.generateToken)({ userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
    return { token: jwtToken };
};
exports.verifyEmail = verifyEmail;
const forgotPassword = async (email) => {
    const user = await db_1.db.user.findUnique({ where: { email } });
    if (!user) {
        return;
    }
    const passwordResetToken = (0, email_1.generateToken)();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await db_1.db.user.update({
        where: { id: user.id },
        data: { passwordResetToken, passwordResetExpires },
    });
    (0, email_1.sendPasswordResetEmail)(user.email, passwordResetToken).catch(() => { });
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (token, newPassword) => {
    const user = await db_1.db.user.findUnique({ where: { passwordResetToken: token } });
    if (!user) {
        throw (0, errorHandler_1.createError)('Invalid reset token', 400);
    }
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        throw (0, errorHandler_1.createError)('Reset token has expired', 400);
    }
    const hashedPassword = await (0, utils_1.hashPassword)(newPassword);
    const updatedUser = await db_1.db.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        },
    });
    const jwtToken = (0, jwt_1.generateToken)({ userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
    return { token: jwtToken };
};
exports.resetPassword = resetPassword;
const logout = async () => {
    return { message: 'Logout successful' };
};
exports.logout = logout;
//# sourceMappingURL=authService.js.map