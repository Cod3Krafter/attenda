import { SupabaseClient } from '@supabase/supabase-js';
import { Organizer } from '../../core/entities/organizer/organizer';
import { IOrganizerRepository } from '../../core/repositories/IOrganizerRepository';

// Database row type
interface OrganizerRow {
    id: string;
    auth_user_id: string;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'staff';
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export class SupabaseOrganizerRepository implements IOrganizerRepository {
    constructor(private supabase: SupabaseClient) {}

    private rowToEntity(row: OrganizerRow): Organizer {
        return new Organizer(
            row.id,
            row.auth_user_id,
            row.email,
            row.name,
            row.role,
            row.is_active,
            new Date(row.created_at),
            row.updated_at ? new Date(row.updated_at) : undefined
        );
    }

    private entityToRow(organizer: Organizer): Omit<OrganizerRow, 'created_at' | 'updated_at'> {
        return {
            id: organizer.id,
            auth_user_id: organizer.authUserId,
            email: organizer.email,
            name: organizer.name,
            role: organizer.role,
            is_active: organizer.isActive,
        };
    }

    async findById(id: string): Promise<Organizer | null> {
        const { data, error } = await this.supabase
            .from('organizers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find organizer: ${error.message}`);
        }

        return data ? this.rowToEntity(data as OrganizerRow) : null;
    }

    async findByEmail(email: string): Promise<Organizer | null> {
        const { data, error } = await this.supabase
            .from('organizers')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find organizer by email: ${error.message}`);
        }

        return data ? this.rowToEntity(data as OrganizerRow) : null;
    }

    async findAll(): Promise<Organizer[]> {
        const { data, error } = await this.supabase
            .from('organizers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch organizers: ${error.message}`);
        }

        return data ? data.map(row => this.rowToEntity(row as OrganizerRow)) : [];
    }

    async save(organizer: Organizer): Promise<void> {
        const row = this.entityToRow(organizer);

        const { error } = await this.supabase
            .from('organizers')
            .insert({
                ...row,
                created_at: organizer.createdAt.toISOString(),
                updated_at: organizer.updatedAt?.toISOString() || null,
            });

        if (error) {
            throw new Error(`Failed to save organizer: ${error.message}`);
        }
    }

    async update(organizer: Organizer): Promise<void> {
        const row = this.entityToRow(organizer);

        const { error } = await this.supabase
            .from('organizers')
            .update({
                ...row,
                updated_at: new Date().toISOString(),
            })
            .eq('id', organizer.id);

        if (error) {
            throw new Error(`Failed to update organizer: ${error.message}`);
        }
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('organizers')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete organizer: ${error.message}`);
        }
    }

    // Additional helper method to find by auth_user_id
    async findByAuthUserId(authUserId: string): Promise<Organizer | null> {
        const { data, error } = await this.supabase
            .from('organizers')
            .select('*')
            .eq('auth_user_id', authUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find organizer by auth_user_id: ${error.message}`);
        }

        return data ? this.rowToEntity(data as OrganizerRow) : null;
    }
}
