import express from "express";
import {
    signupController,
    loginController,
    getMeController,
    refreshController,
    logoutController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authRateLimiter, signupRateLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { loginSchema, refreshSchema, signupSchema } from "../schemas/auth.schemas.js";

const router = express.Router();

router.post("/signup", signupRateLimiter, validateBody(signupSchema), signupController);
router.post("/login", authRateLimiter, validateBody(loginSchema), loginController);
router.post("/refresh", authRateLimiter, validateBody(refreshSchema), refreshController);
router.post("/logout", authRateLimiter, validateBody(refreshSchema), logoutController);
router.get("/me", requireAuth, getMeController);

export default router;
