/**
 * Input Sanitizer
 * XSS prevention utilities
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize HTML content - use with caution
 * Consider using a library like DOMPurify for full HTML sanitization
 */
export function sanitizeHtml(html: string): string {
    // Basic HTML entity encoding
    return sanitizeInput(html);
}

/**
 * Strip all HTML tags from a string
 */
export function stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize for safe JavaScript string insertion
 */
export function sanitizeForJs(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}
