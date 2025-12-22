import { Gate } from '../../core/entities/gate/Gate';
import { IGateRepository } from '../../core/repositories/IGateRepository';
import { IEventRepository } from '../../core/repositories/IEventRepository';
import { AccessCodeGenerator, DefaultAccessCodeGenerator } from '../../core/entities/gate/gateAccessCodeGenerator';
import { ControllerResponse, successResponse, errorResponse } from './types';

export interface CreateGateRequest {
    eventId: string;
    name: string;
    accessCode?: string;
}

export interface UpdateGateRequest {
    name?: string;
    accessCode?: string;
}

export class GateController {
    private accessCodeGenerator: AccessCodeGenerator;

    constructor(
        private gateRepository: IGateRepository,
        private eventRepository: IEventRepository,
        accessCodeGenerator?: AccessCodeGenerator
    ) {
        this.accessCodeGenerator = accessCodeGenerator || new DefaultAccessCodeGenerator();
    }

    async getById(id: string): Promise<ControllerResponse<Gate>> {
        try {
            const gate = await this.gateRepository.findById(id);

            if (!gate) {
                return errorResponse('Gate not found', 'NOT_FOUND');
            }

            return successResponse(gate);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get gate',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByEventId(eventId: string): Promise<ControllerResponse<Gate[]>> {
        try {
            const gates = await this.gateRepository.findByEventId(eventId);
            return successResponse(gates);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get gates',
                'INTERNAL_ERROR'
            );
        }
    }

    async getByAccessCode(accessCode: string): Promise<ControllerResponse<Gate>> {
        try {
            const gate = await this.gateRepository.findByAccessCode(accessCode);

            if (!gate) {
                return errorResponse('Gate not found', 'NOT_FOUND');
            }

            return successResponse(gate);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get gate',
                'INTERNAL_ERROR'
            );
        }
    }

    async getAll(): Promise<ControllerResponse<Gate[]>> {
        try {
            const gates = await this.gateRepository.findAll();
            return successResponse(gates);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get gates',
                'INTERNAL_ERROR'
            );
        }
    }

    async create(request: CreateGateRequest): Promise<ControllerResponse<Gate>> {
        try {
            // Verify event exists
            const event = await this.eventRepository.findById(request.eventId);
            if (!event) {
                return errorResponse('Event not found', 'EVENT_NOT_FOUND');
            }

            // Generate access code if not provided
            const accessCode = request.accessCode || this.accessCodeGenerator.generate();

            // Check if access code is already in use
            const existingGate = await this.gateRepository.findByAccessCode(accessCode);
            if (existingGate) {
                return errorResponse('Access code already in use', 'ACCESS_CODE_TAKEN');
            }

            const gate = new Gate(
                crypto.randomUUID(),
                request.eventId,
                request.name,
                accessCode,
                true
            );

            await this.gateRepository.save(gate);

            return successResponse(gate);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to create gate',
                'INTERNAL_ERROR'
            );
        }
    }

    async update(id: string, request: UpdateGateRequest): Promise<ControllerResponse<Gate>> {
        try {
            const gate = await this.gateRepository.findById(id);

            if (!gate) {
                return errorResponse('Gate not found', 'NOT_FOUND');
            }

            // If access code is being updated, check if new code is already in use
            if (request.accessCode && request.accessCode !== gate.accessCode) {
                const existingGate = await this.gateRepository.findByAccessCode(request.accessCode);
                if (existingGate) {
                    return errorResponse('Access code already in use', 'ACCESS_CODE_TAKEN');
                }
            }

            gate.updateDetails(request);
            await this.gateRepository.update(gate);

            return successResponse(gate);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to update gate',
                'INTERNAL_ERROR'
            );
        }
    }

    async regenerateAccessCode(id: string): Promise<ControllerResponse<Gate>> {
        try {
            const gate = await this.gateRepository.findById(id);

            if (!gate) {
                return errorResponse('Gate not found', 'NOT_FOUND');
            }

            // Keep generating until we get a unique code
            let newCode: string;
            let attempts = 0;
            const maxAttempts = 10;

            do {
                newCode = this.accessCodeGenerator.generate();
                const existing = await this.gateRepository.findByAccessCode(newCode);
                if (!existing) break;
                attempts++;
            } while (attempts < maxAttempts);

            if (attempts >= maxAttempts) {
                return errorResponse('Failed to generate unique access code', 'CODE_GENERATION_FAILED');
            }

            // Use the verified unique code
            gate.setAccessCode(newCode);
            await this.gateRepository.update(gate);

            return successResponse(gate);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to regenerate access code',
                'INTERNAL_ERROR'
            );
        }
    }

    async activate(id: string): Promise<ControllerResponse<Gate>> {
        try {
            const gate = await this.gateRepository.findById(id);

            if (!gate) {
                return errorResponse('Gate not found', 'NOT_FOUND');
            }

            gate.activate();
            await this.gateRepository.update(gate);

            return successResponse(gate);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to activate gate',
                'INTERNAL_ERROR'
            );
        }
    }

    async deactivate(id: string): Promise<ControllerResponse<Gate>> {
        try {
            const gate = await this.gateRepository.findById(id);

            if (!gate) {
                return errorResponse('Gate not found', 'NOT_FOUND');
            }

            gate.deactivate();
            await this.gateRepository.update(gate);

            return successResponse(gate);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to deactivate gate',
                'INTERNAL_ERROR'
            );
        }
    }

    async delete(id: string): Promise<ControllerResponse<void>> {
        try {
            const gate = await this.gateRepository.findById(id);

            if (!gate) {
                return errorResponse('Gate not found', 'NOT_FOUND');
            }

            await this.gateRepository.delete(id);

            return successResponse(undefined);
        } catch (error) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to delete gate',
                'INTERNAL_ERROR'
            );
        }
    }
}
