import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticateOrganizerUseCase, IPasswordService } from './AuthenticateOrganizer';
import { IOrganizerRepository } from '../../repositories/IOrganizerRepository';
import { Organizer } from '../../entities/organizer/organizer';

describe('AuthenticateOrganizerUseCase', () => {
    let authenticateUseCase: AuthenticateOrganizerUseCase;
    let mockOrganizerRepository: IOrganizerRepository;
    let mockPasswordService: IPasswordService;

    beforeEach(() => {
        mockOrganizerRepository = {
            findById: vi.fn(),
            findByEmail: vi.fn(),
            findAll: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        mockPasswordService = {
            verify: vi.fn(),
        };

        authenticateUseCase = new AuthenticateOrganizerUseCase(
            mockOrganizerRepository,
            mockPasswordService
        );
    });

    describe('Successful Authentication', () => {
        it('should authenticate organizer with valid credentials', async () => {
            const mockOrganizer = new Organizer(
                '1',
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findByEmail).mockResolvedValue(mockOrganizer);
            vi.mocked(mockPasswordService.verify).mockResolvedValue(true);

            const result = await authenticateUseCase.execute({
                email: 'john@example.com',
                password: 'password123',
            });

            expect(result.success).toBe(true);
            expect(result.organizer).toBeDefined();
            expect(result.organizer?.email).toBe('john@example.com');
            expect(result.message).toBe('Authentication successful');
            expect(mockOrganizerRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
        });
    });

    describe('Validation Failures', () => {
        it('should fail if email is not provided', async () => {
            const result = await authenticateUseCase.execute({
                email: '',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Email and password are required');
            expect(mockOrganizerRepository.findByEmail).not.toHaveBeenCalled();
        });

        it('should fail if password is not provided', async () => {
            const result = await authenticateUseCase.execute({
                email: 'john@example.com',
                password: '',
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Email and password are required');
            expect(mockOrganizerRepository.findByEmail).not.toHaveBeenCalled();
        });
    });

    describe('Authentication Failures', () => {
        it('should fail if organizer is not found', async () => {
            vi.mocked(mockOrganizerRepository.findByEmail).mockResolvedValue(null);

            const result = await authenticateUseCase.execute({
                email: 'nonexistent@example.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid credentials');
            expect(result.organizer).toBeUndefined();
        });

        it('should fail if organizer is inactive', async () => {
            const mockOrganizer = new Organizer(
                '1',
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                false // inactive
            );

            vi.mocked(mockOrganizerRepository.findByEmail).mockResolvedValue(mockOrganizer);

            const result = await authenticateUseCase.execute({
                email: 'john@example.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Account is inactive. Please contact support.');
            expect(mockPasswordService.verify).not.toHaveBeenCalled();
        });

        it('should fail if password is incorrect', async () => {
            const mockOrganizer = new Organizer(
                '1',
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findByEmail).mockResolvedValue(mockOrganizer);
            vi.mocked(mockPasswordService.verify).mockResolvedValue(false);

            const result = await authenticateUseCase.execute({
                email: 'john@example.com',
                password: 'wrongpassword',
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid credentials');
            expect(result.organizer).toBeUndefined();
        });
    });

    describe('Security Considerations', () => {
        it('should not reveal whether email exists when password is wrong', async () => {
            const mockOrganizer = new Organizer(
                '1',
                'auth-user-123', // authUserId
                'john@example.com',
                'John Doe',
                'owner',
                true
            );

            vi.mocked(mockOrganizerRepository.findByEmail).mockResolvedValue(mockOrganizer);
            vi.mocked(mockPasswordService.verify).mockResolvedValue(false);

            const result = await authenticateUseCase.execute({
                email: 'john@example.com',
                password: 'wrongpassword',
            });

            // Should return same generic message as when user doesn't exist
            expect(result.message).toBe('Invalid credentials');
        });

        it('should not reveal whether email exists when user not found', async () => {
            vi.mocked(mockOrganizerRepository.findByEmail).mockResolvedValue(null);

            const result = await authenticateUseCase.execute({
                email: 'nonexistent@example.com',
                password: 'password123',
            });

            // Should return same generic message as when password is wrong
            expect(result.message).toBe('Invalid credentials');
        });
    });
});
