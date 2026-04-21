import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "@/models/userModel.js";
import { createUserSchema, updateUserSchema } from "@/schemas/usersZod.js";
import { AppError } from "@/utils/errorHandler.js";

class UsersController {
    async createUser(req: Request, res: Response) {
        const { firstName, lastName, email, password, phone, profilePicture } = createUserSchema.parse(req.body);
        const existing = await User.findOne({ email });
        if (existing) throw new AppError("Email already in use", 409);
        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ firstName, lastName, email, password: hashed, phone, profilePicture });
        const { password: _pw, ...safeUser } = user.toObject();
        res.status(201).json({ success: true, data: safeUser });
    }

    async getUsers(_req: Request, res: Response) {
        const users = await User.find();

        if (users.length === 0) {
            throw new AppError('No users found', 404);
        }

        res.status(200).json({
            success: true,
            data: users
        });
    }

    async getUserById(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            throw new AppError('User ID is required', 400);
        }

        const user = await User.findById(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            data: user
        });
    }

    async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const updateData = updateUserSchema.parse(req.body);

        if (Object.keys(updateData).length === 0) {
            throw new AppError('At least one field must be provided for update', 400);
        }

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            data: user
        });
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            throw new AppError('User ID is required', 400);
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    }
}

export default UsersController;
