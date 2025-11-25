import { Guest } from '../../core/entities/guests/guests';
import { IGuestRepository } from '../../core/repositories/IGuestRepository';

export class InMemoryGuestRepository implements IGuestRepository {
    private guests: Map<string, Guest> = new Map();

    async findById(id: string): Promise<Guest | null> {
        return this.guests.get(id) || null;
    }

    async findByEventId(eventId: string): Promise<Guest[]> {
        return Array.from(this.guests.values()).filter(
            guest => guest.eventId === eventId
        );
    }

    async findByEmail(email: string): Promise<Guest | null> {
        return Array.from(this.guests.values()).find(
            guest => guest.email === email
        ) || null;
    }

    async findAll(): Promise<Guest[]> {
        return Array.from(this.guests.values());
    }

    async save(guest: Guest): Promise<void> {
        this.guests.set(guest.id, guest);
    }

    async update(guest: Guest): Promise<void> {
        if (!this.guests.has(guest.id)) {
            throw new Error('Guest not found');
        }
        this.guests.set(guest.id, guest);
    }

    async delete(id: string): Promise<void> {
        if (!this.guests.has(id)) {
            throw new Error('Guest not found');
        }
        this.guests.delete(id);
    }
}
