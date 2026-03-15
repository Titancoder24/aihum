import { NextRequest } from 'next/server';
import { analyzeRequestSchema } from '@/lib/api/validation';
import { detectAIContent } from '@/lib/engine/detection';
import { humanizeText } from '@/lib/engine/humanization';
import { successResponse, errorResponse } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/middleware';
import type { AnalyzeResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const { allowed, remaining } = rateLimit(`analyze:${ip}`, 10, 60_000);

    if (!allowed) {
      return errorResponse('Rate limit exceeded. Try again later.', 429);
    }

    const body: unknown = await request.json().catch(() => null);

    if (!body) {
      return errorResponse('Invalid JSON in request body.', 400);
    }

    const parsed = analyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .join(', ');
      return errorResponse(message, 422);
    }

    const { text, mode = 'standard' } = parsed.data;

    const detection = detectAIContent(text);
    const humanization = humanizeText(text, mode);

    const result: AnalyzeResponse = { detection, humanization };

    const response = successResponse(result);
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  } catch (error) {
    console.error('[API] Analyze error:', error);
    return errorResponse('Internal server error.', 500);
  }
}
