import { NextRequest } from 'next/server';
import { guestController } from '../../../../lib/container';
import { errorResponse, toNextResponse, parseRequestBody, getAuthUser } from '../../helpers';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        // Require authentication (guest data contains PII)
        const user = await getAuthUser(request);
        if (!user) {
            return errorResponse(
                'Authentication required. Please sign in as an organizer.',
                'AUTH_REQUIRED',
                401
            );
        }

        const { id } = await params;
        const result = await guestController.getById(id);
        return toNextResponse(result);
    } catch (error) {
        console.error('Get guest error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}

export async function PATCH(request: NextRequest, { params }: Params) {
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

        const body = await parseRequestBody<{
            name?: string;
            email?: string;
            phone?: string;
        }>(request);

        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const result = await guestController.update(id, body);
        return toNextResponse(result);
    } catch (error) {
        console.error('Update guest error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
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
        const result = await guestController.delete(id);
        return toNextResponse(result);
    } catch (error) {
        console.error('Delete guest error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
