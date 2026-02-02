export const ErrorCatalog: Record<string, string> = {
    "404": "The requested resource was not found.",
    "401": "Unauthorized. Please log in again.",
    "403": "You do not have permission to perform this action.",
    "500": "A server error occurred. Please try again later.",
    "NETWORK_ERROR": "Unable to connect to the server. Please check your internet connection.",
    "UNKNOWN_ERROR": "An unexpected error occurred.",
};

export interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
    request?: unknown;
    message?: string;
}

export const getFriendlyMessage = (error: ApiError): string => {
    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        // Map status codes to friendly messages
        if (status && ErrorCatalog[status]) {
            return ErrorCatalog[status];
        }

        // Return the server message if it looks clean (no URLs)
        if (message && !message.includes("/") && !message.includes("Cannot")) {
            return message;
        }

        return ErrorCatalog["UNKNOWN_ERROR"];
    }

    if (error.request) {
        return ErrorCatalog["NETWORK_ERROR"];
    }

    return error.message || ErrorCatalog["UNKNOWN_ERROR"];
};
