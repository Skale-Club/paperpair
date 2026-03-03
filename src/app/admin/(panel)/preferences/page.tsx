import { ControlPreferencesPanel } from "@/components/control-preferences-panel";

export default function AdminPreferencesPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-sand-900">Preferences</h1>
        <p className="mt-1 text-sm text-sand-600">
          Configure lighting, sounds, notification center behavior, and traditional layout settings for the admin workspace.
        </p>
      </div>

      <ControlPreferencesPanel
        storageKey="paperpair.admin.preferences"
        audience="admin"
      />
    </section>
  );
}
