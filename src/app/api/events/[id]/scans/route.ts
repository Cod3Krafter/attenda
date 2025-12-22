import { NextRequest } from 'next/server';
import { scanController } from '../../../../../lib/container';
import { errorResponse, toNextResponse, getAuthUser } from '../../../helpers';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        // Require authentication (scan history is sensitive)
        const user = await getAuthUser(request);
        if (!user) {
            return errorResponse(
                'Authentication required. Please sign in as an organizer.',
                'AUTH_REQUIRED',
                401
            );
        }

        const { id: eventId } = await params;
        const result = await scanController.getByEventId(eventId);
        return toNextResponse(result);
    } catch (error) {
        console.error('Get event scans error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
