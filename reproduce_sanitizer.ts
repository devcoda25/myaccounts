function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

const malicious = '<script>alert("xss")</script>';
console.log('Original:', malicious);
console.log('Sanitized:', sanitizeInput(malicious));
