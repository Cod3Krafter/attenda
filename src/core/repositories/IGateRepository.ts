import { Gate } from '../entities/gate/gate';

export interface IGateRepository {
    findById(id: string): Promise<Gate | null>;
    findByEventId(eventId: string): Promise<Gate[]>;
    findByAccessCode(accessCode: string): Promise<Gate | null>;
    findAll(): Promise<Gate[]>;
    save(gate: Gate): Promise<void>;
    update(gate: Gate): Promise<void>;
    delete(id: string): Promise<void>;
}
