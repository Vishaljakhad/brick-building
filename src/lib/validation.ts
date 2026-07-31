const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && EMAIL_REGEX.test(email);
}

export function isValidPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

export function isValidName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 100;
}

export function isValidPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function isValidLatitude(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180;
}

export const ALLOWED_REGISTER_ROLES = ["CUSTOMER", "OWNER"] as const;
export type AllowedRegisterRole = (typeof ALLOWED_REGISTER_ROLES)[number];

export function normalizeEmail(email: unknown): string | null {
  if (!isValidEmail(email)) return null;
  return email.toLowerCase();
}
