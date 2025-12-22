import { Event } from '../../entities/event/event';
import { Gate } from '../../entities/gate/Gate';
import { IEventRepository } from '../../repositories/IEventRepository';
import { IGateRepository } from '../../repositories/IGateRepository';
import { IOrganizerRepository } from '../../repositories/IOrganizerRepository';

export interface CreateEventRequest {
    organizerId: string;
    title: string;
    description?: string | null;
    venue: string;
    startDate: Date;
    endDate: Date;
    gateNames: string[]; // Array of gate names to create (e.g., ["Main Entrance", "VIP Entrance"])
}

export interface CreateEventResponse {
    success: boolean;
    event?: Event;
    gates?: Gate[];
    message: string;
}

// Interface for access code generator (to be implemented in adapters layer)
export interface IAccessCodeGenerator {
    generate(): string;
}

export class CreateEventUseCase {
    constructor(
        private eventRepository: IEventRepository,
        private gateRepository: IGateRepository,
        private organizerRepository: IOrganizerRepository,
        private accessCodeGenerator: IAccessCodeGenerator
    ) {}

    async execute(request: CreateEventRequest): Promise<CreateEventResponse> {
        const { organizerId, title, description, venue, startDate, endDate, gateNames } = request;

        // 1. Verify organizer exists
        const organizer = await this.organizerRepository.findById(organizerId);
        if (!organizer) {
            return {
                success: false,
                message: 'Organizer not found'
            };
        }

        // 2. Verify organizer is active
        if (!organizer.isActive) {
            return {
                success: false,
                message: 'Organizer account is inactive'
            };
        }

        // 3. Validate dates
        if (startDate > endDate) {
            return {
                success: false,
                message: 'End date cannot be before start date'
            };
        }

        // 4. Create event entity (starts as 'draft')
        let event: Event;
        try {
            event = new Event(
                crypto.randomUUID(),
                title,
                description || null,
                organizerId,
                venue,
                endDate,
                startDate,
                'draft'
            );
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create event'
            };
        }

        // 5. Create gates for the event
        const gates: Gate[] = [];
        if (gateNames && gateNames.length > 0) {
            for (const gateName of gateNames) {
                try {
                    const accessCode = this.accessCodeGenerator.generate();
                    const gate = new Gate(
                        crypto.randomUUID(),
                        event.id,
                        gateName,
                        accessCode,
                        true
                    );
                    gates.push(gate);
                } catch (error) {
                    return {
                        success: false,
                        message: `Failed to create gate "${gateName}": ${error instanceof Error ? error.message : 'Unknown error'}`
                    };
                }
            }
        }

        // 6. Save event and gates to repositories
        try {
            await this.eventRepository.save(event);

            // Save all gates
            for (const gate of gates) {
                await this.gateRepository.save(gate);
            }

            return {
                success: true,
                event,
                gates,
                message: 'Event created successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to save event: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
