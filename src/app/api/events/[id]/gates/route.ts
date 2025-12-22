import { NextRequest } from 'next/server';
import { gateController } from '../../../../../lib/container';
import { errorResponse, toNextResponse, parseRequestBody, successResponse, getAuthUser } from '../../../helpers';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        // Require authentication (gate list contains access codes)
        const user = await getAuthUser(request);
        if (!user) {
            return errorResponse(
                'Authentication required. Please sign in as an organizer.',
                'AUTH_REQUIRED',
                401
            );
        }

        const { id: eventId } = await params;
        const result = await gateController.getByEventId(eventId);
        return toNextResponse(result);
    } catch (error) {
        console.error('Get event gates error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
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

        const { id: eventId } = await params;

        const body = await parseRequestBody<{
            name: string;
            accessCode?: string;
        }>(request);

        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const { name, accessCode } = body;

        if (!name) {
            return errorResponse('name is required', 'VALIDATION_ERROR', 400);
        }

        const result = await gateController.create({
            eventId,
            name,
            accessCode,
        });

        if (result.success) {
            return successResponse(result.data, 201);
        }

        return toNextResponse(result);
    } catch (error) {
        console.error('Create gate error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
