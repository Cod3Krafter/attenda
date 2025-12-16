import { Organizer } from '../../entities/organizer/organizer';
import { IOrganizerRepository } from '../../repositories/IOrganizerRepository';

export interface SignUpRequest {
    email: string;
    password: string;
    name: string;
    role?: 'owner' | 'admin' | 'staff';
}

export interface SignUpResponse {
    success: boolean;
    organizer?: Organizer;
    authUserId?: string;
    message: string;
}

/**
 * Supabase Auth Service Interface
 * Implemented in adapters layer - wraps Supabase client
 */
export interface ISupabaseAuthService {
    signUp(email: string, password: string): Promise<{ userId: string; email: string } | null>;
}

export class SignUpWithSupabaseUseCase {
    constructor(
        private supabaseAuthService: ISupabaseAuthService,
        private organizerRepository: IOrganizerRepository
    ) {}

    async execute(request: SignUpRequest): Promise<SignUpResponse> {
        const { email, password, name, role = 'staff' } = request;

        // 1. Validate input
        if (!email || !email.trim()) {
            return { success: false, message: 'Email is required' };
        }

        if (!password || password.length < 8) {
            return { success: false, message: 'Password must be at least 8 characters' };
        }

        if (!name || !name.trim()) {
            return { success: false, message: 'Name is required' };
        }

        // 2. Check if email already exists in our system
        const existingOrganizer = await this.organizerRepository.findByEmail(email);
        if (existingOrganizer) {
            return { success: false, message: 'Email already registered' };
        }

        // 3. Sign up with Supabase Auth
        const authResult = await this.supabaseAuthService.signUp(email, password);
        if (!authResult) {
            return { success: false, message: 'Failed to create auth account' };
        }

        // 4. Create Organizer entity linked to Supabase user
        let organizer: Organizer;
        try {
            organizer = new Organizer(
                crypto.randomUUID(),
                authResult.userId, // Link to Supabase auth user
                email,
                name,
                role,
                true
            );
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create organizer'
            };
        }

        // 5. Save organizer to database
        try {
            await this.organizerRepository.save(organizer);

            return {
                success: true,
                organizer,
                authUserId: authResult.userId,
                message: 'Sign up successful'
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to save organizer: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
