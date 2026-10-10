import type { MessageKey } from "@/lib/i18n/translate";

/**
 * Form rules shared by the client (instant feedback) and the server
 * actions (the source of truth). Messages are English keys: the forms translate them with `t` when
 * they render, so the server never needs to know the visitor's language.
 */

/** Field name → message. `form` holds a problem with the whole form (e.g. too many attempts). */
export type FieldErrors = Record<string, MessageKey>;

export type FormState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors }
  | { status: "success" };

export const initialFormState: FormState = { status: "idle" };

const REQUIRED: MessageKey = "This field is required";

export function text(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Indian mobile number: 10 digits starting with 6–9. */
export function isValidMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value.replace(/\D/g, ""));
}

function required(errors: FieldErrors, data: FormData, names: string[]) {
  for (const name of names) {
    if (!text(data, name)) errors[name] = REQUIRED;
  }
}

export const SUBMIT_STEPS = ["Business details", "Offer details", "Photos and confirmation"] as const satisfies readonly MessageKey[];

/** Fields checked on each step of the submit-offer form. */
export const SUBMIT_STEP_FIELDS = [
  ["businessName", "category", "area", "address", "ownerName", "mobile", "instagram"],
  ["title", "type", "description", "terms", "startDate", "endDate"],
  ["photos", "confirm", "form"],
] as const;

export function validateSubmitStep(step: number, data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (step === 0) {
    required(errors, data, ["businessName", "category", "area", "address", "ownerName"]);
    const mobile = text(data, "mobile");
    if (!isValidMobile(mobile)) errors.mobile = "Enter a valid mobile number";
    const instagram = text(data, "instagram");
    if (instagram && !/^@?[\w.]{1,30}$/.test(instagram)) errors.instagram = "Enter a valid Instagram handle";
  }
  if (step === 1) {
    required(errors, data, ["title", "type", "description", "startDate", "endDate"]);
    if (text(data, "title").length > 80) errors.title = "Keep the title under 80 characters";
    const start = text(data, "startDate");
    const end = text(data, "endDate");
    if (start && end && end < start) errors.endDate = "The end date must be after the start date";
  }
  if (step === 2) {
    if (data.get("photosUploading") === "true") errors.photos = "Please wait for the photos to finish uploading";
    else if (data.get("photosFailed") === "true") errors.photos = "Upload failed. Remove the photo and try again.";
    if (data.get("confirm") !== "on") errors.confirm = "Please confirm to continue";
  }
  return errors;
}

export function validateSubmitOffer(data: FormData): FieldErrors {
  return Object.assign({}, ...SUBMIT_STEPS.map((_, step) => validateSubmitStep(step, data)));
}

/** Index of the first step that has an error, or -1. */
export function firstStepWithError(errors: FieldErrors) {
  return SUBMIT_STEP_FIELDS.findIndex((fields) => fields.some((f) => f in errors));
}

export const CONTACT_SUBJECTS = [
  "General question",
  "Complaint about an offer",
  "Listing an offer",
  "Suggestion",
] as const satisfies readonly MessageKey[];

export function validateContact(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  required(errors, data, ["name", "subject", "message"]);
  if (!isValidMobile(text(data, "mobile"))) errors.mobile = "Enter a 10-digit mobile number";
  if (text(data, "message").length > 2000) errors.message = "Keep the message under 2000 characters";
  return errors;
}
