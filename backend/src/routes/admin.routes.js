import express from "express";
import {
  deleteProfileController,
  getProfilesController,
  getProfileStatsController,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { adminProfileIdParamSchema, adminProfileListQuerySchema } from "../schemas/admin.schemas.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/profiles", validateQuery(adminProfileListQuerySchema), getProfilesController);
router.get("/profiles/stats", getProfileStatsController);
router.delete("/profiles/:id", validateParams(adminProfileIdParamSchema), deleteProfileController);

export default router;
