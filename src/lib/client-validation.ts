export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
export const NAME_REGEX = /^[a-zA-Z\s'.-]+$/;

export interface FieldErrors {
  [field: string]: string | undefined;
}

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return "Email is required";
  if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be at most 128 characters";
  return undefined;
}

export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return undefined;
}

export function validateName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return "Name is required";
  if (value.length < 2) return "Name must be at least 2 characters";
  if (value.length > 100) return "Name must be at most 100 characters";
  if (!NAME_REGEX.test(value)) return "Name can only contain letters and spaces";
  return undefined;
}

export function validatePhone(phone: string): string | undefined {
  const value = phone.trim();
  if (!value) return undefined;
  if (!PHONE_REGEX.test(value)) return "Enter a valid phone number (7–15 digits)";
  return undefined;
}

export function validateAddress(address: string, required = false): string | undefined {
  const value = address.trim();
  if (required && !value) return "Address is required";
  if (value && value.length < 5) return "Address must be at least 5 characters";
  return undefined;
}

export function validatePositiveNumber(value: string, label = "Price"): string | undefined {
  if (!value.trim()) return `${label} is required`;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return `${label} must be a positive number`;
  return undefined;
}

export function validateNonNegativeInt(value: string, label = "Stock", optional = true): string | undefined {
  if (!value.trim()) return optional ? undefined : `${label} is required`;
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) return `${label} must be a non-negative whole number`;
  return undefined;
}

export function validateBhataName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return "Bhata name is required";
  if (value.length < 2) return "Bhata name must be at least 2 characters";
  return undefined;
}

export function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  barColor: string;
  textColor: string;
} {
  if (!password) return { score: 0, label: "", barColor: "bg-gray-200", textColor: "text-gray-500" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const barColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];
  const textColors = ["text-red-600", "text-orange-600", "text-yellow-700", "text-green-600", "text-green-700"];

  return {
    score: score as 0 | 1 | 2 | 3 | 4,
    label: score === 0 ? "Too short" : labels[Math.min(score, 4) - 1],
    barColor: barColors[Math.min(score, 4)],
    textColor: textColors[Math.min(score, 4)],
  };
}
