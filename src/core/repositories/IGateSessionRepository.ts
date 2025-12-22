import { GateSession } from '../entities/gateSession/GateSession';

export interface IGateSessionRepository {
    findById(id: string): Promise<GateSession | null>;
    findByGateId(gateId: string): Promise<GateSession | null>;
    save(session: GateSession): Promise<void>;
    delete(id: string): Promise<void>;
    deleteByGateId(gateId: string): Promise<void>;
    deleteExpired(): Promise<number>; // Returns count of deleted sessions
}
