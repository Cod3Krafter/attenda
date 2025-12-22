import { SupabaseClient } from '@supabase/supabase-js';
import { GateSession } from '../../core/entities/gateSession/GateSession';
import { IGateSessionRepository } from '../../core/repositories/IGateSessionRepository';

interface GateSessionRow {
    id: string;
    gate_id: string;
    event_id: string;
    operator_id: string | null; // Nullable for anonymous operators
    token_hash: string;
    expires_at: string;
    created_at: string;
}

export class SupabaseGateSessionRepository implements IGateSessionRepository {
    constructor(private supabase: SupabaseClient) {}

    private rowToEntity(row: GateSessionRow): GateSession {
        return new GateSession(
            row.id,
            row.gate_id,
            row.event_id,
            row.operator_id,
            row.token_hash,
            new Date(row.expires_at),
            new Date(row.created_at)
        );
    }

    async findById(id: string): Promise<GateSession | null> {
        const { data, error } = await this.supabase
            .from('gate_sessions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find gate session: ${error.message}`);
        }

        return data ? this.rowToEntity(data) : null;
    }

    async findByGateId(gateId: string): Promise<GateSession | null> {
        const { data, error } = await this.supabase
            .from('gate_sessions')
            .select('*')
            .eq('gate_id', gateId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find gate session: ${error.message}`);
        }

        return data ? this.rowToEntity(data) : null;
    }

    async save(session: GateSession): Promise<void> {
        const row: Omit<GateSessionRow, 'id' | 'created_at'> & { id?: string; created_at?: string } = {
            id: session.id,
            gate_id: session.gateId,
            event_id: session.eventId,
            operator_id: session.operatorId,
            token_hash: session.tokenHash,
            expires_at: session.expiresAt.toISOString(),
            created_at: session.createdAt.toISOString(),
        };

        const { error } = await this.supabase
            .from('gate_sessions')
            .upsert(row);

        if (error) {
            throw new Error(`Failed to save gate session: ${error.message}`);
        }
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('gate_sessions')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete gate session: ${error.message}`);
        }
    }

    async deleteByGateId(gateId: string): Promise<void> {
        const { error } = await this.supabase
            .from('gate_sessions')
            .delete()
            .eq('gate_id', gateId);

        if (error) {
            throw new Error(`Failed to delete gate session: ${error.message}`);
        }
    }

    async deleteExpired(): Promise<number> {
        const { data, error } = await this.supabase
            .from('gate_sessions')
            .delete()
            .lt('expires_at', new Date().toISOString())
            .select('id');

        if (error) {
            throw new Error(`Failed to delete expired sessions: ${error.message}`);
        }

        return data?.length || 0;
    }
}
