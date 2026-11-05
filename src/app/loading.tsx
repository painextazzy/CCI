import LoadingSkeleton from "./components/LoadingSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-6 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <LoadingSkeleton variant="page" />
    </main>
  );
}
