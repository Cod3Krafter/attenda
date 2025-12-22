import { NextRequest } from 'next/server';
import { getAuthUser, errorResponse, successResponse } from '../../helpers';
import { organizerController } from '../../../../lib/container';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const user = await getAuthUser(request);

        if (!user) {
            return successResponse(null);
        }

        // Fetch organizer record
        const organizerResult = await organizerController.getByAuthUserId(user.id);

        if (!organizerResult.success) {
            return successResponse({ user, organizer: null });
        }

        return successResponse({
            user,
            organizer: organizerResult.data,
        });
    } catch (error) {
        console.error('Session error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
