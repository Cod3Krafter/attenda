import { SupabaseClient } from '@supabase/supabase-js';
import { Event } from '../../core/entities/event/event';
import { IEventRepository } from '../../core/repositories/IEventRepository';

// Database row type
interface EventRow {
    id: string;
    organizer_id: string;
    title: string;
    description: string | null;
    venue: string;
    start_date: string | null;
    end_date: string;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    published_at: string | null;
    created_at: string;
    updated_at: string | null;
}

export class SupabaseEventRepository implements IEventRepository {
    constructor(private supabase: SupabaseClient) {}

    private rowToEntity(row: EventRow): Event {
        return new Event(
            row.id,
            row.title,
            row.description,
            row.organizer_id,
            row.venue,
            new Date(row.end_date),
            row.start_date ? new Date(row.start_date) : undefined,
            row.status,
            row.published_at ? new Date(row.published_at) : undefined,
            new Date(row.created_at),
            row.updated_at ? new Date(row.updated_at) : undefined
        );
    }

    private entityToRow(event: Event): Omit<EventRow, 'created_at' | 'updated_at'> {
        return {
            id: event.id,
            organizer_id: event.organizerId,
            title: event.title,
            description: event.description,
            venue: event.venue,
            start_date: event.startDate ? event.startDate.toISOString() : null,
            end_date: event.endDate.toISOString(),
            status: event.status,
            published_at: event.publishedAt ? event.publishedAt.toISOString() : null,
        };
    }

    async findById(id: string): Promise<Event | null> {
        const { data, error } = await this.supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find event: ${error.message}`);
        }

        return data ? this.rowToEntity(data as EventRow) : null;
    }

    async findByOrganizerId(organizerId: string): Promise<Event[]> {
        const { data, error } = await this.supabase
            .from('events')
            .select('*')
            .eq('organizer_id', organizerId)
            .order('start_date', { ascending: false });

        if (error) {
            throw new Error(`Failed to find events by organizer: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as EventRow)) : [];
    }

    async findAll(): Promise<Event[]> {
        const { data, error } = await this.supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch events: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as EventRow)) : [];
    }

    async save(event: Event): Promise<void> {
        const row = this.entityToRow(event);

        const { error } = await this.supabase
            .from('events')
            .insert({
                ...row,
                created_at: event.createdAt.toISOString(),
                updated_at: event.updatedAt?.toISOString() || null,
            });

        if (error) {
            throw new Error(`Failed to save event: ${error.message}`);
        }
    }

    async update(event: Event): Promise<void> {
        const row = this.entityToRow(event);

        const { error } = await this.supabase
            .from('events')
            .update({
                ...row,
                updated_at: new Date().toISOString(),
            })
            .eq('id', event.id);

        if (error) {
            throw new Error(`Failed to update event: ${error.message}`);
        }
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete event: ${error.message}`);
        }
    }
}
