import { SectionHeader } from '../components/layout/SectionHeader.jsx'

export function SettingsPage() {
  return (
    <>
      <SectionHeader
        title="Settings"
        description="Platform configuration, integrations, and security policies."
      />
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center dark:bg-surface-elevated/40">
        <p className="text-body text-foreground-muted">Settings panels placeholder.</p>
      </div>
    </>
  )
}
