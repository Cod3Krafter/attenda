import { SupabaseClient } from '@supabase/supabase-js';
import { ISupabaseAuthService as ISignUpAuthService } from '../../core/use-cases/auth/SignUpWithSupabase';
import { ISupabaseAuthService as ISignInAuthService, AuthSession } from '../../core/use-cases/auth/SignInWithSupabase';

/**
 * Supabase Auth Service Adapter
 *
 * Wraps the Supabase client and implements auth interfaces defined in use cases.
 * This is the adapter layer - it knows about Supabase but the use cases don't.
 */
export class SupabaseAuthService implements ISignUpAuthService, ISignInAuthService {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Sign up a new user with email and password
     */
    async signUp(email: string, password: string): Promise<{ userId: string; email: string } | null> {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
            });

            if (error || !data.user) {
                console.error('Supabase sign up error:', error);
                return null;
            }

            return {
                userId: data.user.id,
                email: data.user.email!,
            };
        } catch (error) {
            console.error('Sign up failed:', error);
            return null;
        }
    }

    /**
     * Sign in a user with email and password
     */
    async signIn(email: string, password: string): Promise<AuthSession | null> {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error || !data.session) {
                console.error('Supabase sign in error:', error);
                return null;
            }

            return {
                userId: data.user.id,
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at || 0,
            };
        } catch (error) {
            console.error('Sign in failed:', error);
            return null;
        }
    }

    /**
     * Sign out the current user
     */
    async signOut(): Promise<boolean> {
        try {
            const { error } = await this.supabase.auth.signOut();
            return !error;
        } catch (error) {
            console.error('Sign out failed:', error);
            return false;
        }
    }

    /**
     * Get the current authenticated user
     */
    async getCurrentUser(): Promise<{ userId: string; email: string } | null> {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();

            if (error || !user) {
                return null;
            }

            return {
                userId: user.id,
                email: user.email!,
            };
        } catch (error) {
            console.error('Get current user failed:', error);
            return null;
        }
    }

    /**
     * Get the current session
     */
    async getSession(): Promise<AuthSession | null> {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();

            if (error || !session) {
                return null;
            }

            return {
                userId: session.user.id,
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresAt: session.expires_at || 0,
            };
        } catch (error) {
            console.error('Get session failed:', error);
            return null;
        }
    }
}
