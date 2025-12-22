import { NextRequest } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { organizerController } from '../../../../lib/container';
import { errorResponse, successResponse, parseRequestBody } from '../../helpers';

interface SignUpRequest {
    email: string;
    password: string;
    name: string;
    role?: 'owner' | 'admin' | 'staff';
}

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await parseRequestBody<SignUpRequest>(request);
        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const { email, password, name, role } = body;

        // Validate required fields
        if (!email || !password || !name) {
            return errorResponse('Email, password, and name are required', 'VALIDATION_ERROR', 400);
        }

        // Create auth user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError || !authData.user) {
            return errorResponse(authError?.message || 'Failed to create user', 'AUTH_ERROR', 400);
        }

        // Create organizer record
        const organizerResult = await organizerController.create({
            authUserId: authData.user.id,
            email,
            name,
            role: role || 'staff',
        });

        if (!organizerResult.success) {
            // Rollback: Delete the auth user if organizer creation fails
            await supabase.auth.admin.deleteUser(authData.user.id);
            return errorResponse(
                organizerResult.error.message,
                organizerResult.error.code,
                500
            );
        }

        return successResponse(
            {
                user: authData.user,
                organizer: organizerResult.data,
                session: authData.session,
            },
            201
        );
    } catch (error) {
        console.error('Signup error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
