import { NextRequest } from 'next/server';
import { scanController } from '../../../lib/container';
import { errorResponse, toNextResponse, parseRequestBody, successResponse } from '../helpers';
import { validateGateSession } from '../../../lib/gateAuth';

/**
 * Scan Endpoint (Secure)
 *
 * Records a guest scan at a gate during check-in.
 *
 * Security:
 * - Requires valid gate session token (obtained via POST /api/gates/auth)
 * - Token must not be expired (4-hour TTL)
 * - gateId and eventId are extracted from token (not request body)
 *
 * Request:
 * - Authorization: Bearer <gateSessionToken>
 * - Body: { guestId, scanData? }
 *
 * Response:
 * - Scan result (success/denied/invalid)
 * - Guest info (auto-checked in on success)
 * - Gate info
 */
export async function POST(request: NextRequest) {
    try {
        // Validate gate session token
        const session = await validateGateSession(request);

        if (!session) {
            return errorResponse(
                'Valid gate session token required. Please authenticate via POST /api/gates/auth',
                'AUTH_REQUIRED',
                401
            );
        }

        // Extract gateId and eventId from token (secure - can't be spoofed)
        const { gateId, eventId } = session;

        // Parse request body (only guestId and scanData)
        const body = await parseRequestBody<{
            guestId: string;
            scanData?: string;
        }>(request);

        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const { guestId, scanData } = body;

        if (!guestId) {
            return errorResponse(
                'guestId is required',
                'VALIDATION_ERROR',
                400
            );
        }

        // Perform scan using token-provided gateId and eventId
        const result = await scanController.create({
            guestId,
            gateId,    // From JWT token
            eventId,   // From JWT token
            scanData,
        });

        if (result.success) {
            return successResponse(result.data, 201);
        }

        return toNextResponse(result);
    } catch (error) {
        console.error('Create scan error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
