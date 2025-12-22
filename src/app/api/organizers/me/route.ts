import { NextRequest } from 'next/server';
import { getAuthUser, errorResponse, toNextResponse } from '../../helpers';
import { organizerController } from '../../../../lib/container';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const user = await getAuthUser(request);
        if (!user) {
            return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
        }

        // Get organizer by auth user ID
        const result = await organizerController.getByAuthUserId(user.id);
        return toNextResponse(result);
    } catch (error) {
        console.error('Get current organizer error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
