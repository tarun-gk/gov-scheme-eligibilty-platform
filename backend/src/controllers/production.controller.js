import { eligibilityInputSchema } from "../schemas/eligibility.schemas.js";
import { evaluateHybridEligibility } from "../services/ml/hybrid-eligibility.service.js";
import { optimizeBenefitStack } from "../services/core/benefit-optimization.service.js";
import { compareSchemes } from "../services/core/scheme-comparison.service.js";
import { getStakeholderAnalytics } from "../services/core/analytics.service.js";
import { recordInteractionEvent } from "../services/core/historical-signal.service.js";
import { createNotification } from "../services/core/notifications.service.js";

export async function evaluateEligibilityController(req, res) {
  try {
    const payload = req.body;

    const scored = await evaluateHybridEligibility({
      profile: payload.profile,
      accountId: req.user?.id || null,
      topK: payload.topK,
    });

    return res.status(200).json({
      profileId: payload.profileId || null,
      results: scored,
      total: scored.length,
    });
  } catch (error) {
    return res.status(400).json({ message: "Invalid eligibility request" });
  }
}

export async function optimizeBenefitsController(req, res) {
  try {
    const payload = req.body;
    const scored = await evaluateHybridEligibility({
      profile: payload.profile,
      accountId: req.user?.id || null,
      topK: Math.max(payload.topK, 40),
    });

    const optimized = optimizeBenefitStack(scored, 5);
    return res.status(200).json(optimized);
  } catch (error) {
    return res.status(400).json({ message: "Invalid eligibility request" });
  }
}

export async function compareSchemesController(req, res) {
  try {
    const ids = String(req.query.ids || "")
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));

    if (ids.length < 2) {
      return res.status(400).json({ message: "At least two scheme IDs are required" });
    }

    const result = await compareSchemes(ids);
    return res.status(200).json({ schemes: result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to compare schemes" });
  }
}

export async function analyticsController(req, res) {
  try {
    const state = req.query.state ? String(req.query.state) : null;
    const analytics = await getStakeholderAnalytics({ state });
    return res.status(200).json(analytics);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
}

export async function interactionController(req, res) {
  try {
    const { profileId = null, schemeId, eventType, metadata = null } = req.body || {};

    if (!schemeId || !eventType) {
      return res.status(400).json({ message: "schemeId and eventType are required" });
    }

    await recordInteractionEvent({
      accountId: req.user.id,
      profileId,
      schemeId,
      eventType,
      eventMetadata: metadata,
    });

    if (eventType === "eligible-update") {
      await createNotification({
        accountId: req.user.id,
        channel: "in_app",
        title: "Eligibility Update",
        message: `Eligibility status was updated for scheme ${schemeId}`,
        payload: { schemeId, profileId },
      });
    }

    return res.status(201).json({ message: "Interaction recorded" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to record interaction" });
  }
}
