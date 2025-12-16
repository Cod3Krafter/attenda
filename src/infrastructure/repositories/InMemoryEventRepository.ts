import { Event } from '../../core/entities/event/event';
import { IEventRepository } from '../../core/repositories/IEventRepository';

export class InMemoryEventRepository implements IEventRepository {
    private events: Map<string, Event> = new Map();

    async findById(id: string): Promise<Event | null> {
        return this.events.get(id) || null;
    }

    async findByOrganizerId(organizerId: string): Promise<Event[]> {
        return Array.from(this.events.values()).filter(
            event => event.organizerId === organizerId
        );
    }

    async findAll(): Promise<Event[]> {
        return Array.from(this.events.values());
    }

    async save(event: Event): Promise<void> {
        this.events.set(event.id, event);
    }

    async update(event: Event): Promise<void> {
        if (!this.events.has(event.id)) {
            throw new Error('Event not found');
        }
        this.events.set(event.id, event);
    }

    async delete(id: string): Promise<void> {
        if (!this.events.has(id)) {
            throw new Error('Event not found');
        }
        this.events.delete(id);
    }
}
