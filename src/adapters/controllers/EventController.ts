import { Event } from '../../core/entities/event/event';
import { IEventRepository } from '../../core/repositories/IEventRepository';
import { IOrganizerRepository } from '../../core/repositories/IOrganizerRepository';
import { ControllerResponse, successResponse, errorResponse } from './types';

export interface CreateEventRequest {
    organizerId: string;
    title: string;
    description?: string;
    venue: string;
    startDate?: string; // ISO date string
    endDate: string; // ISO date string
}

export interface UpdateEventRequest {
    title?: string;
    description?: string;
    venue?: string;
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
}

export class EventController {
    constructor(
        private eventRepository: IEventRepository,
        private organizerRepository: IOrganizerRepository
    ) {}

    async getById(id: string): Promise<ControllerResponse<Event>> {
        try {
            const event = await this.eventRepository.findById(id);

            if (!event) {
                return errorResponse('Event not found', 'NOT_FOUND');
            }

            return successResponse(event);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get event',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByOrganizerId(organizerId: string): Promise<ControllerResponse<Event[]>> {
        try {
            const events = await this.eventRepository.findByOrganizerId(organizerId);
            return successResponse(events);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get events',
                'INTERNAL_ERROR'
            );
        }
    }

    async getAll(): Promise<ControllerResponse<Event[]>> {
        try {
            const events = await this.eventRepository.findAll();
            return successResponse(events);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get events',
                'INTERNAL_ERROR'
            );
        }
    }

    async create(request: CreateEventRequest): Promise<ControllerResponse<Event>> {
        try {
            // Verify organizer exists
            const organizer = await this.organizerRepository.findById(request.organizerId);
            if (!organizer) {
                return errorResponse('Organizer not found', 'ORGANIZER_NOT_FOUND');
            }

            const event = new Event(
                crypto.randomUUID(),
                request.title,
                request.description || null,
                request.organizerId,
                request.venue,
                new Date(request.endDate),
                request.startDate ? new Date(request.startDate) : undefined,
                'draft'
            );

            await this.eventRepository.save(event);

            return successResponse(event);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to create event',
                'INTERNAL_ERROR'
            );
        }
    }

    async update(id: string, request: UpdateEventRequest): Promise<ControllerResponse<Event>> {
        try {
            const event = await this.eventRepository.findById(id);

            if (!event) {
                return errorResponse('Event not found', 'NOT_FOUND');
            }

            const updateData: {
                title?: string;
                description?: string | null;
                venue?: string;
                startDate?: Date;
                endDate?: Date;
            } = {};

            if (request.title) updateData.title = request.title;
            if (request.description !== undefined) updateData.description = request.description || null;
            if (request.venue) updateData.venue = request.venue;
            if (request.startDate) updateData.startDate = new Date(request.startDate);
            if (request.endDate) updateData.endDate = new Date(request.endDate);

            event.updateDetails(updateData);
            await this.eventRepository.update(event);

            return successResponse(event);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to update event',
                'INTERNAL_ERROR'
            );
        }
    }

    async publish(id: string): Promise<ControllerResponse<Event>> {
        try {
            const event = await this.eventRepository.findById(id);

            if (!event) {
                return errorResponse('Event not found', 'NOT_FOUND');
            }

            event.publishEvent();
            await this.eventRepository.update(event);

            return successResponse(event);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to publish event',
                'INTERNAL_ERROR'
            );
        }
    }

    async cancel(id: string, reason?: string): Promise<ControllerResponse<Event>> {
        try {
            const event = await this.eventRepository.findById(id);

            if (!event) {
                return errorResponse('Event not found', 'NOT_FOUND');
            }

            event.cancelEvent(reason);
            await this.eventRepository.update(event);

            return successResponse(event);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to cancel event',
                'INTERNAL_ERROR'
            );
        }
    }

    async delete(id: string): Promise<ControllerResponse<void>> {
        try {
            const event = await this.eventRepository.findById(id);

            if (!event) {
                return errorResponse('Event not found', 'NOT_FOUND');
            }

            await this.eventRepository.delete(id);

            return successResponse(undefined);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to delete event',
                'INTERNAL_ERROR'
            );
        }
    }
}
