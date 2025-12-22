// API Route Helper Functions

import { NextRequest, NextResponse } from 'next/server';
import { ControllerResponse } from '../../adapters/controllers/types';
import { supabase } from '../../lib/supabase';

// Convert ControllerResponse to Next.js Response with appropriate status code
export function toNextResponse<T>(result: ControllerResponse<T>): NextResponse {
    if (result.success) {
        return NextResponse.json(result, { status: 200 });
    }

    // Map error codes to HTTP status codes
    const statusCode = getStatusCode(result.error.code);
    return NextResponse.json(result, { status: statusCode });
}

// Map error codes to HTTP status codes
function getStatusCode(code?: string): number {
    switch (code) {
        case 'NOT_FOUND':
        case 'ORGANIZER_NOT_FOUND':
        case 'EVENT_NOT_FOUND':
        case 'GUEST_NOT_FOUND':
        case 'GATE_NOT_FOUND':
            return 404;

        case 'ALREADY_EXISTS':
        case 'EMAIL_TAKEN':
        case 'ACCESS_CODE_TAKEN':
            return 409; // Conflict

        case 'VALIDATION_ERROR':
        case 'INVALID_REQUEST':
            return 400; // Bad Request

        case 'UNAUTHORIZED':
            return 401;

        case 'FORBIDDEN':
            return 403;

        case 'INTERNAL_ERROR':
        default:
            return 500;
    }
}

// Get authenticated user from Supabase session
export async function getAuthUser(request: NextRequest) {
    try {
        // Get the auth token from the Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);

        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Error getting auth user:', error);
        return null;
    }
}

// Parse and validate JSON request body
export async function parseRequestBody<T>(request: NextRequest): Promise<T | null> {
    try {
        const body = await request.json();
        return body as T;
    } catch (error) {
        console.error('Error parsing request body:', error);
        return null;
    }
}

// Error response helpers
export function errorResponse(message: string, code?: string, status: number = 400): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: { message, code },
        },
        { status }
    );
}

export function successResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        { status }
    );
}

// Require authentication for a route
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
    const user = await getAuthUser(request);
    if (!user) {
        return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }
    return null; // No error, proceed
}
