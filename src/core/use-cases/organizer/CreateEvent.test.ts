import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateEventUseCase, IAccessCodeGenerator } from './CreateEvent';
import { IEventRepository } from '../../repositories/IEventRepository';
import { IGateRepository } from '../../repositories/IGateRepository';
import { IOrganizerRepository } from '../../repositories/IOrganizerRepository';
import { Event } from '../../entities/event/event';
import { Gate } from '../../entities/gate/gate';
import { Organizer } from '../../entities/organizer/organizer';

describe('CreateEventUseCase', () => {
    let createEventUseCase: CreateEventUseCase;
    let mockEventRepository: IEventRepository;
    let mockGateRepository: IGateRepository;
    let mockOrganizerRepository: IOrganizerRepository;
    let mockAccessCodeGenerator: IAccessCodeGenerator;

    beforeEach(() => {
        // Create mock repositories
        mockEventRepository = {
            findById: vi.fn(),
            findByOrganizerId: vi.fn(),
            findAll: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        mockGateRepository = {
            findById: vi.fn(),
            findByEventId: vi.fn(),
            findByAccessCode: vi.fn(),
            findAll: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        mockOrganizerRepository = {
            findById: vi.fn(),
            findByEmail: vi.fn(),
            findAll: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        mockAccessCodeGenerator = {
            generate: vi.fn().mockReturnValue('ABC123'),
        };

        createEventUseCase = new CreateEventUseCase(
            mockEventRepository,
            mockGateRepository,
            mockOrganizerRepository,
            mockAccessCodeGenerator
        );
    });

    describe('Successful Event Creation', () => {
        it('should create event with gates successfully', async () => {
            const organizerId = 'organizer-1';
            const mockOrganizer = new Organizer(
                organizerId,
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findById).mockResolvedValue(mockOrganizer);
            vi.mocked(mockEventRepository.save).mockResolvedValue();
            vi.mocked(mockGateRepository.save).mockResolvedValue();

            const result = await createEventUseCase.execute({
                organizerId,
                title: 'Tech Conference',
                description: 'Annual event',
                venue: 'Convention Center',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-16'),
                gateNames: ['Main Entrance', 'VIP Entrance'],
            });

            expect(result.success).toBe(true);
            expect(result.event).toBeDefined();
            expect(result.event?.title).toBe('Tech Conference');
            expect(result.event?.status).toBe('draft');
            expect(result.gates).toHaveLength(2);
            expect(result.gates?.[0].name).toBe('Main Entrance');
            expect(result.gates?.[1].name).toBe('VIP Entrance');
            expect(mockEventRepository.save).toHaveBeenCalledTimes(1);
            expect(mockGateRepository.save).toHaveBeenCalledTimes(2);
        });

        it('should create event without gates', async () => {
            const organizerId = 'organizer-1';
            const mockOrganizer = new Organizer(
                organizerId,
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findById).mockResolvedValue(mockOrganizer);
            vi.mocked(mockEventRepository.save).mockResolvedValue();

            const result = await createEventUseCase.execute({
                organizerId,
                title: 'Small Meetup',
                description: 'Casual gathering',
                venue: 'Coffee Shop',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-15'),
                gateNames: [],
            });

            expect(result.success).toBe(true);
            expect(result.gates).toHaveLength(0);
            expect(mockGateRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('Validation Failures', () => {
        it('should fail if organizer not found', async () => {
            vi.mocked(mockOrganizerRepository.findById).mockResolvedValue(null);

            const result = await createEventUseCase.execute({
                organizerId: 'non-existent',
                title: 'Event',
                venue: 'Venue',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-16'),
                gateNames: [],
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Organizer not found');
            expect(mockEventRepository.save).not.toHaveBeenCalled();
        });

        it('should fail if organizer is inactive', async () => {
            const organizerId = 'organizer-1';
            const mockOrganizer = new Organizer(
                organizerId,
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                false // inactive
            );

            vi.mocked(mockOrganizerRepository.findById).mockResolvedValue(mockOrganizer);

            const result = await createEventUseCase.execute({
                organizerId,
                title: 'Event',
                venue: 'Venue',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-16'),
                gateNames: [],
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Organizer account is inactive');
            expect(mockEventRepository.save).not.toHaveBeenCalled();
        });

        it('should fail if end date is before start date', async () => {
            const organizerId = 'organizer-1';
            const mockOrganizer = new Organizer(
                organizerId,
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findById).mockResolvedValue(mockOrganizer);

            const result = await createEventUseCase.execute({
                organizerId,
                title: 'Event',
                venue: 'Venue',
                startDate: new Date('2025-01-16'),
                endDate: new Date('2025-01-15'), // before start date
                gateNames: [],
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('End date cannot be before start date');
            expect(mockEventRepository.save).not.toHaveBeenCalled();
        });

        it('should fail if event validation fails', async () => {
            const organizerId = 'organizer-1';
            const mockOrganizer = new Organizer(
                organizerId,
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findById).mockResolvedValue(mockOrganizer);

            const result = await createEventUseCase.execute({
                organizerId,
                title: '', // empty title
                venue: 'Venue',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-16'),
                gateNames: [],
            });

            expect(result.success).toBe(false);
            expect(result.message).toContain('Event Title Required');
            expect(mockEventRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('Repository Failures', () => {
        it('should handle event save failure', async () => {
            const organizerId = 'organizer-1';
            const mockOrganizer = new Organizer(
                organizerId,
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findById).mockResolvedValue(mockOrganizer);
            vi.mocked(mockEventRepository.save).mockRejectedValue(new Error('Database error'));

            const result = await createEventUseCase.execute({
                organizerId,
                title: 'Event',
                venue: 'Venue',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-16'),
                gateNames: [],
            });

            expect(result.success).toBe(false);
            expect(result.message).toContain('Failed to save event');
        });

        it('should handle gate save failure', async () => {
            const organizerId = 'organizer-1';
            const mockOrganizer = new Organizer(
                organizerId,
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findById).mockResolvedValue(mockOrganizer);
            vi.mocked(mockEventRepository.save).mockResolvedValue();
            vi.mocked(mockGateRepository.save).mockRejectedValue(new Error('Gate save failed'));

            const result = await createEventUseCase.execute({
                organizerId,
                title: 'Event',
                venue: 'Venue',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-16'),
                gateNames: ['Gate 1'],
            });

            expect(result.success).toBe(false);
            expect(result.message).toContain('Failed to save event');
        });
    });
});
