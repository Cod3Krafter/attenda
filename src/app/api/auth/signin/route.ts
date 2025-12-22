import { NextRequest } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { organizerController } from '../../../../lib/container';
import { errorResponse, successResponse, parseRequestBody } from '../../helpers';

interface SignInRequest {
    email: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await parseRequestBody<SignInRequest>(request);
        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return errorResponse('Email and password are required', 'VALIDATION_ERROR', 400);
        }

        // Sign in with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            return errorResponse(
                authError?.message || 'Invalid credentials',
                'AUTH_ERROR',
                401
            );
        }

        // Fetch organizer record
        const organizerResult = await organizerController.getByAuthUserId(authData.user.id);

        if (!organizerResult.success) {
            return errorResponse(
                'Organizer record not found',
                'ORGANIZER_NOT_FOUND',
                404
            );
        }

        return successResponse({
            user: authData.user,
            organizer: organizerResult.data,
            session: authData.session,
        });
    } catch (error) {
        console.error('Signin error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
