import { SupabaseClient } from '@supabase/supabase-js';
import { Gate } from '../../core/entities/gate/Gate';
import { IGateRepository } from '../../core/repositories/IGateRepository';

// Database row type
interface GateRow {
    id: string;
    event_id: string;
    name: string;
    access_code: string;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export class SupabaseGateRepository implements IGateRepository {
    constructor(private supabase: SupabaseClient) {}

    private rowToEntity(row: GateRow): Gate {
        return new Gate(
            row.id,
            row.event_id,
            row.name,
            row.access_code,
            row.is_active,
            new Date(row.created_at),
            row.updated_at ? new Date(row.updated_at) : undefined
        );
    }

    private entityToRow(gate: Gate): Omit<GateRow, 'created_at' | 'updated_at'> {
        return {
            id: gate.id,
            event_id: gate.eventId,
            name: gate.name,
            access_code: gate.accessCode,
            is_active: gate.isActive,
        };
    }

    async findById(id: string): Promise<Gate | null> {
        const { data, error } = await this.supabase
            .from('gates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find gate: ${error.message}`);
        }

        return data ? this.rowToEntity(data as GateRow) : null;
    }

    async findByEventId(eventId: string): Promise<Gate[]> {
        const { data, error } = await this.supabase
            .from('gates')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to find gates by event: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as GateRow)) : [];
    }

    async findByAccessCode(accessCode: string): Promise<Gate | null> {
        const { data, error } = await this.supabase
            .from('gates')
            .select('*')
            .eq('access_code', accessCode)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find gate by access code: ${error.message}`);
        }

        return data ? this.rowToEntity(data as GateRow) : null;
    }

    async findAll(): Promise<Gate[]> {
        const { data, error } = await this.supabase
            .from('gates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch gates: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as GateRow)) : [];
    }

    async save(gate: Gate): Promise<void> {
        const row = this.entityToRow(gate);

        const { error } = await this.supabase
            .from('gates')
            .insert({
                ...row,
                created_at: gate.createdAt.toISOString(),
                updated_at: gate.updatedAt?.toISOString() || null,
            });

        if (error) {
            throw new Error(`Failed to save gate: ${error.message}`);
        }
    }

    async update(gate: Gate): Promise<void> {
        const row = this.entityToRow(gate);

        const { error } = await this.supabase
            .from('gates')
            .update({
                ...row,
                updated_at: new Date().toISOString(),
            })
            .eq('id', gate.id);

        if (error) {
            throw new Error(`Failed to update gate: ${error.message}`);
        }
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('gates')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete gate: ${error.message}`);
        }
    }
}
