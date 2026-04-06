import { useCallback, useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteShopCheat, fetchShopCheats } from '../api/shopCheats.js'
import { SectionHeader } from '../components/layout/SectionHeader.jsx'
import { DeleteShopCheatDialog } from '../components/shop/DeleteShopCheatDialog.jsx'
import { ShopCheatModal } from '../components/shop/ShopCheatModal.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Loader } from '../components/ui/Loader.jsx'
import { useAuth } from '../hooks/useAuth.js'

const tableWrap =
  'overflow-x-auto rounded-2xl border border-border bg-surface shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] dark:border-border-strong dark:bg-surface-elevated dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)] dark:ring-white/[0.06]'

const theadRow =
  'border-b border-border bg-gradient-to-b from-surface-muted to-surface-muted/40 dark:from-surface-muted/50 dark:to-surface-muted/20'

const th = 'px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted'

function formatPrice(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(n))
}

export function ShopPage() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingItem(null)
  }, [])

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchShopCheats(accessToken)
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      toast.error(e.message || 'Could not load treasure chests.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  async function confirmDelete() {
    if (!deleteTarget?._id || !accessToken) return
    setDeleteLoading(true)
    try {
      await deleteShopCheat(accessToken, deleteTarget._id)
      toast.success('Treasure chest removed.')
      setDeleteTarget(null)
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not delete treasure chest.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          className="mb-0"
          title="Shop"
          description="Treasure chests in the shop — set chest type, price, card counts, offer text, and bonus cards."
        />
        <Button
          type="button"
          className="w-full justify-center !min-h-10 !py-2 !sm:min-h-10 px-5 sm:w-auto sm:shrink-0 sm:px-6"
          onClick={() => {
            setEditingItem(null)
            setModalOpen(true)
          }}
        >
          Add chest
        </Button>
      </div>

      <div className={tableWrap}>
        {loading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-6 py-16">
            <Loader size="lg" label="Loading treasure chests…" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-body text-foreground-muted">No treasure chests yet. Add your first one.</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 w-full justify-center !min-h-10 !py-2 !sm:min-h-10 px-5 sm:w-auto sm:px-6"
              onClick={() => {
                setEditingItem(null)
                setModalOpen(true)
              }}
            >
              Add chest
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[880px] border-collapse text-left text-body">
            <thead>
              <tr className={theadRow}>
                <th className={`${th} pl-5 sm:pl-6`}>Name</th>
                <th className={th}>Type</th>
                <th className={th}>Price</th>
                <th className={th}>Total card</th>
                <th className={th}>Rare Card</th>
                <th className={th}>Bounce Card</th>
                <th className={th}>Offer</th>
                <th className={th}>Active</th>
                <th className={`${th} pr-5 text-right sm:pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-border/70 transition-colors last:border-b-0 hover:bg-accent/[0.03] dark:hover:bg-accent/[0.06]"
                >
                  <td className="px-4 py-3.5 pl-5 font-medium text-foreground sm:pl-6">{row.name}</td>
                  <td className="px-4 py-3.5 text-foreground-muted">
                    {row.chestType ?? row.cheatType ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-foreground">{formatPrice(row.price)}</td>
                  <td className="px-4 py-3.5 tabular-nums text-foreground">{row.totalCards ?? '—'}</td>
                  <td className="px-4 py-3.5 tabular-nums text-foreground">{row.rareCardCount ?? '—'}</td>
                  <td className="px-4 py-3.5 tabular-nums text-foreground">{row.extraCardBonus ?? 0}</td>
                  <td className="max-w-[200px] truncate px-4 py-3.5 text-small text-foreground-muted" title={row.offer || ''}>
                    {row.offer?.trim() ? row.offer : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        row.active !== false
                          ? 'bg-accent/15 text-accent'
                          : 'bg-foreground/10 text-foreground-muted'
                      }`}
                    >
                      {row.active !== false ? 'On' : 'Off'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 pr-5 text-right sm:pr-6">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="!min-h-10 !px-3"
                        aria-label={`Edit ${row.name}`}
                        onClick={() => {
                          setEditingItem(row)
                          setModalOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="!min-h-10 !px-3 text-error hover:bg-error/10 hover:text-error"
                        aria-label={`Delete ${row.name}`}
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ShopCheatModal
        open={modalOpen}
        accessToken={accessToken}
        onClose={closeModal}
        onSaved={load}
        editingItem={editingItem}
      />

      <DeleteShopCheatDialog
        open={Boolean(deleteTarget)}
        item={deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </>
  )
}
