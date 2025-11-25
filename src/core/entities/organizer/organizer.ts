export class Organizer {
    constructor(
        readonly id: string,
        public email: string,
        public name: string,
        public role: 'owner' | 'admin' | 'staff' = 'staff',
        public isActive: boolean = true,
        public createdAt: Date = new Date(),
        public updatedAt?: Date
    ) {
        this.validateOrganizer();
    }

    private validateOrganizer() {
        if (!this.name || this.name.trim().length === 0) {
            throw new Error('Organizer name is required');
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
