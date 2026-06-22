import { SettingsPanel } from "@/components/settings-panel";

export default function SettingsPage() {
  return (
    <section aria-labelledby="settings-heading">
      <h1 id="settings-heading" className="mb-6 font-serif text-3xl text-ink">
        Settings
      </h1>
      <SettingsPanel />
    </section>
  );
}
