import { AppError } from "./errors";
import { maskMobile } from "./mobile";

/**
 * WhatsApp messages through the Meta WhatsApp Cloud API.
 *
 * Sign-in codes use an approved *authentication* template with a copy-code
 * button. Without WHATSAPP_TOKEN in development, codes are printed to the
 * server log instead of being sent.
 */

const GRAPH_URL = "https://graph.facebook.com";

/** Meta error code for "this number can't receive the message" (not on WhatsApp, or unreachable). */
const UNDELIVERABLE = new Set([131026, 131030]);

function config() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return null;
  return {
    token,
    phoneId,
    version: process.env.WHATSAPP_API_VERSION || "v23.0",
    otpTemplate: process.env.WHATSAPP_OTP_TEMPLATE || "otp_login",
    templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
  };
}

/** Sends a sign-in code. `mobile` is "+91XXXXXXXXXX". */
export async function sendOtpMessage(mobile: string, code: string) {
  const settings = config();
  if (!settings) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError("PROVIDER_UNAVAILABLE", "WhatsApp is not configured");
    }
    console.info(`[whatsapp:dev] Sign-in code for ${maskMobile(mobile)}: ${code}`);
    return;
  }

  const response = await fetch(`${GRAPH_URL}/${settings.version}/${settings.phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${settings.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: mobile.replace("+", ""),
      type: "template",
      template: {
        name: settings.otpTemplate,
        language: { code: settings.templateLanguage },
        components: [
          { type: "body", parameters: [{ type: "text", text: code }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
        ],
      },
    }),
  }).catch((error: unknown) => {
    console.error("[whatsapp] request failed", error);
    throw new AppError("PROVIDER_UNAVAILABLE", "Could not reach WhatsApp, please try again");
  });

  if (response.ok) return;
  const body = (await response.json().catch(() => ({}))) as { error?: { code?: number; message?: string } };
  if (body.error?.code && UNDELIVERABLE.has(body.error.code)) {
    throw new AppError("WHATSAPP_UNAVAILABLE", "This number is not on WhatsApp. Enter a WhatsApp number.");
  }
  console.error(`[whatsapp] send failed (${response.status})`, body.error?.message);
  throw new AppError("PROVIDER_UNAVAILABLE", "Could not send the code on WhatsApp, please try again");
}
