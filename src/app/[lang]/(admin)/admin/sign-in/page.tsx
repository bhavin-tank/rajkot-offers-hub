import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignInForm } from "@/components/admin/sign-in-form";
import { getSessionUser, isAdmin } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };

async function AlreadySignedIn() {
  if (isAdmin(await getSessionUser())) redirect("/admin");
  return null;
}

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <Suspense>
        <AlreadySignedIn />
      </Suspense>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-form">
        <h1 className="text-xl font-semibold">Admin sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted">We&apos;ll send a code to your WhatsApp.</p>
        <SignInForm />
      </div>
    </main>
  );
}
