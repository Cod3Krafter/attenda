import { Organizer } from '../../entities/organizer/organizer';
import { IOrganizerRepository } from '../../repositories/IOrganizerRepository';

export interface SignInRequest {
    email: string;
    password: string;
}

export interface SignInResponse {
    success: boolean;
    organizer?: Organizer;
    accessToken?: string;
    refreshToken?: string;
    message: string;
}

export interface AuthSession {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

/**
 * Supabase Auth Service Interface
 */
export interface ISupabaseAuthService {
    signIn(email: string, password: string): Promise<AuthSession | null>;
}

export class SignInWithSupabaseUseCase {
    constructor(
        private supabaseAuthService: ISupabaseAuthService,
        private organizerRepository: IOrganizerRepository
    ) {}

    async execute(request: SignInRequest): Promise<SignInResponse> {
        const { email, password } = request;

        // 1. Validate input
        if (!email || !email.trim()) {
            return { success: false, message: 'Email is required' };
        }

        if (!password || !password.trim()) {
            return { success: false, message: 'Password is required' };
        }

        // 2. Sign in with Supabase Auth
        const session = await this.supabaseAuthService.signIn(email, password);
        if (!session) {
            return { success: false, message: 'Invalid credentials' };
        }

        // 3. Find organizer by email
        const organizer = await this.organizerRepository.findByEmail(email);
        if (!organizer) {
            return {
                success: false,
                message: 'Organizer profile not found. Please contact support.'
            };
        }

        // 4. Check if organizer is active
        if (!organizer.isActive) {
            return {
                success: false,
                message: 'Account is inactive. Please contact support.'
            };
        }

        // 5. Return successful authentication
        return {
            success: true,
            organizer,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            message: 'Sign in successful'
        };
    }
}
