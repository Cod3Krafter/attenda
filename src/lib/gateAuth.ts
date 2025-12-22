import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.GATE_SESSION_JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('GATE_SESSION_JWT_SECRET environment variable is not set');
}

const secret = new TextEncoder().encode(JWT_SECRET);

export interface GateSessionPayload {
    type: 'gate_session';
    gateId: string;
    eventId: string;
    operatorId: string | null;  // organizerId of who authenticated (null for anonymous)
    iat: number;
    exp: number;
}

/**
 * Generate a gate session JWT token
 * @param gateId - ID of the gate
 * @param eventId - ID of the event
 * @param operatorId - ID of the organizer operating the gate (null for anonymous operators)
 * @returns JWT token string
 */
export async function generateGateSessionToken(
    gateId: string,
    eventId: string,
    operatorId: string | null = null
): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 4 * 60 * 60; // 4 hours in seconds

    const token = await new SignJWT({
        type: 'gate_session',
        gateId,
        eventId,
        operatorId,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(now + expiresIn)
        .sign(secret);

    return token;
}

/**
 * Verify and decode a gate session JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export async function verifyGateSessionToken(
    token: string
): Promise<GateSessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);

        // Validate payload structure (operatorId can be null for anonymous operators)
        if (
            payload.type !== 'gate_session' ||
            typeof payload.gateId !== 'string' ||
            typeof payload.eventId !== 'string' ||
            (payload.operatorId !== null && typeof payload.operatorId !== 'string')
        ) {
            return null;
        }

        return payload as unknown as GateSessionPayload;
    } catch (error) {
        // Token is invalid or expired
        return null;
    }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

/**
 * Validate gate session from NextRequest
 * Extracts and verifies JWT token from Authorization header
 * @param request - Next.js request object
 * @returns Decoded payload or null if invalid
 */
export async function validateGateSession(
    request: Request
): Promise<GateSessionPayload | null> {
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
        return null;
    }

    return await verifyGateSessionToken(token);
}
