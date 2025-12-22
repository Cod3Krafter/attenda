import { NextRequest } from 'next/server';
import { guestController } from '../../../../../lib/container';
import { errorResponse, toNextResponse, parseRequestBody, successResponse, getAuthUser } from '../../../helpers';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        // Require authentication (guest list contains PII)
        const user = await getAuthUser(request);
        if (!user) {
            return errorResponse(
                'Authentication required. Please sign in as an organizer.',
                'AUTH_REQUIRED',
                401
            );
        }

        const { id: eventId } = await params;
        const result = await guestController.getByEventId(eventId);
        return toNextResponse(result);
    } catch (error) {
        console.error('Get event guests error:', error);
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
            email: string;
            phone: string;
            qrCode?: string;
        }>(request);

        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const { name, email, phone, qrCode } = body;

        if (!name || !email || !phone) {
            return errorResponse(
                'name, email, and phone are required',
                'VALIDATION_ERROR',
                400
            );
        }

        const result = await guestController.create({
            eventId,
            name,
            email,
            phone,
            qrCode,
        });

        if (result.success) {
            return successResponse(result.data, 201);
        }

        return toNextResponse(result);
    } catch (error) {
        console.error('Create guest error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
