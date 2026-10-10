import { notFound } from "next/navigation";
import { AppError } from "@/server/lib/errors";

/** Awaits a lookup, showing the 404 page when the record does not exist. */
export async function orNotFound<T>(lookup: Promise<T>): Promise<T> {
  try {
    return await lookup;
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
