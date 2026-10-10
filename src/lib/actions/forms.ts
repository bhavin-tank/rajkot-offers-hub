"use server";

import { currentRequestMeta } from "@/lib/auth/session";
import { type FieldErrors, type FormState, text, validateContact, validateSubmitOffer } from "@/lib/validation/forms";
import { AppError } from "@/server/lib/errors";
import { createContactMessage, createSubmission } from "@/server/services/inbound";
import { contactBody, submissionBody } from "@/server/validators/public";

/** Turns a service error into a message the form can show (in the visitor's language). */
function formError(error: unknown): FieldErrors {
  if (error instanceof AppError) {
    if (error.code === "RATE_LIMITED") return { form: "Too many attempts. Please try again in a few minutes." };
    if (error.extra?.fields?.mediaIds) return { photos: "A photo did not finish uploading. Remove it and add it again." };
  }
  console.error("[forms]", error);
  return { form: "Something went wrong. Please try again." };
}

export async function submitOffer(_prev: FormState, data: FormData): Promise<FormState> {
  const errors = validateSubmitOffer(data);
  if (Object.keys(errors).length) return { status: "error", errors };

  try {
    const input = submissionBody.parse({
      businessName: text(data, "businessName"),
      category: text(data, "category"),
      area: text(data, "area"),
      address: text(data, "address"),
      ownerName: text(data, "ownerName"),
      mobile: text(data, "mobile"),
      whatsapp: data.get("whatsapp") === "on",
      instagram: text(data, "instagram"),
      title: text(data, "title"),
      type: text(data, "type"),
      description: text(data, "description"),
      terms: text(data, "terms") || undefined,
      startDate: text(data, "startDate"),
      endDate: text(data, "endDate"),
      mediaIds: data.getAll("mediaIds").filter((v): v is string => typeof v === "string"),
      confirm: data.get("confirm") === "on",
    });
    await createSubmission(input, { ip: (await currentRequestMeta()).ip });
    return { status: "success" };
  } catch (error) {
    return { status: "error", errors: formError(error) };
  }
}

export async function sendContact(_prev: FormState, data: FormData): Promise<FormState> {
  const errors = validateContact(data);
  if (Object.keys(errors).length) return { status: "error", errors };

  try {
    const input = contactBody.parse({
      name: text(data, "name"),
      mobile: text(data, "mobile"),
      subject: text(data, "subject"),
      message: text(data, "message"),
    });
    await createContactMessage(input, { ip: (await currentRequestMeta()).ip });
    return { status: "success" };
  } catch (error) {
    return { status: "error", errors: formError(error) };
  }
}
