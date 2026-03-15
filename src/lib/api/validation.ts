import { z } from 'zod';

export const detectionRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(100000, 'Text too long'),
  options: z.object({
    detailed: z.boolean().optional(),
    perSentence: z.boolean().optional(),
    weights: z.record(z.string(), z.number().min(0).max(1)).optional(),
  }).optional(),
});

export const humanizationRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(100000, 'Text too long'),
  mode: z.enum(['standard', 'academic', 'creative', 'seo', 'professional']),
  options: z.object({
    intensity: z.enum(['light', 'medium', 'aggressive']).optional(),
    preserveKeywords: z.array(z.string()).optional(),
  }).optional(),
});

export const analyzeRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(100000, 'Text too long'),
  mode: z.enum(['standard', 'academic', 'creative', 'seo', 'professional']).optional(),
});
