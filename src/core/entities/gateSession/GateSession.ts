export class GateSession {
    constructor(
        readonly id: string,
        readonly gateId: string,
        readonly eventId: string,
        readonly operatorId: string | null, // Nullable for anonymous gate operators
        public tokenHash: string,
        public expiresAt: Date,
        public createdAt: Date = new Date()
    ) {
        this.validateSession();
    }

    private validateSession() {
        if (!this.gateId || this.gateId.trim().length === 0) {
            throw new Error('Gate ID is required');
        }
        if (!this.eventId || this.eventId.trim().length === 0) {
            throw new Error('Event ID is required');
        }
        // operatorId is optional (null for anonymous operators)
        if (!this.tokenHash || this.tokenHash.trim().length === 0) {
            throw new Error('Token hash is required');
        }
        if (!(this.expiresAt instanceof Date) || isNaN(this.expiresAt.getTime())) {
            throw new Error('Valid expiration date is required');
        }
    }

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isActive(): boolean {
        return !this.isExpired();
    }
}
