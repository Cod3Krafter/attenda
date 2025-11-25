import { Gate } from '../../core/entities/gate/gate';
import { IGateRepository } from '../../core/repositories/IGateRepository';

export class InMemoryGateRepository implements IGateRepository {
    private gates: Map<string, Gate> = new Map();

    async findById(id: string): Promise<Gate | null> {
        return this.gates.get(id) || null;
    }

    async findByEventId(eventId: string): Promise<Gate[]> {
        return Array.from(this.gates.values()).filter(
            gate => gate.eventId === eventId
        );
    }

    async findByAccessCode(accessCode: string): Promise<Gate | null> {
        return Array.from(this.gates.values()).find(
            gate => gate.accessCode === accessCode
        ) || null;
    }

    async findAll(): Promise<Gate[]> {
        return Array.from(this.gates.values());
    }

    async save(gate: Gate): Promise<void> {
        this.gates.set(gate.id, gate);
    }

    async update(gate: Gate): Promise<void> {
        if (!this.gates.has(gate.id)) {
            throw new Error('Gate not found');
        }
        this.gates.set(gate.id, gate);
    }

    async delete(id: string): Promise<void> {
        if (!this.gates.has(id)) {
            throw new Error('Gate not found');
        }
        this.gates.delete(id);
    }
}
