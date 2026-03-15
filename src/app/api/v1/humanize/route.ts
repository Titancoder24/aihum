import { NextRequest } from 'next/server';
import { humanizationRequestSchema } from '@/lib/api/validation';
import { humanizeText } from '@/lib/engine/humanization';
import { successResponse, errorResponse } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/middleware';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const { allowed, remaining } = rateLimit(`humanize:${ip}`, 20, 60_000);

    if (!allowed) {
      return errorResponse('Rate limit exceeded. Try again later.', 429);
    }

    const body: unknown = await request.json().catch(() => null);

    if (!body) {
      return errorResponse('Invalid JSON in request body.', 400);
    }

    const parsed = humanizationRequestSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .join(', ');
      return errorResponse(message, 422);
    }

    const { text, mode } = parsed.data;
    const result = humanizeText(text, mode);

    const response = successResponse(result);
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  } catch (error) {
    console.error('[API] Humanization error:', error);
    return errorResponse('Internal server error.', 500);
  }
}
