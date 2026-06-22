import { Suspense } from "react";
import { CullFlow } from "@/components/cull-flow";

/** Cull route. useSearchParams (inside CullFlow) requires a Suspense boundary. */
export default function CullPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
      <CullFlow />
    </Suspense>
  );
}
