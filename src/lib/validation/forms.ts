/**
 * Form rules shared by the client (instant feedback) and the server
 * actions (the source of truth). Messages are user-facing Gujarati.
 */

export type FieldErrors = Record<string, string>;

export type FormState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors }
  | { status: "success" };

export const initialFormState: FormState = { status: "idle" };

const REQUIRED = "આ માહિતી જરૂરી છે";

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

export const SUBMIT_STEPS = ["બિઝનેસની માહિતી", "ઓફરની વિગતો", "ફોટા અને પુષ્ટિ"] as const;

/** Fields checked on each step of the submit-offer form. */
export const SUBMIT_STEP_FIELDS = [
  ["businessName", "category", "area", "address", "ownerName", "mobile", "instagram"],
  ["title", "type", "description", "terms", "startDate", "endDate"],
  ["confirm"],
] as const;

export function validateSubmitStep(step: number, data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (step === 0) {
    required(errors, data, ["businessName", "category", "area", "address", "ownerName"]);
    const mobile = text(data, "mobile");
    if (!isValidMobile(mobile)) errors.mobile = "કૃપા કરીને માન્ય મોબાઇલ નંબર લખો";
    const instagram = text(data, "instagram");
    if (instagram && !/^@?[\w.]{1,30}$/.test(instagram)) errors.instagram = "માન્ય Instagram હેન્ડલ લખો";
  }
  if (step === 1) {
    required(errors, data, ["title", "type", "description", "startDate", "endDate"]);
    if (text(data, "title").length > 80) errors.title = "શીર્ષક 80 અક્ષરથી ટૂંકું રાખો";
    const start = text(data, "startDate");
    const end = text(data, "endDate");
    if (start && end && end < start) errors.endDate = "છેલ્લી તારીખ શરૂઆતની તારીખ પછીની હોવી જોઈએ";
  }
  if (step === 2) {
    if (data.get("confirm") !== "on") errors.confirm = "આગળ વધવા માટે પુષ્ટિ કરો";
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
  "સામાન્ય પ્રશ્ન",
  "ઓફર વિશે ફરિયાદ",
  "ઓફર લિસ્ટ કરવા વિશે",
  "સૂચન",
] as const;

export function validateContact(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  required(errors, data, ["name", "subject", "message"]);
  if (!isValidMobile(text(data, "mobile"))) errors.mobile = "10 અંકનો મોબાઇલ નંબર દાખલ કરો";
  if (text(data, "message").length > 2000) errors.message = "સંદેશ 2000 અક્ષરથી ટૂંકો રાખો";
  return errors;
}
