import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { auditSensitive } from "../../middlewares/audit.middleware.js";
import { validateBody, validateQuery } from "../../middlewares/validate.middleware.js";
import { authenticatedRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  analyticsController,
  compareSchemesController,
  evaluateEligibilityController,
  interactionController,
  optimizeBenefitsController,
} from "../../controllers/production.controller.js";
import { healthController, readyController } from "../../controllers/health.controller.js";
import { compareSchemesQuerySchema, eligibilityInputSchema } from "../../schemas/eligibility.schemas.js";
import { analyticsQuerySchema, interactionSchema } from "../../schemas/production.schemas.js";

const router = express.Router();

router.get("/health", healthController);
router.get("/ready", readyController);

router.post(
  "/eligibility/evaluate",
  requireAuth,
  authenticatedRateLimiter,
  validateBody(eligibilityInputSchema),
  auditSensitive("eligibility.evaluate"),
  evaluateEligibilityController
);

router.post(
  "/eligibility/optimize",
  requireAuth,
  authenticatedRateLimiter,
  validateBody(eligibilityInputSchema),
  auditSensitive("eligibility.optimize"),
  optimizeBenefitsController
);

router.get(
  "/schemes/compare",
  requireAuth,
  authenticatedRateLimiter,
  validateQuery(compareSchemesQuerySchema),
  compareSchemesController
);

router.post(
  "/interactions",
  requireAuth,
  authenticatedRateLimiter,
  validateBody(interactionSchema),
  interactionController
);

router.get(
  "/analytics/summary",
  requireAuth,
  authenticatedRateLimiter,
  validateQuery(analyticsQuerySchema),
  auditSensitive("analytics.summary"),
  analyticsController
);

export default router;
