export const metadata = { title: "Offline · FrameWalk" };

export default function OfflinePage() {
  return (
    <section className="py-12 text-center">
      <h1 className="font-serif text-2xl text-ink">You&rsquo;re offline</h1>
      <p className="mt-3 text-ink-soft">
        That&rsquo;s fine — FrameWalk works without a connection. Your missions and
        diary are already on this device. Reconnect whenever you like.
      </p>
    </section>
  );
}
