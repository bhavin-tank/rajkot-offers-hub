import { notFound } from "next/navigation";

/** Sends every unknown URL to the localized 404 page, inside the `[lang]` layout. */
export default function UnknownPage() {
  notFound();
}
