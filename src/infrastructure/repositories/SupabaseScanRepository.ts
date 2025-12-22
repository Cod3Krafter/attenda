import { SupabaseClient } from '@supabase/supabase-js';
import { Scan } from '../../core/entities/scan/scan';
import { IScanRepository } from '../../core/repositories/IScanRepository';

// Database row type
interface ScanRow {
    id: string;
    guest_id: string;
    gate_id: string;
    event_id: string;
    timestamp: string;
    result: 'success' | 'denied' | 'invalid';
    scan_data: string | null;
    created_at: string;
}

export class SupabaseScanRepository implements IScanRepository {
    constructor(private supabase: SupabaseClient) {}

    private rowToEntity(row: ScanRow): Scan {
        return new Scan(
            row.id,
            row.guest_id,
            row.gate_id,
            row.event_id,
            new Date(row.timestamp),
            row.result,
            row.scan_data || undefined,
            new Date(row.created_at)
        );
    }

    private entityToRow(scan: Scan): Omit<ScanRow, 'created_at'> {
        return {
            id: scan.id,
            guest_id: scan.guestId,
            gate_id: scan.gateId,
            event_id: scan.eventId,
            timestamp: scan.timestamp.toISOString(),
            result: scan.result,
            scan_data: scan.scanData || null,
        };
    }

    async findById(id: string): Promise<Scan | null> {
        const { data, error } = await this.supabase
            .from('scans')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find scan: ${error.message}`);
        }

        return data ? this.rowToEntity(data as ScanRow) : null;
    }

    async findByEventId(eventId: string): Promise<Scan[]> {
        const { data, error } = await this.supabase
            .from('scans')
            .select('*')
            .eq('event_id', eventId)
            .order('timestamp', { ascending: false });

        if (error) {
            throw new Error(`Failed to find scans by event: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as ScanRow)) : [];
    }

    async findByGuestId(guestId: string): Promise<Scan[]> {
        const { data, error } = await this.supabase
            .from('scans')
            .select('*')
            .eq('guest_id', guestId)
            .order('timestamp', { ascending: false });

        if (error) {
            throw new Error(`Failed to find scans by guest: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as ScanRow)) : [];
    }

    async findByGateId(gateId: string): Promise<Scan[]> {
        const { data, error } = await this.supabase
            .from('scans')
            .select('*')
            .eq('gate_id', gateId)
            .order('timestamp', { ascending: false });

        if (error) {
            throw new Error(`Failed to find scans by gate: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as ScanRow)) : [];
    }

    async findAll(): Promise<Scan[]> {
        const { data, error } = await this.supabase
            .from('scans')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch scans: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as ScanRow)) : [];
    }

    async save(scan: Scan): Promise<void> {
        const row = this.entityToRow(scan);

        const { error } = await this.supabase
            .from('scans')
            .insert({
                ...row,
                created_at: scan.createdAt.toISOString(),
            });

        if (error) {
            throw new Error(`Failed to save scan: ${error.message}`);
        }
    }
}
