import { describe, it, expect } from 'vitest';
import { Guest } from './guest';

describe('Guest Entity', () => {
    describe('Constructor and Validation', () => {
        it('should create a valid guest', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'pending',
                false,
                false
            );

            expect(guest.id).toBe('1');
            expect(guest.name).toBe('John Doe');
            expect(guest.email).toBe('john@example.com');
            expect(guest.rsvpStatus).toBe('pending');
            expect(guest.checkedIn).toBe(false);
        });

        it('should throw error for empty name', () => {
            expect(() => {
                new Guest(
                    '1',
                    'event-1',
                    '',
                    'john@example.com',
                    '+1234567890',
                    'pending',
                    false,
                    false
                );
            }).toThrow('Guest name is required');
        });

        it('should throw error for invalid email', () => {
            expect(() => {
                new Guest(
                    '1',
                    'event-1',
                    'John Doe',
                    'invalid-email',
                    '+1234567890',
                    'pending',
                    false,
                    false
                );
            }).toThrow('Invalid email format');
        });
    });

    describe('RSVP Management', () => {
        it('should update RSVP status to yes', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'pending',
                false,
                false
            );

            guest.updateRSVP('yes');

            expect(guest.rsvpStatus).toBe('yes');
            expect(guest.rsvpAt).toBeInstanceOf(Date);
        });

        it('should update RSVP status to no', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'pending',
                false,
                false
            );

            guest.updateRSVP('no');

            expect(guest.rsvpStatus).toBe('no');
            expect(guest.rsvpAt).toBeInstanceOf(Date);
        });

        it('should throw error for invalid RSVP status', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'pending',
                false,
                false
            );

            expect(() => {
                guest.updateRSVP('invalid' as any);
            }).toThrow('Invalid RSVP');
        });
    });

    describe('Check-in Management', () => {
        it('should check in a guest successfully', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'yes',
                false,
                false
            );

            guest.checkIn();

            expect(guest.checkedIn).toBe(true);
            expect(guest.checkedInAt).toBeInstanceOf(Date);
        });

        it('should throw error when checking in already checked-in guest', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'yes',
                true,
                false
            );

            expect(() => {
                guest.checkIn();
            }).toThrow('Guest already checked in');
        });
    });

    describe('Check-out Management', () => {
        it('should check out a checked-in guest successfully', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'yes',
                true,
                false
            );

            guest.checkOut();

            expect(guest.checkedIn).toBe(false);
            expect(guest.checkedOutAt).toBeInstanceOf(Date);
        });

        it('should throw error when checking out guest who is not checked in', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'yes',
                false,
                false
            );

            expect(() => {
                guest.checkOut();
            }).toThrow('Guest not checked in yet');
        });

        it('should throw error when checking out already checked-out guest', () => {
            const guest = new Guest(
                '1',
                'event-1',
                'John Doe',
                'john@example.com',
                '+1234567890',
                'yes',
                false,
                true
            );

            expect(() => {
                guest.checkOut();
            }).toThrow('Guest already checked out');
        });
    });
});
