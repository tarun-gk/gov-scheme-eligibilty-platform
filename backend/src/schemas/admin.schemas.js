import { z } from "zod";

export const adminProfileListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const adminProfileIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});