import {AccessCodeGenerator} from "./gateAccessCodeGenerator" 
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
        this.validateGate();
    }

    private validateGate() {
        if (!this.name || this.name.trim().length === 0) {
            throw new Error('Gate name is required');
        }
        if (!this.accessCode || this.accessCode.trim().length === 0) {
            throw new Error('Access code is required');
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

    updateDetails(details: { name?: string; accessCode?: string }) {
        if (details.name) this.name = details.name;
        if (details.accessCode) this.accessCode = details.accessCode;
        this.updatedAt = new Date();
    }
}
