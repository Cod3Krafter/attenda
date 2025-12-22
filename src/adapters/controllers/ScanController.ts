import { Scan } from '../../core/entities/scan/scan';
import { IScanRepository } from '../../core/repositories/IScanRepository';
import { IGuestRepository } from '../../core/repositories/IGuestRepository';
import { IGateRepository } from '../../core/repositories/IGateRepository';
import { IEventRepository } from '../../core/repositories/IEventRepository';
import { ControllerResponse, successResponse, errorResponse } from './types';

export interface CreateScanRequest {
    guestId: string;
    gateId: string;
    eventId: string;
    scanData?: string;
}

export interface ScanResult {
    scan: Scan;
    guest: {
        id: string;
        name: string;
        email: string;
        rsvpStatus: string;
        checkedIn: boolean;
    };
    gate: {
        id: string;
        name: string;
    };
}

export class ScanController {
    constructor(
        private scanRepository: IScanRepository,
        private guestRepository: IGuestRepository,
        private gateRepository: IGateRepository,
        private eventRepository: IEventRepository
    ) {}

    async getById(id: string): Promise<ControllerResponse<Scan>> {
        try {
            const scan = await this.scanRepository.findById(id);

            if (!scan) {
                return errorResponse('Scan not found', 'NOT_FOUND');
            }

            return successResponse(scan);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get scan',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByEventId(eventId: string): Promise<ControllerResponse<Scan[]>> {
        try {
            const scans = await this.scanRepository.findByEventId(eventId);
            return successResponse(scans);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get scans',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByGuestId(guestId: string): Promise<ControllerResponse<Scan[]>> {
        try {
            const scans = await this.scanRepository.findByGuestId(guestId);
            return successResponse(scans);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get scans',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByGateId(gateId: string): Promise<ControllerResponse<Scan[]>> {
        try {
            const scans = await this.scanRepository.findByGateId(gateId);
            return successResponse(scans);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get scans',
                'INTERNAL_ERROR'
            );
        }
    }

    async getAll(): Promise<ControllerResponse<Scan[]>> {
        try {
            const scans = await this.scanRepository.findAll();
            return successResponse(scans);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get scans',
                'INTERNAL_ERROR'
            );
        }
    }

    async create(request: CreateScanRequest): Promise<ControllerResponse<ScanResult>> {
        try {
            // Verify all entities exist
            const [guest, gate, event] = await Promise.all([
                this.guestRepository.findById(request.guestId),
                this.gateRepository.findById(request.gateId),
                this.eventRepository.findById(request.eventId),
            ]);

            if (!guest) {
                return errorResponse('Guest not found', 'GUEST_NOT_FOUND');
            }

            if (!gate) {
                return errorResponse('Gate not found', 'GATE_NOT_FOUND');
            }

            if (!event) {
                return errorResponse('Event not found', 'EVENT_NOT_FOUND');
            }

            // Validate gate is active
            if (!gate.isActive) {
                const scan = new Scan(
                    crypto.randomUUID(),
                    request.guestId,
                    request.gateId,
                    request.eventId,
                    new Date(),
                    'denied',
                    request.scanData
                );

                await this.scanRepository.save(scan);

                return successResponse({
                    scan,
                    guest: {
                        id: guest.id,
                        name: guest.name,
                        email: guest.email,
                        rsvpStatus: guest.rsvpStatus,
                        checkedIn: guest.checkedIn,
                    },
                    gate: {
                        id: gate.id,
                        name: gate.name,
                    },
                });
            }

            // Validate guest belongs to the event
            if (guest.eventId !== request.eventId) {
                const scan = new Scan(
                    crypto.randomUUID(),
                    request.guestId,
                    request.gateId,
                    request.eventId,
                    new Date(),
                    'invalid',
                    request.scanData
                );

                await this.scanRepository.save(scan);

                return successResponse({
                    scan,
                    guest: {
                        id: guest.id,
                        name: guest.name,
                        email: guest.email,
                        rsvpStatus: guest.rsvpStatus,
                        checkedIn: guest.checkedIn,
                    },
                    gate: {
                        id: gate.id,
                        name: gate.name,
                    },
                });
            }

            // Validate gate belongs to the event
            if (gate.eventId !== request.eventId) {
                const scan = new Scan(
                    crypto.randomUUID(),
                    request.guestId,
                    request.gateId,
                    request.eventId,
                    new Date(),
                    'invalid',
                    request.scanData
                );

                await this.scanRepository.save(scan);

                return successResponse({
                    scan,
                    guest: {
                        id: guest.id,
                        name: guest.name,
                        email: guest.email,
                        rsvpStatus: guest.rsvpStatus,
                        checkedIn: guest.checkedIn,
                    },
                    gate: {
                        id: gate.id,
                        name: gate.name,
                    },
                });
            }

            // Check if guest RSVP'd yes (optional validation - you might want to allow all guests)
            if (guest.rsvpStatus === 'no') {
                const scan = new Scan(
                    crypto.randomUUID(),
                    request.guestId,
                    request.gateId,
                    request.eventId,
                    new Date(),
                    'denied',
                    request.scanData
                );

                await this.scanRepository.save(scan);

                return successResponse({
                    scan,
                    guest: {
                        id: guest.id,
                        name: guest.name,
                        email: guest.email,
                        rsvpStatus: guest.rsvpStatus,
                        checkedIn: guest.checkedIn,
                    },
                    gate: {
                        id: gate.id,
                        name: gate.name,
                    },
                });
            }

            // Successful scan - check in the guest
            if (!guest.checkedIn) {
                guest.checkIn();
                await this.guestRepository.update(guest);
            }

            const scan = new Scan(
                crypto.randomUUID(),
                request.guestId,
                request.gateId,
                request.eventId,
                new Date(),
                'success',
                request.scanData
            );

            await this.scanRepository.save(scan);

            return successResponse({
                scan,
                guest: {
                    id: guest.id,
                    name: guest.name,
                    email: guest.email,
                    rsvpStatus: guest.rsvpStatus,
                    checkedIn: guest.checkedIn,
                },
                gate: {
                    id: gate.id,
                    name: gate.name,
                },
            });
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to create scan',
                'INTERNAL_ERROR'
            );
        }
    }
}
