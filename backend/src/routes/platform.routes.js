import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  chatController,
  checkEligibilityPlatformController,
  explainSchemeController,
  getUserProfileController,
  getUserProfilesController,
  recommendedSchemesController,
  saveUserProfileController,
} from "../controllers/platform.controller.js";

const router = express.Router();

// All platform routes require authentication
router.use(requireAuth);

// User Profile endpoints (with /user/ prefix for clarity)
router.post("/user/profile", saveUserProfileController);
router.get("/user/profile", getUserProfilesController);
router.get("/user/profile/:id", getUserProfileController);

// Eligibility & Recommendations (no /user/ prefix for backwards compatibility)
router.post("/check-eligibility", checkEligibilityPlatformController);
router.get("/recommended-schemes", recommendedSchemesController);

// Chat & Scheme Explanation (no /user/ prefix)
router.post("/chat", chatController);
router.post("/explain-scheme", explainSchemeController);

export default router;
