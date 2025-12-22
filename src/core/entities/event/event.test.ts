import { describe, it, expect } from 'vitest';
import { Event } from './event';

describe('Event Entity', () => {
    describe('Constructor and Validation', () => {
        it('should create a valid event', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Tech Conference 2025',
                'Annual tech conference',
                'organizer-1',
                'Convention Center',
                endDate,
                startDate,
                'draft'
            );

            expect(event.id).toBe('1');
            expect(event.title).toBe('Tech Conference 2025');
            expect(event.description).toBe('Annual tech conference');
            expect(event.organizerId).toBe('organizer-1');
            expect(event.venue).toBe('Convention Center');
            expect(event.status).toBe('draft');
        });

        it('should throw error for empty title', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            expect(() => {
                new Event(
                    '1',
                    '',
                    'Description',
                    'organizer-1',
                    'Venue',
                    endDate,
                    startDate,
                    'draft'
                );
            }).toThrow('Event Title Required');
        });

        it('should allow null description', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Event',
                null,
                'organizer-1',
                'Venue',
                endDate,
                startDate,
                'draft'
            );

            expect(event.description).toBeNull();
        });
    });

    describe('Event Publishing', () => {
        it('should publish a draft event successfully', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Event',
                'Description',
                'organizer-1',
                'Venue',
                endDate,
                startDate,
                'draft'
            );

            event.publishEvent();

            expect(event.status).toBe('published');
            expect(event.publishedAt).toBeInstanceOf(Date);
        });

        it('should throw error when publishing already published event', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Event',
                'Description',
                'organizer-1',
                'Venue',
                endDate,
                startDate,
                'published'
            );

            expect(() => {
                event.publishEvent();
            }).toThrow('Already Published');
        });

        it('should throw error when publishing without venue', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Event',
                'Description',
                'organizer-1',
                'Test Venue',
                endDate,
                startDate,
                'draft'
            );

            // Clear venue after construction to test publish validation
            event.venue = '';

            expect(() => {
                event.publishEvent();
            }).toThrow('Missing venue');
        });

        it('should throw error when publishing without dates', () => {
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Event',
                'Description',
                'organizer-1',
                'Venue',
                endDate,
                undefined,
                'draft'
            );

            expect(() => {
                event.publishEvent();
            }).toThrow('Missing start date');
        });
    });

    describe('Event Cancellation', () => {
        it('should cancel an event successfully', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Event',
                'Description',
                'organizer-1',
                'Venue',
                endDate,
                startDate,
                'published'
            );

            event.cancelEvent('Venue unavailable');

            expect(event.status).toBe('cancelled');
            expect(event.updatedAt).toBeInstanceOf(Date);
        });

        it('should throw error when cancelling already cancelled event', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Event',
                'Description',
                'organizer-1',
                'Venue',
                endDate,
                startDate,
                'cancelled'
            );

            expect(() => {
                event.cancelEvent();
            }).toThrow('Already Cancelled');
        });
    });

    describe('Event Details Update', () => {
        it('should update event title', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Old Title',
                'Description',
                'organizer-1',
                'Venue',
                endDate,
                startDate,
                'draft'
            );

            event.updateDetails({ title: 'New Title' });

            expect(event.title).toBe('New Title');
            expect(event.updatedAt).toBeInstanceOf(Date);
        });

        it('should update multiple fields', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');
            const newStartDate = new Date('2025-02-01');
            const newEndDate = new Date('2025-02-02');

            const event = new Event(
                '1',
                'Old Title',
                'Old Description',
                'organizer-1',
                'Old Venue',
                endDate,
                startDate,
                'draft'
            );

            event.updateDetails({
                title: 'New Title',
                description: 'New Description',
                venue: 'New Venue',
                startDate: newStartDate,
                endDate: newEndDate
            });

            expect(event.title).toBe('New Title');
            expect(event.description).toBe('New Description');
            expect(event.venue).toBe('New Venue');
            expect(event.startDate).toBe(newStartDate);
            expect(event.endDate).toBe(newEndDate);
        });

        it('should allow setting description to null', () => {
            const startDate = new Date('2025-01-15');
            const endDate = new Date('2025-01-16');

            const event = new Event(
                '1',
                'Title',
                'Description',
                'organizer-1',
                'Venue',
                endDate,
                startDate,
                'draft'
            );

            event.updateDetails({ description: null });

            expect(event.description).toBeNull();
        });
    });
});
