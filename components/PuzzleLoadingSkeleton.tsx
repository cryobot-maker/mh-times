export function PuzzleLoadingSkeleton() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4">
      <div className="h-4 w-48 animate-pulse rounded bg-[#e2e2e2]" />
      <div className="h-4 w-64 animate-pulse rounded bg-[#e2e2e2]" />
      <div className="h-4 w-40 animate-pulse rounded bg-[#e2e2e2]" />
    </div>
  );
}
