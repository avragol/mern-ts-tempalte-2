import { Router } from "express";
import { asyncHandler } from "@/utils/errorHandler.js";
import AuthController from "@/controllers/authControllers.js";
import { authMiddleware } from "@/middleware/authMdw.js";

const router = Router();
const authController = new AuthController();

router.post("/register", asyncHandler(authController.register.bind(authController)));
router.post("/login", asyncHandler(authController.login.bind(authController)));
router.get("/me", authMiddleware, asyncHandler(authController.getCurrentUser.bind(authController)));
router.post("/change-password", authMiddleware, asyncHandler(authController.changePassword.bind(authController)));

export default router;
