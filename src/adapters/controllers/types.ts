// Controller Response Types

export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
}

export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
    };
}

export type ControllerResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Helper functions for creating responses
export const successResponse = <T>(data: T): SuccessResponse<T> => ({
    success: true,
    data,
});

export const errorResponse = (message: string, code?: string): ErrorResponse => ({
    success: false,
    error: { message, code },
});
