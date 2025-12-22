import { NextRequest } from 'next/server';
import { gateRepository, gateSessionRepository } from '../../../../lib/container';
import { errorResponse, successResponse, parseRequestBody } from '../../helpers';
import { generateGateSessionToken } from '../../../../lib/gateAuth';
import { GateSession } from '../../../../core/entities/gateSession/GateSession';
import crypto from 'crypto';

interface GateAuthRequest {
    gateId: string;
    accessCode: string;
}

/**
 * POST /api/gates/auth
 *
 * 🔓 PUBLIC ENDPOINT - No authentication required!
 *
 * Authenticate to a gate using only the gate ID and access code.
 * This allows anyone with the gate link and access code to operate the gate.
 *
 * 🎯 Use Case:
 * 1. Organizer shares gate link: /gate/[gateId]
 * 2. Organizer shares access code (e.g., "A3X9K2")
 * 3. Gate operator (anyone) opens link, enters code
 * 4. Receives 4-hour session token
 * 5. Can now scan guests on that device
 *
 * ✅ Validates:
 * - Gate exists
 * - Access code is correct
 * - Gate is active
 *
 * ⚙️ On success:
 * - Deletes any existing session for the gate (one session per gate)
 * - Generates new JWT token (4-hour expiry, non-refreshable)
 * - Stores session in database (with null operatorId for anonymous)
 *
 * 📤 Returns:
 * - gateSessionToken: JWT token valid for 4 hours
 * - expiresAt: Token expiration timestamp
 * - expiresIn: 14400 seconds (4 hours)
 * - gate: Gate information (id, name, eventId)
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await parseRequestBody<GateAuthRequest>(request);
        if (!body) {
            return errorResponse('Invalid request body', 'INVALID_REQUEST', 400);
        }

        const { gateId, accessCode } = body;

        // Validate required fields
        if (!gateId || !accessCode) {
            return errorResponse(
                'gateId and accessCode are required',
                'VALIDATION_ERROR',
                400
            );
        }

        // Fetch gate
        const gate = await gateRepository.findById(gateId);
        if (!gate) {
            return errorResponse('Gate not found', 'GATE_NOT_FOUND', 404);
        }

        // Validate access code
        if (gate.accessCode !== accessCode) {
            return errorResponse(
                'Invalid gate access code',
                'INVALID_ACCESS_CODE',
                403
            );
        }

        // Validate gate is active
        if (!gate.isActive) {
            return errorResponse(
                'Gate is not active',
                'GATE_INACTIVE',
                403
            );
        }

        // Delete any existing session for this gate (enforce one session per gate)
        await gateSessionRepository.deleteByGateId(gateId);

        // Generate JWT token (no operatorId for anonymous operators)
        const token = await generateGateSessionToken(
            gateId,
            gate.eventId,
            null // Anonymous operator (no organizer account)
        );

        // Calculate expiry (4 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 4);

        // Create token hash for storage
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Save session to database
        const session = new GateSession(
            crypto.randomUUID(),
            gateId,
            gate.eventId,
            null, // Anonymous operator
            tokenHash,
            expiresAt
        );

        await gateSessionRepository.save(session);

        // Return token and gate info
        return successResponse({
            gateSessionToken: token,
            expiresAt: expiresAt.toISOString(),
            expiresIn: 4 * 60 * 60, // 4 hours in seconds
            gate: {
                id: gate.id,
                name: gate.name,
                eventId: gate.eventId,
            },
        }, 201);
    } catch (error) {
        console.error('Gate authentication error:', error);
        return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
