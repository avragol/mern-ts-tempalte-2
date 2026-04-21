import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt.js";
import { AppError } from "@/utils/errorHandler.js";

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return next(new AppError("Unauthorized", 401));
    }
    const token = authHeader.slice(7);
    try {
        const payload = verifyToken(token);
        req.userId = payload.userId;
        next();
    } catch {
        next(new AppError("Invalid or expired token", 401));
    }
}
