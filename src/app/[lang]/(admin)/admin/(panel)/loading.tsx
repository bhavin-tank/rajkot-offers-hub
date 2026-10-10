/** Shown while an admin page loads its data. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-skeleton" />
      <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-skeleton" />
      <div className="h-64 w-full animate-pulse rounded-xl bg-skeleton" />
    </div>
  );
}
