import type { Metadata } from "next";
import { Container, PageTitle } from "@/components/layout/container";
import { NotificationList } from "@/components/layout/notification-list";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Notifications"),
    robots: { index: false },
  };
}

export default async function NotificationsPage() {
  const t = await getT();
  return (
    <Container className="flex flex-col gap-6 pt-6 pb-10 lg:gap-8 lg:pt-12 lg:pb-20">
      <PageTitle title={t("Notifications")} subtitle={t("New offers from the shops you follow.")} />
      <NotificationList />
    </Container>
  );
}
