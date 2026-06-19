import { z } from "zod";

export const AchievementTierSchema = z.enum(["bronze", "silver", "gold"]);

export const AchievementSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  tier: AchievementTierSchema,
  unlocked_at: z.string().datetime().optional().nullable(),
  icon: z.string(), // icon name or path
});

export type Achievement = z.infer<typeof AchievementSchema>;
