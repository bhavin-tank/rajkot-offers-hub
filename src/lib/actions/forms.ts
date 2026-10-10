"use server";

import { type FormState, validateContact, validateSubmitOffer } from "@/lib/validation/forms";

/**
 * Mock form handlers. They validate on the server and log the payload;
 * replace the log with the real API call when the backend exists.
 */

export async function submitOffer(_prev: FormState, data: FormData): Promise<FormState> {
  const errors = validateSubmitOffer(data);
  if (Object.keys(errors).length) return { status: "error", errors };

  console.info("[submit-offer]", {
    business: data.get("businessName"),
    title: data.get("title"),
    photos: data.get("photoCount"),
  });
  return { status: "success" };
}

export async function sendContact(_prev: FormState, data: FormData): Promise<FormState> {
  const errors = validateContact(data);
  if (Object.keys(errors).length) return { status: "error", errors };

  console.info("[contact]", { subject: data.get("subject") });
  return { status: "success" };
}
