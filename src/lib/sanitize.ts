import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize plain text input (removes all HTML/scripts)
 * Use for: names, emails, phone numbers, titles, venues
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';

  // Remove any HTML/script tags completely
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: []
  });

  // Trim whitespace and return
  return validator.trim(cleaned);
}

/**
 * Sanitize HTML content (allows safe HTML tags only)
 * Use for: event descriptions, rich text fields
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';

  // Allow only safe HTML tags for basic formatting
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize and validate phone number
 * Removes all non-numeric characters except + and spaces
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return '';

  // First sanitize to remove any HTML
  const cleaned = sanitizeText(phone);

  // Keep only digits, +, spaces, and hyphens
  return cleaned.replace(/[^\d+\s\-()]/g, '');
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim().length === 0) return false;

  // Remove all non-digit characters for counting
  const digitsOnly = phone.replace(/\D/g, '');

  // Should have at least 10 digits (basic international format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Sanitize email (already has validation in Guest entity)
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';

  const cleaned = sanitizeText(email);
  return validator.normalizeEmail(cleaned) || cleaned;
}

/**
 * Validate string length
 */
export function isValidLength(
  input: string,
  min: number = 0,
  max: number = 1000
): boolean {
  if (!input) return min === 0;
  return input.length >= min && input.length <= max;
}

/**
 * Sanitize UUID - ensures it's a valid UUID format
 */
export function sanitizeUuid(uuid: string | null | undefined): string {
  if (!uuid) return '';

  const cleaned = sanitizeText(uuid);

  // Validate UUID format
  if (!validator.isUUID(cleaned)) {
    throw new Error('Invalid UUID format');
  }

  return cleaned;
}
