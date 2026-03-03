import { ControlPreferencesPanel } from "@/components/control-preferences-panel";

export default function DashboardControlCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Control Center</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Workspace Preferences</h1>
        <p className="mt-2 text-sm text-slate-600">
          Adjust lighting, sounds, notification behavior, and the traditional layout settings.
        </p>
      </div>

      <ControlPreferencesPanel
        storageKey="paperpair.user.control-center"
        audience="user"
      />
    </div>
  );
}
