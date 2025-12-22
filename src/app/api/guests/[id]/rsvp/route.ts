import { NextRequest } from 'next/server';
import { guestController } from '../../../../../lib/container';
import { errorResponse, toNextResponse, parseRequestBody } from '../../../helpers';

interface Params {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        const body = await parseRequestBody<{ status: 'yes' | 'no' }>(request);

        if (!body || !body.status) {
            return errorResponse('status is required', 'VALIDATION_ERROR', 400);
        }

        if (body.status !== 'yes' && body.status !== 'no') {
            return errorResponse('status must be yes or no', 'VALIDATION_ERROR', 400);
        }

        const result = await guestController.updateRsvp(id, { status: body.status });
        return toNextResponse(result);
    } catch (error) {
        console.error('Update RSVP error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
