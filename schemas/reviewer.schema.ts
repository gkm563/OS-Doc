import { z } from "zod";

export const FeedbackCategorySchema = z.enum([
  "process",
  "code_style",
  "domain_knowledge",
  "tooling",
]);

export const ReviewerFeedbackSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format"),
  category: FeedbackCategorySchema,
  text: z.string().min(1),
  applied_in: z.array(z.string()).default([]),
  internalized: z.boolean().default(false),
});

export const ReviewerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  platforms: z.array(z.string()).default([]),
  feedback: z.array(ReviewerFeedbackSchema).default([]),
});

export type Reviewer = z.infer<typeof ReviewerSchema>;
export type ReviewerFeedback = z.infer<typeof ReviewerFeedbackSchema>;
