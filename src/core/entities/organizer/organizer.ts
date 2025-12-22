import { sanitizeText, sanitizeEmail, isValidLength } from '../../../lib/sanitize';

export class Organizer {
    constructor(
        readonly id: string,
        readonly authUserId: string, // Supabase Auth user ID
        public email: string,
        public name: string,
        public role: 'owner' | 'admin' | 'staff' = 'staff',
        public isActive: boolean = true,
        public createdAt: Date = new Date(),
        public updatedAt?: Date
    ) {
        // Sanitize inputs
        this.email = sanitizeEmail(email);
        this.name = sanitizeText(name);

        this.validateOrganizer();
    }

    private validateOrganizer() {
        if (!this.authUserId || this.authUserId.trim().length === 0) {
            throw new Error('Auth user ID is required');
        }
        if (!this.name || this.name.trim().length === 0) {
            throw new Error('Organizer name is required');
        }
        if (!isValidLength(this.name, 1, 100)) {
            throw new Error('Organizer name must be between 1 and 100 characters');
        }
        if (!this.isValidEmail(this.email)) {
            throw new Error('Invalid email format');
        }
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    updateDetails(details: { name?: string; email?: string; role?: 'owner' | 'admin' | 'staff' }) {
        if (details.name) this.name = details.name;
        if (details.email) {
            if (!this.isValidEmail(details.email)) {
                throw new Error('Invalid email format');
            }
            this.email = details.email;
        }
        if (details.role) this.role = details.role;
        this.updatedAt = new Date();
    }

    deactivate() {
        if (!this.isActive) throw new Error('Organizer is already inactive');
        this.isActive = false;
        this.updatedAt = new Date();
    }

    activate() {
        if (this.isActive) throw new Error('Organizer is already active');
        this.isActive = true;
        this.updatedAt = new Date();
    }
}
