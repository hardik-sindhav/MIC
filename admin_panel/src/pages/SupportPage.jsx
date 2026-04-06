import { SectionHeader } from '../components/layout/SectionHeader.jsx'

export function SupportPage() {
  return (
    <>
      <SectionHeader
        title="Customer Support"
        description="Tickets, SLAs, and customer conversation history."
      />
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center dark:bg-surface-elevated/40">
        <p className="text-body text-foreground-muted">Support inbox placeholder.</p>
      </div>
    </>
  )
}
