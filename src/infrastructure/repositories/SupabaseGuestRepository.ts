import { SupabaseClient } from '@supabase/supabase-js';
import { Guest } from '../../core/entities/guest/guest';
import { IGuestRepository } from '../../core/repositories/IGuestRepository';

// Database row type
interface GuestRow {
    id: string;
    event_id: string;
    name: string;
    email: string;
    phone: string;
    rsvp_status: 'yes' | 'no' | 'pending';
    rsvp_at: string | null;
    checked_in: boolean;
    checked_out: boolean;
    checked_in_at: string | null;
    checked_out_at: string | null;
    qr_code: string | null;
    created_at: string;
    updated_at: string | null;
}

export class SupabaseGuestRepository implements IGuestRepository {
    constructor(private supabase: SupabaseClient) {}

    private rowToEntity(row: GuestRow): Guest {
        return new Guest(
            row.id,
            row.event_id,
            row.name,
            row.email,
            row.phone,
            row.rsvp_status,
            row.checked_in,
            row.checked_out,
            row.rsvp_at ? new Date(row.rsvp_at) : undefined,
            row.qr_code || undefined,
            row.checked_in_at ? new Date(row.checked_in_at) : undefined,
            row.checked_out_at ? new Date(row.checked_out_at) : undefined,
            new Date(row.created_at),
            row.updated_at ? new Date(row.updated_at) : undefined
        );
    }

    private entityToRow(guest: Guest): Omit<GuestRow, 'created_at' | 'updated_at'> {
        return {
            id: guest.id,
            event_id: guest.eventId,
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            rsvp_status: guest.rsvpStatus,
            rsvp_at: guest.rsvpAt ? guest.rsvpAt.toISOString() : null,
            checked_in: guest.checkedIn,
            checked_out: guest.checkedOut,
            checked_in_at: guest.checkedInAt ? guest.checkedInAt.toISOString() : null,
            checked_out_at: guest.checkedOutAt ? guest.checkedOutAt.toISOString() : null,
            qr_code: guest.qrCode || null,
        };
    }

    async findById(id: string): Promise<Guest | null> {
        const { data, error } = await this.supabase
            .from('guests')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find guest: ${error.message}`);
        }

        return data ? this.rowToEntity(data as GuestRow) : null;
    }

    async findByEventId(eventId: string): Promise<Guest[]> {
        const { data, error } = await this.supabase
            .from('guests')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to find guests by event: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as GuestRow)) : [];
    }

    async findByEmail(email: string): Promise<Guest | null> {
        const { data, error } = await this.supabase
            .from('guests')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find guest by email: ${error.message}`);
        }

        return data ? this.rowToEntity(data as GuestRow) : null;
    }

    async findAll(): Promise<Guest[]> {
        const { data, error } = await this.supabase
            .from('guests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch guests: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as GuestRow)) : [];
    }

    async save(guest: Guest): Promise<void> {
        const row = this.entityToRow(guest);

        const { error } = await this.supabase
            .from('guests')
            .insert({
                ...row,
                created_at: guest.createdAt.toISOString(),
                updated_at: guest.updatedAt?.toISOString() || null,
            });

        if (error) {
            throw new Error(`Failed to save guest: ${error.message}`);
        }
    }

    async update(guest: Guest): Promise<void> {
        const row = this.entityToRow(guest);

        const { error } = await this.supabase
            .from('guests')
            .update({
                ...row,
                updated_at: new Date().toISOString(),
            })
            .eq('id', guest.id);

        if (error) {
            throw new Error(`Failed to update guest: ${error.message}`);
        }
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('guests')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete guest: ${error.message}`);
        }
    }
}
