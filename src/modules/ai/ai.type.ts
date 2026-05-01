import { z } from "zod";

export const AIFeedbackSchema = z.object({
    score: z.number().min(0).max(10),
    strengths: z.string(),
    improvements: z.string(),
});

export type AIFeedback = z.infer<typeof AIFeedbackSchema>;

export const AIResumeFeedbackSchema = z.object({
    score: z.number().min(0).max(100),
    summary: z.string(),
    suggestions: z.array(z.string()),
    sectionTips: z.record(z.string(), z.string()),
});

export type AIResumeFeedback = z.infer<typeof AIResumeFeedbackSchema>;