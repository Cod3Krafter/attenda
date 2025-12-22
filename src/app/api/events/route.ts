import { NextRequest } from 'next/server';
import { eventController } from '../../../lib/container';
import { errorResponse, toNextResponse, parseRequestBody, successResponse, getAuthUser } from '../helpers';

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const organizerId = searchParams.get('organizerId');

        if (organizerId) {
            const result = await eventController.getByOrganizerId(organizerId);
            return toNextResponse(result);
        }

        const result = await eventController.getAll();
        return toNextResponse(result);
    } catch (error) {
        console.error('Get events error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}

export async function POST(request: NextRequest) {
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

        const body = await parseRequestBody<{
            organizerId: string;
            title: string;
            description?: string;
            venue: string;
            startDate?: string;
            endDate: string;
        }>(request);

        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const { organizerId, title, description, venue, startDate, endDate } = body;

        if (!organizerId || !title || !venue || !endDate) {
            return errorResponse(
                'organizerId, title, venue, and endDate are required',
                'VALIDATION_ERROR',
                400
            );
        }

        const result = await eventController.create({
            organizerId,
            title,
            description,
            venue,
            startDate,
            endDate,
        });

        if (result.success) {
            return successResponse(result.data, 201);
        }

        return toNextResponse(result);
    } catch (error) {
        console.error('Create event error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
