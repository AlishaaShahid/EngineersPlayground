export const ALLOWED_DOMAIN = "folio3.com";

export function isAllowedEmail(email: string): boolean {
  const match = /^[^\s@]+@([^\s@]+)$/.exec(email.trim().toLowerCase());
  return match !== null && match[1] === ALLOWED_DOMAIN;
}

export const domainErrorMessage = `Please use your @${ALLOWED_DOMAIN} email address.`;
