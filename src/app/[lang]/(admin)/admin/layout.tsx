import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

/** Admin pages read the session on every request, so they render on demand. */
export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
