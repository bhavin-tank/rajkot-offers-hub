import { NoteForm } from "@/components/admin/note-form";
import { AdminPage, FilterTabs, formatDateTime, listHref, Pagination, SearchForm, StatusBadge, Table, Td } from "@/components/admin/ui";
import { updateContactAction } from "@/lib/actions/admin";
import { requireAdminUser } from "@/lib/auth/session";
import { whatsappHref } from "@/lib/utils";
import { formatMobile } from "@/server/lib/mobile";
import { listContactMessages } from "@/server/services/admin/inbox";
import { listQuery } from "@/server/validators/admin";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/[lang]/admin/messages">) {
  await requireAdminUser();
  const query = listQuery.parse(await searchParams);
  const { items, total, page, limit } = await listContactMessages(query);
  return (
    <AdminPage title="Messages" description="From the contact form. Reply on WhatsApp, then mark it replied.">
      <FilterTabs
        base="/admin/messages"
        current={query.status}
        extra={{ q: query.q }}
        items={[{ label: "All" }, { value: "new", label: "New" }, { value: "replied", label: "Replied" }, { value: "closed", label: "Closed" }]}
      />
      <SearchForm q={query.q} placeholder="Name, mobile or text" hidden={{ status: query.status }} />
      <Table head={["From", "Message", "Received", "Status"]} empty={items.length ? undefined : "No messages."}>
        {items.map((m) => (
          <tr key={m._id!.toHexString()}>
            <Td className="whitespace-nowrap">
              <span className="font-medium">{m.name}</span>
              <p className="text-xs">
                <a href={whatsappHref(m.mobile)} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {formatMobile(m.mobile)}
                </a>
              </p>
            </Td>
            <Td className="max-w-md">
              <p className="text-xs font-medium text-muted">{m.subject}</p>
              <p className="whitespace-pre-line">{m.message}</p>
            </Td>
            <Td className="text-xs whitespace-nowrap text-muted">{formatDateTime(m.createdAt)}</Td>
            <Td className="min-w-72">
              <div className="mb-1.5">
                <StatusBadge status={m.status} />
              </div>
              <NoteForm
                action={updateContactAction.bind(null, m._id!.toHexString())}
                status={m.status}
                note={m.note}
                statuses={[
                  { value: "new", label: "New" },
                  { value: "replied", label: "Replied" },
                  { value: "closed", label: "Closed" },
                ]}
              />
            </Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} limit={limit} total={total} href={(p) => listHref("/admin/messages", { status: query.status, q: query.q, page: p })} />
    </AdminPage>
  );
}
