import { Scan } from '../entities/scan/scan';

export interface IScanRepository {
    findById(id: string): Promise<Scan | null>;
    findByEventId(eventId: string): Promise<Scan[]>;
    findByGuestId(guestId: string): Promise<Scan[]>;
    findByGateId(gateId: string): Promise<Scan[]>;
    findAll(): Promise<Scan[]>;
    save(scan: Scan): Promise<void>;
}
