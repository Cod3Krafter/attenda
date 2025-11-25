export class Scan {
    constructor(
        readonly id: string,
        readonly guestId: string,
        readonly gateId: string,
        readonly eventId: string,
        readonly timestamp: Date = new Date(),
        public result: 'success' | 'denied' | 'invalid',
        readonly scanData?: string,
        readonly createdAt: Date = new Date()
    ) {
        this.validateScan();
    }

    private validateScan() {
        if (!this.guestId || this.guestId.trim().length === 0) {
            throw new Error('Guest ID is required');
        }
        if (!this.gateId || this.gateId.trim().length === 0) {
            throw new Error('Gate ID is required');
        }
        if (!this.eventId || this.eventId.trim().length === 0) {
            throw new Error('Event ID is required');
        }
        if (!['success', 'denied', 'invalid'].includes(this.result)) {
            throw new Error('Invalid scan result');
        }
    }

    updateResult(newResult: 'success' | 'denied' | 'invalid') {
        if (!['success', 'denied', 'invalid'].includes(newResult)) {
            throw new Error('Invalid scan result');
        }
        this.result = newResult;
    }
}
