import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import User from "@/models/userModel.js";
import { AppError } from "@/utils/errorHandler.js";
import { generateToken } from "@/utils/jwt.js";
import { registerSchema, loginSchema } from "@/zod/usersZod.js";

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
}

export default AuthController;
