import { z } from "zod";

export const ContributionPlatformSchema = z.enum([
  "gerrit",
  "github",
  "gitlab",
  "wikipedia",
  "phabricator",
]);

export const ContributionStatusSchema = z.enum([
  "merged",
  "open",
  "rejected",
  "under_review",
]);

export const ContributionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  platform: ContributionPlatformSchema,
  status: ContributionStatusSchema,
  repository: z.string(),
  task_id: z.string().optional().nullable(),
  pr_or_change_id: z.string().optional().nullable(),
  reviewers: z.array(z.string()).default([]),
  review_notes: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  screenshots: z.array(z.string()).default([]),
  links: z.array(z.string()).default([]),
  date_started: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format"),
  date_completed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format").optional().nullable(),
  time_spent_minutes: z.number().nonnegative().default(0),
  learning_note_id: z.string().optional().nullable(),
  related_contribution_ids: z.array(z.string()).default([]),
});

export type Contribution = z.infer<typeof ContributionSchema>;
