import { NextRequest } from 'next/server';
import { getStorage } from '@/lib/storage';
import { successResponse, errorResponse } from '@/lib/api/response';
import { validateApiKey } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return errorResponse('Unauthorized. Provide a valid Bearer token.', 401);
    }

    const storage = getStorage();
    const usage = await storage.getUsage();

    return successResponse(usage);
  } catch (error) {
    console.error('[API] Usage error:', error);
    return errorResponse('Internal server error.', 500);
  }
}
