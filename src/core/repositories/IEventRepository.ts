import { Event } from '../entities/event/event';

export interface IEventRepository {
    findById(id: string): Promise<Event | null>;
    findByOrganizerId(organizerId: string): Promise<Event[]>;
    findAll(): Promise<Event[]>;
    save(event: Event): Promise<void>;
    update(event: Event): Promise<void>;
    delete(id: string): Promise<void>;
}
