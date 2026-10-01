import validator from 'validator';

/**
 * Validates a single email address
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email.trim());
};

/**
 * Parses a raw recipient input string or array, splits by comma/space/newline,
 * trims, deduplicates, and separates into valid vs invalid email addresses.
 *
 * @param {string|string[]} input
 * @returns {{ validEmails: string[], invalidEmails: string[], rawCount: number }}
 */
export const parseAndCleanRecipients = (input) => {
  if (!input) {
    return { validEmails: [], invalidEmails: [], rawCount: 0 };
  }

  let list = [];
  if (Array.isArray(input)) {
    list = input;
  } else if (typeof input === 'string') {
    // Split by comma, semicolon, space, newline, or tab
    list = input.split(/[\s,;]+/);
  }

  // Filter out empty items and normalize
  const cleanedTokens = list
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);

  const rawCount = cleanedTokens.length;
  const uniqueTokens = [...new Set(cleanedTokens)];

  const validEmails = [];
  const invalidEmails = [];

  for (const token of uniqueTokens) {
    if (isValidEmail(token)) {
      validEmails.push(token.toLowerCase());
    } else {
      invalidEmails.push(token);
    }
  }

  return {
    validEmails: [...new Set(validEmails)],
    invalidEmails,
    rawCount,
  };
};

export default {
  isValidEmail,
  parseAndCleanRecipients,
};
