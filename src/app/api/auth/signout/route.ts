import { NextRequest } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { errorResponse, successResponse } from '../../helpers';

export async function POST(request: NextRequest) {
    try {
        // Get the auth token from the Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse('No authorization token provided', 'UNAUTHORIZED', 401);
        }

        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            return errorResponse(error.message, 'AUTH_ERROR', 400);
        }

        return successResponse({ message: 'Signed out successfully' });
    } catch (error) {
        console.error('Signout error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
