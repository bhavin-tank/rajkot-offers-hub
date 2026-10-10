/** Indian mobile numbers: 10 digits starting with 6–9, optionally prefixed with 0, 91 or +91. */
export function normalizeMobile(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

/** "+919876543210" → "+91 98765 43210". */
export function formatMobile(mobile: string) {
  const digits = mobile.replace(/^\+91/, "");
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : mobile;
}

/** "+919876543210" → "+91 ••••• •3210", for logs and lists that should not show the whole number. */
export function maskMobile(mobile: string) {
  return `+91 ••••• •${mobile.slice(-4)}`;
}
