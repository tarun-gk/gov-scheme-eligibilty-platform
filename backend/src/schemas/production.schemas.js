import { z } from "zod";

export const interactionSchema = z.object({
  profileId: z.coerce.number().int().positive().optional(),
  schemeId: z.coerce.number().int().positive(),
  eventType: z.enum(["viewed", "shortlisted", "applied", "approved", "rejected", "eligible-update"]),
  metadata: z.record(z.any()).optional(),
});

export const analyticsQuerySchema = z.object({
  state: z.string().trim().min(2).max(120).optional(),
});
