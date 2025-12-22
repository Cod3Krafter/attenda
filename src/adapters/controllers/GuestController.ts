import { Guest } from '../../core/entities/guest/guest';
import { IGuestRepository } from '../../core/repositories/IGuestRepository';
import { IEventRepository } from '../../core/repositories/IEventRepository';
import { ControllerResponse, successResponse, errorResponse } from './types';

export interface CreateGuestRequest {
    eventId: string;
    name: string;
    email: string;
    phone: string;
    qrCode?: string;
}

export interface UpdateGuestRequest {
    name?: string;
    email?: string;
    phone?: string;
}

export interface RsvpRequest {
    status: 'yes' | 'no';
}

export class GuestController {
    constructor(
        private guestRepository: IGuestRepository,
        private eventRepository: IEventRepository
    ) {}

    async getById(id: string): Promise<ControllerResponse<Guest>> {
        try {
            const guest = await this.guestRepository.findById(id);

            if (!guest) {
                return errorResponse('Guest not found', 'NOT_FOUND');
            }

            return successResponse(guest);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get guest',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByEventId(eventId: string): Promise<ControllerResponse<Guest[]>> {
        try {
            const guests = await this.guestRepository.findByEventId(eventId);
            return successResponse(guests);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get guests',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByEmail(email: string): Promise<ControllerResponse<Guest>> {
        try {
            const guest = await this.guestRepository.findByEmail(email);

            if (!guest) {
                return errorResponse('Guest not found', 'NOT_FOUND');
            }

            return successResponse(guest);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get guest',
                'INTERNAL_ERROR'
            );
        }
    }

    async getAll(): Promise<ControllerResponse<Guest[]>> {
        try {
            const guests = await this.guestRepository.findAll();
            return successResponse(guests);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get guests',
                'INTERNAL_ERROR'
            );
        }
    }

    async create(request: CreateGuestRequest): Promise<ControllerResponse<Guest>> {
        try {
            // Verify event exists
            const event = await this.eventRepository.findById(request.eventId);
            if (!event) {
                return errorResponse('Event not found', 'EVENT_NOT_FOUND');
            }

            const guest = new Guest(
                crypto.randomUUID(),
                request.eventId,
                request.name,
                request.email,
                request.phone,
                'pending',
                false,
                false,
                undefined,
                request.qrCode
            );

            await this.guestRepository.save(guest);

            return successResponse(guest);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to create guest',
                'INTERNAL_ERROR'
            );
        }
    }

    async update(id: string, request: UpdateGuestRequest): Promise<ControllerResponse<Guest>> {
        try {
            const guest = await this.guestRepository.findById(id);

            if (!guest) {
                return errorResponse('Guest not found', 'NOT_FOUND');
            }

            if (request.name) guest.name = request.name;
            if (request.email) guest.email = request.email;
            if (request.phone) guest.phone = request.phone;

            await this.guestRepository.update(guest);

            return successResponse(guest);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to update guest',
                'INTERNAL_ERROR'
            );
        }
    }

    async updateRsvp(id: string, request: RsvpRequest): Promise<ControllerResponse<Guest>> {
        try {
            const guest = await this.guestRepository.findById(id);

            if (!guest) {
                return errorResponse('Guest not found', 'NOT_FOUND');
            }

            guest.updateRSVP(request.status);
            await this.guestRepository.update(guest);

            return successResponse(guest);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to update RSVP',
                'INTERNAL_ERROR'
            );
        }
    }

    async checkIn(id: string): Promise<ControllerResponse<Guest>> {
        try {
            const guest = await this.guestRepository.findById(id);

            if (!guest) {
                return errorResponse('Guest not found', 'NOT_FOUND');
            }

            guest.checkIn();
            await this.guestRepository.update(guest);

            return successResponse(guest);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to check in guest',
                'INTERNAL_ERROR'
            );
        }
    }

    async checkOut(id: string): Promise<ControllerResponse<Guest>> {
        try {
            const guest = await this.guestRepository.findById(id);

            if (!guest) {
                return errorResponse('Guest not found', 'NOT_FOUND');
            }

            guest.checkOut();
            await this.guestRepository.update(guest);

            return successResponse(guest);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to check out guest',
                'INTERNAL_ERROR'
            );
        }
    }

    async delete(id: string): Promise<ControllerResponse<void>> {
        try {
            const guest = await this.guestRepository.findById(id);

            if (!guest) {
                return errorResponse('Guest not found', 'NOT_FOUND');
            }

            await this.guestRepository.delete(id);

            return successResponse(undefined);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to delete guest',
                'INTERNAL_ERROR'
            );
        }
    }
}
