import { Organizer } from '../../entities/organizer/organizer';
import { IOrganizerRepository } from '../../repositories/IOrganizerRepository';

export interface AuthenticateOrganizerRequest {
    email: string;
    password: string;
}

export interface AuthenticateOrganizerResponse {
    success: boolean;
    organizer?: Organizer;
    message: string;
}

// Interface for password verification service (to be implemented in adapters layer)
export interface IPasswordService {
    verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export class AuthenticateOrganizerUseCase {
    constructor(
        private organizerRepository: IOrganizerRepository,
        private passwordService: IPasswordService
    ) {}

    async execute(request: AuthenticateOrganizerRequest): Promise<AuthenticateOrganizerResponse> {
        const { email, password } = request;

        // Validation
        if (!email || !password) {
            return {
                success: false,
                message: 'Email and password are required'
            };
        }

        // Find organizer by email
        const organizer = await this.organizerRepository.findByEmail(email);

        if (!organizer) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }

        // Check if organizer is active
        if (!organizer.isActive) {
            return {
                success: false,
                message: 'Account is inactive. Please contact support.'
            };
        }

        // Verify password (implementation will be in adapters layer)
        // Note: For now, this is a placeholder. You'll need to add password field to Organizer entity
        // and implement proper password hashing in the adapters layer
        const isPasswordValid = await this.passwordService.verify(password, 'hashed-password-from-organizer');

        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }

        return {
            success: true,
            organizer,
            message: 'Authentication successful'
        };
    }
}
