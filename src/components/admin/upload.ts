"use client";

/** Uploads a photo from the admin panel and returns its public URL. */
export async function uploadAdminImage(file: File, purpose: "offer" | "business_cover" | "business_photo" | "category") {
  const request = () =>
    fetch("/api/v1/admin/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mime: file.type, bytes: file.size, purpose }),
    });
  let response = await request();
  // The access cookie lasts 15 minutes; renew it once and retry.
  if (response.status === 401 && (await fetch("/api/v1/auth/refresh", { method: "POST" })).ok) response = await request();
  const body = (await response.json()) as { data?: { uploadUrl: string; headers: Record<string, string>; url: string }; error?: { message: string } };
  if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Upload failed");
  const put = await fetch(body.data.uploadUrl, { method: "PUT", headers: body.data.headers, body: file });
  if (!put.ok) throw new Error("Upload failed");
  return body.data.url;
}
