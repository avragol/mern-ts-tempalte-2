import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import User from "@/models/userModel.js";
import { AppError } from "@/utils/errorHandler.js";
import { generateToken } from "@/utils/jwt.js";
import { registerSchema, loginSchema } from "@/schemas/usersZod.js";

class AuthController {
    async register(req: Request, res: Response) {
        const { firstName, lastName, email, password } = registerSchema.parse(req.body);

        const existing = await User.findOne({ email });
        if (existing) throw new AppError("Email already in use", 409);

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ firstName, lastName, email, password: hashed });

        const token = generateToken({ userId: (user._id as Types.ObjectId).toString(), email: user.email, role: user.role });
        const { password: _pw, ...safeUser } = user.toObject();

        res.status(201).json({ success: true, data: { token, user: safeUser } });
    }

    async login(req: Request, res: Response) {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findByEmail(email);
        if (!user) throw new AppError("Invalid credentials", 401);

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new AppError("Invalid credentials", 401);

        const token = generateToken({ userId: (user._id as Types.ObjectId).toString(), email: user.email, role: user.role });
        const { password: _pw, ...safeUser } = user.toObject();

        res.status(200).json({ success: true, data: { token, user: safeUser } });
    }

    async getCurrentUser(req: Request, res: Response) {
        const user = await User.findById(req.userId);
        if (!user) throw new AppError("User not found", 404);
        res.status(200).json({ success: true, data: user });
    }

    async changePassword(req: Request, res: Response) {
        const userId = req.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        const { currentPassword, newPassword } = req.body as { currentPassword?: unknown; newPassword?: unknown };

        if (typeof currentPassword !== 'string' || !currentPassword) {
            throw new AppError("Current password is required", 400);
        }
        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            throw new AppError("New password must be at least 8 characters", 400);
        }

        const user = await User.findById(userId).select('+password');
        if (!user) throw new AppError("User not found", 404);

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) throw new AppError("Current password is incorrect", 401);

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });
    }
}

export default AuthController;
