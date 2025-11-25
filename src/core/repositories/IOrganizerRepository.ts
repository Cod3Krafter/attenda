import { Organizer } from '../entities/organizer/organizer';

export interface IOrganizerRepository {
    findById(id: string): Promise<Organizer | null>;
    findByEmail(email: string): Promise<Organizer | null>;
    findAll(): Promise<Organizer[]>;
    save(organizer: Organizer): Promise<void>;
    update(organizer: Organizer): Promise<void>;
    delete(id: string): Promise<void>;
}
