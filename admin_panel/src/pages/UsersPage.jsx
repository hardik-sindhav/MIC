import { SectionHeader } from '../components/layout/SectionHeader.jsx'

export function UsersPage() {
  return (
    <>
      <SectionHeader
        title="Users"
        description="Manage admin and end-user accounts, roles, and permissions."
      />
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center dark:bg-surface-elevated/40">
        <p className="text-body text-foreground-muted">User list and actions will go here.</p>
      </div>
    </>
  )
}
