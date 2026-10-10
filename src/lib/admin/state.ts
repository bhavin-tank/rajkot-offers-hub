/** What an admin form action reports back to the form. */
export type AdminState =
  | { status: "idle" }
  | { status: "success"; message?: string; data?: Record<string, string> }
  | { status: "error"; message: string; fields?: Record<string, string> };

export const idle: AdminState = { status: "idle" };
