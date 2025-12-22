import { NextRequest } from 'next/server';
import { organizerController } from '../../../../lib/container';
import { errorResponse, toNextResponse, parseRequestBody } from '../../helpers';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const result = await organizerController.getById(id);
        return toNextResponse(result);
    } catch (error) {
        console.error('Get organizer error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}

export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        const body = await parseRequestBody<{
            name?: string;
            email?: string;
            role?: 'owner' | 'admin' | 'staff';
        }>(request);

        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const result = await organizerController.update(id, body);
        return toNextResponse(result);
    } catch (error) {
        console.error('Update organizer error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
