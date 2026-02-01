/**
 * Input Sanitizer
 * XSS prevention utilities
 */

const htmlEscapes: Record<string, string> = {
    "&": "&",
    "<": "<",
    ">": ">",
    "\"": "&quot;",
    "/": "&#x2F;"
};

/**
 * Sanitize user input to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeInput(input: string): string {
    // First replace single quote separately
    let result = input.replace(/'/g, "&#39;");
    // Then replace all other characters
    return result.replace(/[&<>"\/]/g, (match) => htmlEscapes[match]);
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
    return html.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize for safe JavaScript string insertion
 */
export function sanitizeForJs(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
}
