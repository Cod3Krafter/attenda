// Export classes
export { SignUpWithSupabaseUseCase } from './SignUpWithSupabase';
export { SignInWithSupabaseUseCase } from './SignInWithSupabase';

// Export request/response types
export type { SignUpRequest, SignUpResponse } from './SignUpWithSupabase';
export type { SignInRequest, SignInResponse, AuthSession } from './SignInWithSupabase';

// Export auth service interfaces with aliases to avoid conflicts
export type { ISupabaseAuthService as ISignUpAuthService } from './SignUpWithSupabase';
export type { ISupabaseAuthService as ISignInAuthService } from './SignInWithSupabase';
