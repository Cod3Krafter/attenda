import {AccessCodeGenerator} from "./gateAccessCodeGenerator";
import { sanitizeText, isValidLength } from '../../../lib/sanitize';

export class Gate {
    constructor(
        readonly id: string,
        readonly eventId: string,
        public name: string,
        public accessCode: string,
        public isActive: boolean = true,
        public createdAt: Date = new Date(),
        public updatedAt?: Date
    ) {
        // Sanitize inputs
        this.name = sanitizeText(name);
        this.accessCode = sanitizeText(accessCode);

        this.validateGate();
    }

    private validateGate() {
        if (!this.name || this.name.trim().length === 0) {
            throw new Error('Gate name is required');
        }
        if (!isValidLength(this.name, 1, 100)) {
            throw new Error('Gate name must be between 1 and 100 characters');
        }
        if (!this.accessCode || this.accessCode.trim().length === 0) {
            throw new Error('Access code is required');
        }
        if (!isValidLength(this.accessCode, 4, 20)) {
            throw new Error('Access code must be between 4 and 20 characters');
        }
    }

    activate() {
        if (this.isActive) throw new Error('Gate is already active');
        this.isActive = true;
        this.updatedAt = new Date();
    }

    deactivate() {
        if (!this.isActive) throw new Error('Gate is already inactive');
        this.isActive = false;
        this.updatedAt = new Date();
    }

    regenerateAccessCode(generator: AccessCodeGenerator) {
        const newCode = generator.generate();

        this.accessCode = newCode;
        this.updatedAt = new Date();

        return newCode;
    }

    setAccessCode(code: string) {
        if (!code || code.trim().length === 0) {
            throw new Error('Access code cannot be empty');
        }
        this.accessCode = code;
        this.updatedAt = new Date();
    }

    updateDetails(details: { name?: string; accessCode?: string }) {
        if (details.name) this.name = details.name;
        if (details.accessCode) this.accessCode = details.accessCode;
        this.updatedAt = new Date();
    }
}
