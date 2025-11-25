import { Scan } from '../../core/entities/scan/scan';
import { IScanRepository } from '../../core/repositories/IScanRepository';

export class InMemoryScanRepository implements IScanRepository {
    private scans: Map<string, Scan> = new Map();

    async findById(id: string): Promise<Scan | null> {
        return this.scans.get(id) || null;
    }

    async findByEventId(eventId: string): Promise<Scan[]> {
        return Array.from(this.scans.values()).filter(
            scan => scan.eventId === eventId
        );
    }

    async findByGuestId(guestId: string): Promise<Scan[]> {
        return Array.from(this.scans.values()).filter(
            scan => scan.guestId === guestId
        );
    }

    async findByGateId(gateId: string): Promise<Scan[]> {
        return Array.from(this.scans.values()).filter(
            scan => scan.gateId === gateId
        );
    }

    async findAll(): Promise<Scan[]> {
        return Array.from(this.scans.values());
    }

    async save(scan: Scan): Promise<void> {
        this.scans.set(scan.id, scan);
    }
}
