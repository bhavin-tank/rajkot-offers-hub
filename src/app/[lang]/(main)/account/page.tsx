import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ChangeMpinForm, DeleteAccountForm, NameForm } from "@/components/auth/account-forms";
import { MyCodes } from "@/components/auth/my-codes";
import { Container } from "@/components/layout/container";
import { AccountSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { accessToken, getSession } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("My account"), robots: { index: false, follow: false } };
}

async function Account() {
  const [t, session] = await Promise.all([getT(), getSession()]);
  if (session.status !== "signed-in") redirect("/login?next=/account");
  const { user } = session;
  const token = await accessToken();
  const mobile = user.phone_number ? `${user.country_code ?? ""} ${user.phone_number}`.trim() : null;
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-line bg-white p-5 lg:p-6">
        {mobile && (
          <p className="text-lg font-semibold">
            <span className="sr-only">{t("Mobile")}: </span>
            {mobile}
          </p>
        )}
        {user.email && <p className="text-sm text-muted">{user.email}</p>}
        <div className="mt-5">
          <NameForm name={user.name ?? undefined} />
        </div>
      </section>
      {token && <MyCodes token={token} />}
      <section className="rounded-2xl border border-line bg-white p-5 lg:p-6">
        <h2 className="mb-4 text-base font-semibold">{t("Change MPIN")}</h2>
        <ChangeMpinForm />
      </section>
      <div className="flex flex-wrap gap-3">
        <form action={logoutAction.bind(null, false)}>
          <Button type="submit" variant="outline">
            {t("Log out")}
          </Button>
        </form>
        <form action={logoutAction.bind(null, true)}>
          <Button type="submit" variant="ghost">
            {t("Log out on all devices")}
          </Button>
        </form>
      </div>
      <section className="flex flex-col gap-2 border-t border-line pt-6">
        <DeleteAccountForm />
      </section>
    </div>
  );
}

export default async function AccountPage() {
  const t = await getT();
  return (
    <Container className="max-w-3xl py-8 lg:py-14">
      <h1 className="mb-6 text-[28px] font-bold lg:text-4xl">{t("My account")}</h1>
      <Suspense fallback={<AccountSkeleton />}>
        <Account />
      </Suspense>
    </Container>
  );
}
