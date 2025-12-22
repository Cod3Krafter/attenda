import { Organizer } from '../../core/entities/organizer/organizer';
import { IOrganizerRepository } from '../../core/repositories/IOrganizerRepository';
import { ControllerResponse, successResponse, errorResponse } from './types';

export interface CreateOrganizerRequest {
    authUserId: string;
    email: string;
    name: string;
    role?: 'owner' | 'admin' | 'staff';
}

export interface UpdateOrganizerRequest {
    name?: string;
    email?: string;
    role?: 'owner' | 'admin' | 'staff';
}

export class OrganizerController {
    constructor(private organizerRepository: IOrganizerRepository) {}

    async getById(id: string): Promise<ControllerResponse<Organizer>> {
        try {
            const organizer = await this.organizerRepository.findById(id);

            if (!organizer) {
                return errorResponse('Organizer not found', 'NOT_FOUND');
            }

            return successResponse(organizer);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get organizer',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByEmail(email: string): Promise<ControllerResponse<Organizer>> {
        try {
            const organizer = await this.organizerRepository.findByEmail(email);

            if (!organizer) {
                return errorResponse('Organizer not found', 'NOT_FOUND');
            }

            return successResponse(organizer);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get organizer',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByAuthUserId(authUserId: string): Promise<ControllerResponse<Organizer>> {
        try {
            const organizer = await this.organizerRepository.findByAuthUserId(authUserId);

            if (!organizer) {
                return errorResponse('Organizer not found', 'NOT_FOUND');
            }

            return successResponse(organizer);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get organizer',
                'INTERNAL_ERROR'
            );
        }
    }

    async getAll(): Promise<ControllerResponse<Organizer[]>> {
        try {
            const organizers = await this.organizerRepository.findAll();
            return successResponse(organizers);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get organizers',
                'INTERNAL_ERROR'
            );
        }
    }

    async create(request: CreateOrganizerRequest): Promise<ControllerResponse<Organizer>> {
        try {
            // Check if organizer with this email already exists
            const existing = await this.organizerRepository.findByEmail(request.email);
            if (existing) {
                return errorResponse('Organizer with this email already exists', 'ALREADY_EXISTS');
            }

            // Check if organizer with this auth user ID already exists
            const existingAuth = await this.organizerRepository.findByAuthUserId(request.authUserId);
            if (existingAuth) {
                return errorResponse('Organizer with this auth user ID already exists', 'ALREADY_EXISTS');
            }

            const organizer = new Organizer(
                crypto.randomUUID(),
                request.authUserId,
                request.email,
                request.name,
                request.role || 'staff',
                true
            );

            await this.organizerRepository.save(organizer);

            return successResponse(organizer);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to create organizer',
                'INTERNAL_ERROR'
            );
        }
    }

    async update(id: string, request: UpdateOrganizerRequest): Promise<ControllerResponse<Organizer>> {
        try {
            const organizer = await this.organizerRepository.findById(id);

            if (!organizer) {
                return errorResponse('Organizer not found', 'NOT_FOUND');
            }

            // If email is being updated, check if new email is already taken
            if (request.email && request.email !== organizer.email) {
                const existing = await this.organizerRepository.findByEmail(request.email);
                if (existing) {
                    return errorResponse('Email is already taken', 'EMAIL_TAKEN');
                }
            }

            organizer.updateDetails(request);
            await this.organizerRepository.update(organizer);

            return successResponse(organizer);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to update organizer',
                'INTERNAL_ERROR'
            );
        }
    }

    async activate(id: string): Promise<ControllerResponse<Organizer>> {
        try {
            const organizer = await this.organizerRepository.findById(id);

            if (!organizer) {
                return errorResponse('Organizer not found', 'NOT_FOUND');
            }

            organizer.activate();
            await this.organizerRepository.update(organizer);

            return successResponse(organizer);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to activate organizer',
                'INTERNAL_ERROR'
            );
        }
    }

    async deactivate(id: string): Promise<ControllerResponse<Organizer>> {
        try {
            const organizer = await this.organizerRepository.findById(id);

            if (!organizer) {
                return errorResponse('Organizer not found', 'NOT_FOUND');
            }

            organizer.deactivate();
            await this.organizerRepository.update(organizer);

            return successResponse(organizer);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to deactivate organizer',
                'INTERNAL_ERROR'
            );
        }
    }

    async delete(id: string): Promise<ControllerResponse<void>> {
        try {
            const organizer = await this.organizerRepository.findById(id);

            if (!organizer) {
                return errorResponse('Organizer not found', 'NOT_FOUND');
            }

            await this.organizerRepository.delete(id);

            return successResponse(undefined);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to delete organizer',
                'INTERNAL_ERROR'
            );
        }
    }
}
