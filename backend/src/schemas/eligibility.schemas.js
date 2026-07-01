import { z } from "zod";

export const eligibilityInputSchema = z.object({
  profileId: z.coerce.number().int().positive().optional(),
  profile: z.object({
    age: z.coerce.number().int().min(0).max(120),
    income: z.coerce.number().min(0),
    gender: z.enum(["Male", "Female", "Other"]),
    occupation: z.string().trim().min(2).max(120),
    caste_category: z.string().trim().min(1).max(60),
    state: z.string().trim().min(2).max(120),
    land_owned: z.coerce.number().min(0).max(100000).optional().default(0),
    location_type: z.enum(["urban", "rural"]).optional(),
    disability_status: z.enum(["yes", "no"]).optional(),
    documents: z.array(z.string().trim().min(2).max(120)).optional().default([]),
  }),
  topK: z.coerce.number().int().positive().max(100).default(20),
  language: z.enum(["en", "hi"]).default("en"),
});

export const compareSchemesQuerySchema = z.object({
  ids: z.string().min(1),
});
