// Helper constants for form validation and input patterns

// Email validation regex
export const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone number validation regex (supports various formats)
export const REGEX_PHONE_NUMBER = /^[\+]?[1-9][\d]{0,15}$/;

// Alphabet validation with less than 11 characters
export const REGEX_ALPHABET_LESS_THAN_11 = /^[a-zA-Z\s]{1,10}$/;

// URL pattern validation
export const REGEX_URL_PATTERN_NEW =
  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// Additional common regex patterns
export const REGEX_NUMBERS_ONLY = /^\d+$/;
export const REGEX_ALPHANUMERIC = /^[a-zA-Z0-9]+$/;
export const REGEX_PASSWORD_STRONG =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const OTP_TIMEOUT_SECONDS = 300; // 5 minutes

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Vietnamese', value: 'vi' },
];
