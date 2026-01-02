import { NextRequest } from 'next/server';
import { gateController } from '../../../../../lib/container';
import { errorResponse, toNextResponse, getAuthUser } from '../../../helpers';

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

        // Check for revoke sessions option (query parameter)
        const { searchParams } = new URL(request.url);
        const revokeExistingSessions = searchParams.get('revokeSessions') === 'true';

        const result = await gateController.regenerateAccessCode(id, {
            revokeExistingSessions
        });

        return toNextResponse(result);
    } catch (error) {
        console.error('Regenerate access code error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
