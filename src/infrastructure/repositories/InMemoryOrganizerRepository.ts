import { Organizer } from '../../core/entities/organizer/organizer';
import { IOrganizerRepository } from '../../core/repositories/IOrganizerRepository';

export class InMemoryOrganizerRepository implements IOrganizerRepository {
    private organizers: Map<string, Organizer> = new Map();

    async findById(id: string): Promise<Organizer | null> {
        return this.organizers.get(id) || null;
    }

    async findByEmail(email: string): Promise<Organizer | null> {
        return Array.from(this.organizers.values()).find(
            organizer => organizer.email === email
        ) || null;
    }

    async findAll(): Promise<Organizer[]> {
        return Array.from(this.organizers.values());
    }

    async save(organizer: Organizer): Promise<void> {
        this.organizers.set(organizer.id, organizer);
    }

    async update(organizer: Organizer): Promise<void> {
        if (!this.organizers.has(organizer.id)) {
            throw new Error('Organizer not found');
        }
        this.organizers.set(organizer.id, organizer);
    }

    async delete(id: string): Promise<void> {
        if (!this.organizers.has(id)) {
            throw new Error('Organizer not found');
        }
        this.organizers.delete(id);
    }
}
