import { NextRequest } from 'next/server';
import { eventController } from '../../../../../lib/container';
import { errorResponse, toNextResponse, parseRequestBody, getAuthUser } from '../../../helpers';

interface Params {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
    try {
        // Require authentication
        const user = await getAuthUser(request);
        if (!user) {
            return errorResponse(
                'Authentication required. Please sign in as an organizer.',
                'AUTH_REQUIRED',
                401
            );
        }

        const { id } = await params;

        const body = await parseRequestBody<{ reason?: string }>(request);
        const reason = body?.reason;

        const result = await eventController.cancel(id, reason);
        return toNextResponse(result);
    } catch (error) {
        console.error('Cancel event error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
