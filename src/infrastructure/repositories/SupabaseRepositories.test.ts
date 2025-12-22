import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseOrganizerRepository } from './SupabaseOrganizerRepository';
import { SupabaseEventRepository } from './SupabaseEventRepository';
import { SupabaseGuestRepository } from './SupabaseGuestRepository';
import { SupabaseGateRepository } from './SupabaseGateRepository';
import { SupabaseScanRepository } from './SupabaseScanRepository';
import { Organizer } from '../../core/entities/organizer/organizer';
import { Event } from '../../core/entities/event/event';
import { Guest } from '../../core/entities/guest/guest';
import { Gate } from '../../core/entities/gate/Gate';
import { Scan } from '../../core/entities/scan/scan';

// These tests require a real Supabase instance with .env.local configured
// Tests will automatically skip if credentials are not available

const hasSupabaseCredentials = () => {
    return Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
};

describe.skipIf(!hasSupabaseCredentials())('Supabase Repositories Integration Tests', () => {
    let supabase: SupabaseClient;
    let organizerRepo: SupabaseOrganizerRepository;
    let eventRepo: SupabaseEventRepository;
    let guestRepo: SupabaseGuestRepository;
    let gateRepo: SupabaseGateRepository;
    let scanRepo: SupabaseScanRepository;

    // Test data IDs - using proper UUIDs
    const testOrganizerAuthId = crypto.randomUUID();
    const testOrganizerId = crypto.randomUUID();
    const testEventId = crypto.randomUUID();
    const testGuestId = crypto.randomUUID();
    const testGateId = crypto.randomUUID();
    const testScanId = crypto.randomUUID();

    beforeAll(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        supabase = createClient(supabaseUrl, supabaseKey);
        organizerRepo = new SupabaseOrganizerRepository(supabase);
        eventRepo = new SupabaseEventRepository(supabase);
        guestRepo = new SupabaseGuestRepository(supabase);
        gateRepo = new SupabaseGateRepository(supabase);
        scanRepo = new SupabaseScanRepository(supabase);
    });

    afterAll(async () => {
        // Cleanup test data
        try {
            await supabase.from('scans').delete().eq('id', testScanId);
            await supabase.from('gates').delete().eq('id', testGateId);
            await supabase.from('guests').delete().eq('id', testGuestId);
            await supabase.from('events').delete().eq('id', testEventId);
            await supabase.from('organizers').delete().eq('id', testOrganizerId);
        } catch (error) {
            console.warn('Cleanup error:', error);
        }
    });

    describe('SupabaseOrganizerRepository', () => {
        it('should save and find an organizer', async () => {
            const organizer = new Organizer(
                testOrganizerId,
                testOrganizerAuthId,
                'test@example.com',
                'Test Organizer',
                'owner',
                true
            );

            await organizerRepo.save(organizer);

            const found = await organizerRepo.findById(testOrganizerId);
            expect(found).not.toBeNull();
            expect(found?.id).toBe(testOrganizerId);
            expect(found?.email).toBe('test@example.com');
            expect(found?.name).toBe('Test Organizer');
        });

        it('should find organizer by email', async () => {
            const found = await organizerRepo.findByEmail('test@example.com');
            expect(found).not.toBeNull();
            expect(found?.id).toBe(testOrganizerId);
        });

        it('should update an organizer', async () => {
            const organizer = await organizerRepo.findById(testOrganizerId);
            expect(organizer).not.toBeNull();

            organizer!.updateDetails({ name: 'Updated Name' });
            await organizerRepo.update(organizer!);

            const updated = await organizerRepo.findById(testOrganizerId);
            expect(updated?.name).toBe('Updated Name');
        });
    });

    describe('SupabaseEventRepository', () => {
        it('should save and find an event', async () => {
            const event = new Event(
                testEventId,
                'Test Event',
                'A test event',
                testOrganizerId,
                'Test Venue',
                new Date('2025-12-31'),
                new Date('2025-12-25'),
                'draft'
            );

            await eventRepo.save(event);

            const found = await eventRepo.findById(testEventId);
            expect(found).not.toBeNull();
            expect(found?.title).toBe('Test Event');
            expect(found?.organizerId).toBe(testOrganizerId);
        });

        it('should find events by organizer', async () => {
            const events = await eventRepo.findByOrganizerId(testOrganizerId);
            expect(events.length).toBeGreaterThan(0);
            expect(events[0].organizerId).toBe(testOrganizerId);
        });
    });

    describe('SupabaseGuestRepository', () => {
        it('should save and find a guest', async () => {
            const guest = new Guest(
                testGuestId,
                testEventId,
                'Test Guest',
                'guest@example.com',
                '+1234567890',
                'pending',
                false,
                false
            );

            await guestRepo.save(guest);

            const found = await guestRepo.findById(testGuestId);
            expect(found).not.toBeNull();
            expect(found?.name).toBe('Test Guest');
            expect(found?.email).toBe('guest@example.com');
        });

        it('should find guests by event', async () => {
            const guests = await guestRepo.findByEventId(testEventId);
            expect(guests.length).toBeGreaterThan(0);
            expect(guests[0].eventId).toBe(testEventId);
        });
    });

    describe('SupabaseGateRepository', () => {
        it('should save and find a gate', async () => {
            const gate = new Gate(
                testGateId,
                testEventId,
                'Main Entrance',
                'ACCESS123',
                true
            );

            await gateRepo.save(gate);

            const found = await gateRepo.findById(testGateId);
            expect(found).not.toBeNull();
            expect(found?.name).toBe('Main Entrance');
            expect(found?.accessCode).toBe('ACCESS123');
        });

        it('should find gate by access code', async () => {
            const found = await gateRepo.findByAccessCode('ACCESS123');
            expect(found).not.toBeNull();
            expect(found?.id).toBe(testGateId);
        });
    });

    describe('SupabaseScanRepository', () => {
        it('should save and find a scan', async () => {
            const scan = new Scan(
                testScanId,
                testGuestId,
                testGateId,
                testEventId,
                new Date(),
                'success',
                'QR-CODE-DATA'
            );

            await scanRepo.save(scan);

            const found = await scanRepo.findById(testScanId);
            expect(found).not.toBeNull();
            expect(found?.result).toBe('success');
            expect(found?.guestId).toBe(testGuestId);
        });

        it('should find scans by guest', async () => {
            const scans = await scanRepo.findByGuestId(testGuestId);
            expect(scans.length).toBeGreaterThan(0);
            expect(scans[0].guestId).toBe(testGuestId);
        });
    });
});
