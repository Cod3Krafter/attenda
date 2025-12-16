import { Guest } from '../entities/guest/guest';

export interface IGuestRepository {
    findById(id: string): Promise<Guest | null>;
    findByEventId(eventId: string): Promise<Guest[]>;
    findByEmail(email: string): Promise<Guest | null>;
    findAll(): Promise<Guest[]>;
    save(guest: Guest): Promise<void>;
    update(guest: Guest): Promise<void>;
    delete(id: string): Promise<void>;
}
