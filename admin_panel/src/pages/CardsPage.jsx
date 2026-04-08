import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, RotateCcw, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCard, fetchCards, fetchDeletedCards, restoreCardApi } from '../api/cards.js'
import { AddCardModal } from '../components/cards/AddCardModal.jsx'
import { DeleteCardDialog } from '../components/cards/DeleteCardDialog.jsx'
import { SectionHeader } from '../components/layout/SectionHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Loader } from '../components/ui/Loader.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { API_BASE_URL } from '../config/env.js'

function formatShortDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

const catalogTableWrap =
  'overflow-x-auto rounded-2xl border border-border bg-surface shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] dark:border-border-strong dark:bg-surface-elevated dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)] dark:ring-white/[0.06]'

const catalogTheadRow =
  'border-b border-border bg-gradient-to-b from-surface-muted to-surface-muted/40 dark:from-surface-muted/50 dark:to-surface-muted/20'

const th = 'px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted'

export function CardsPage() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deletedItems, setDeletedItems] = useState([])
  const [trashExpanded, setTrashExpanded] = useState(true)
  const [restoreId, setRestoreId] = useState(null)

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingCard(null)
  }, [])

  const openAdd = useCallback(() => {
    setEditingCard(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((card) => {
    setEditingCard(card)
    setModalOpen(true)
  }, [])

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchCards(accessToken)
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      toast.error(e.message || 'Could not load cards.Pls retry.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  const loadDeleted = useCallback(async () => {
    if (!accessToken) return
    try {
      const data = await fetchDeletedCards(accessToken)
      setDeletedItems(Array.isArray(data.items) ? data.items : [])
    } catch {
      setDeletedItems([])
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadDeleted()
  }, [loadDeleted])

  async function confirmArchive() {
    if (!deleteTarget?._id || !accessToken) return
    setDeleteLoading(true)
    try {
      await deleteCard(accessToken, deleteTarget._id)
      toast.success('Card archived — restore anytime from Recently deleted.')
      setDeleteTarget(null)
      await load()
      await loadDeleted()
    } catch (e) {
      toast.error(e.message || 'Could not archive card.')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleRestore(card) {
    if (!accessToken || !card?._id) return
    setRestoreId(card._id)
    try {
      await restoreCardApi(accessToken, card._id)
      toast.success('Card restored to the catalog.')
      await load()
      await loadDeleted()
    } catch (e) {
      toast.error(e.message || 'Could not restore card.')
    } finally {
      setRestoreId(null)
    }
  }

  return (
    <>
      {accessToken ? (
        <>
          <AddCardModal
            open={modalOpen}
            accessToken={accessToken}
            editingCard={editingCard}
            onClose={closeModal}
            onCreated={load}
          />
          <DeleteCardDialog
            open={Boolean(deleteTarget)}
            card={deleteTarget}
            onClose={() => {
              if (!deleteLoading) setDeleteTarget(null)
            }}
            onConfirm={confirmArchive}
            loading={deleteLoading}
          />
        </>
      ) : null}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          className="mb-0"
          title="Cards"
          description="Catalog table plus archived cards — restore deleted entries in one click."
        />
        <Button type="button" onClick={openAdd} className="w-full shrink-0 sm:w-auto">
          Add new card
        </Button>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] dark:bg-surface-elevated dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] dark:ring-white/[0.06]">
          <div className="animate-pulse divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 px-5 py-4">
                <div className="h-14 w-14 shrink-0 rounded-xl bg-surface-muted" />
                <div className="h-4 flex-1 self-center rounded-md bg-surface-muted" />
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center dark:bg-surface-elevated/40">
          <p className="text-body text-foreground-muted">No cards in the catalog yet. Add your first one.</p>
          <Button type="button" className="mt-4" onClick={openAdd}>
            Add new card
          </Button>
        </div>
      ) : (
        <div className={catalogTableWrap}>
          <table className="w-full min-w-[920px] border-collapse text-left text-small">
            <thead>
              <tr className={catalogTheadRow}>
                <th className={`${th} pl-5 sm:pl-6`}>Art</th>
                <th className={th}>Card</th>
                <th className={`${th} text-right`}>HP</th>
                <th className={`${th} text-right`}>Atk</th>
                <th className={`${th} text-right`}>Def</th>
                <th className={`${th} text-right`}>Mag</th>
                <th className={th}>Abilities</th>
                <th className={`${th} text-center`}>Star</th>
                <th className={`${th} text-right`}>Rarity</th>
                <th className={th}>Status</th>
                <th className={`${th} hidden lg:table-cell`}>Updated</th>
                <th className={`${th} pr-5 text-right sm:pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((card) => (
                <tr
                  key={card._id}
                  className={`group border-b border-border/70 transition-colors last:border-b-0 hover:bg-accent/[0.04] dark:hover:bg-accent/[0.07] ${
                    card.active === false ? 'bg-surface-muted/25 opacity-[0.92] dark:bg-surface-muted/10' : ''
                  }`}
                >
                  <td className="px-4 py-3.5 pl-5 align-middle sm:pl-6">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
                      <img
                        src={card.image?.startsWith('/') ? `${API_BASE_URL}${card.image}` : card.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </td>
                  <td className="max-w-[220px] px-4 py-3.5 align-middle sm:max-w-xs">
                    <span className="font-display text-[15px] font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
                      {card.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-right">
                    <span className="inline-flex min-w-[2.75rem] justify-end rounded-lg bg-surface-muted/80 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground dark:bg-surface-muted/50">
                      {card.totalHp ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-right">
                    <span className="inline-flex min-w-[2.75rem] justify-end rounded-lg bg-surface-muted/80 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground dark:bg-surface-muted/50">
                      {card.totalAttack ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-right">
                    <span className="inline-flex min-w-[2.75rem] justify-end rounded-lg bg-surface-muted/80 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground dark:bg-surface-muted/50">
                      {card.totalDefense ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-right">
                    <span className="inline-flex min-w-[2.75rem] justify-end rounded-lg bg-surface-muted/80 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground dark:bg-surface-muted/50">
                      {card.totalMagic ?? '—'}
                    </span>
                  </td>
                  <td className="max-w-[150px] px-4 py-3.5 align-middle">
                    <span className="text-xs font-medium text-foreground-muted line-clamp-1" title={card.abilities}>
                      {card.abilities || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <div
                      className="flex items-center justify-center gap-0.5 rounded-lg bg-surface-muted/50 px-1.5 py-1 dark:bg-surface-muted/30"
                      title={`${card.stars ?? 0} / 5`}
                    >
                      <span className="sr-only">{card.stars ?? 0} out of 5 stars</span>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < (card.stars || 0) ? 'fill-accent text-accent' : 'text-foreground-subtle/35'
                          }`}
                          strokeWidth={i < (card.stars || 0) ? 0 : 1.2}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-right">
                    <span className="inline-flex items-center justify-center rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums text-accent">
                      {card.rarity ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    {card.active === false ? (
                      <span className="inline-flex items-center rounded-full border border-foreground/25 bg-surface px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-foreground shadow-sm dark:border-white/25">
                        Off
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        On
                      </span>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3.5 align-middle text-xs tabular-nums text-foreground-subtle lg:table-cell">
                    {formatShortDate(card.updatedAt)}
                  </td>
                  <td className="px-4 py-3.5 pr-5 text-right align-middle sm:pr-6">
                    <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-muted/40 p-0.5 shadow-sm dark:border-border-strong dark:bg-surface-muted/25">
                      <button
                        type="button"
                        onClick={() => openEdit(card)}
                        className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-surface hover:text-accent dark:hover:bg-surface-elevated"
                        aria-label={`Edit ${card.name}`}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        disabled={deleteLoading && deleteTarget?._id === card._id}
                        onClick={() => setDeleteTarget(card)}
                        className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-red-500/10 hover:text-error disabled:opacity-50"
                        aria-label={`Archive ${card.name}`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {accessToken && deletedItems.length > 0 ? (
        <div className="mt-10">
          <button
            type="button"
            onClick={() => setTrashExpanded((e) => !e)}
            className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:brightness-[1.02] dark:hover:brightness-110 sm:px-5 ${catalogTableWrap}`}
          >
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              Recently deleted
              <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 font-sans text-xs font-bold tabular-nums text-accent">
                {deletedItems.length}
              </span>
            </span>
            {trashExpanded ? (
              <ChevronDown className="h-5 w-5 shrink-0 text-foreground-muted" aria-hidden />
            ) : (
              <ChevronRight className="h-5 w-5 shrink-0 text-foreground-muted" aria-hidden />
            )}
          </button>
          {trashExpanded ? (
            <div className="mt-3">
              <div className={catalogTableWrap}>
                <table className="w-full min-w-[920px] border-collapse text-left text-small">
                  <thead>
                    <tr className={catalogTheadRow}>
                      <th className={`${th} pl-5 sm:pl-6`}>Art</th>
                      <th className={th}>Card</th>
                      <th className={`${th} text-right`}>HP</th>
                      <th className={`${th} text-right`}>Atk</th>
                      <th className={`${th} text-right`}>Def</th>
                      <th className={`${th} text-right`}>Mag</th>
                      <th className={th}>Abilities</th>
                      <th className={`${th} text-center`}>Star</th>
                      <th className={`${th} text-right`}>Rarity</th>
                      <th className={th}>Status</th>
                      <th className={th}>Deleted</th>
                      <th className={`${th} pr-5 text-right sm:pr-6`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedItems.map((card) => {
                      const restoring = restoreId === card._id
                      return (
                      <tr
                        key={card._id}
                        className="border-b border-border/70 transition-colors last:border-b-0 hover:bg-accent/[0.03] dark:hover:bg-accent/[0.06]"
                      >
                        <td className="px-4 py-3.5 pl-5 align-middle sm:pl-6">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted opacity-90 shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
                            <img
                              src={card.image?.startsWith('/') ? `${API_BASE_URL}${card.image}` : card.image}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </td>
                        <td className="max-w-[220px] px-4 py-3.5 align-middle sm:max-w-xs">
                          <span className="font-display text-[15px] font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
                            {card.name}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <span className="inline-flex min-w-[2.75rem] justify-end rounded-lg bg-surface-muted/80 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground dark:bg-surface-muted/50">
                            {card.totalHp ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <span className="inline-flex min-w-[2.75rem] justify-end rounded-lg bg-surface-muted/80 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground dark:bg-surface-muted/50">
                            {card.totalAttack ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <span className="inline-flex min-w-[2.75rem] justify-end rounded-lg bg-surface-muted/80 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground dark:bg-surface-muted/50">
                            {card.totalDefense ?? '—'}
                          </span>
                        </td>
                          <td className="px-4 py-3.5 align-middle text-right">
                            <span className="inline-flex min-w-[2.75rem] justify-end rounded-lg bg-surface-muted/80 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground dark:bg-surface-muted/50">
                              {card.totalMagic ?? '—'}
                            </span>
                          </td>
                          <td className="max-w-[150px] px-4 py-3.5 align-middle">
                            <span className="text-xs font-medium text-foreground-muted line-clamp-1" title={card.abilities}>
                              {card.abilities || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                          <div
                            className="flex items-center justify-center gap-0.5 rounded-lg bg-surface-muted/50 px-1.5 py-1 dark:bg-surface-muted/30"
                            title={`${card.stars ?? 0} / 5`}
                          >
                            <span className="sr-only">{card.stars ?? 0} out of 5 stars</span>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < (card.stars || 0) ? 'fill-accent text-accent' : 'text-foreground-subtle/35'
                                }`}
                                strokeWidth={i < (card.stars || 0) ? 0 : 1.2}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <span className="inline-flex items-center justify-center rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums text-accent">
                            {card.rarity ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle">
                          <span className="inline-flex items-center rounded-full border border-foreground/20 bg-surface-muted/50 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-foreground-muted dark:border-white/20">
                            Archived
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                              {formatShortDate(card.deletedAt)}
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-wide text-foreground-subtle">
                              Deleted at
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 pr-5 text-right align-middle sm:pr-6">
                          <div className="inline-flex justify-end">
                            <button
                              type="button"
                              disabled={restoring}
                              aria-busy={restoring}
                              aria-label={restoring ? 'Restoring card' : `Restore ${card.name}`}
                              onClick={() => handleRestore(card)}
                              className="inline-flex min-h-[52px] min-w-[140px] items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-glow transition-all hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-60 dark:shadow-glow"
                            >
                              {restoring ? (
                                <Loader
                                  size="md"
                                  decorative
                                  className="!h-7 !w-7 !border-[3px] !border-accent-foreground/25 !border-t-accent-foreground"
                                />
                              ) : (
                                <>
                                  <RotateCcw className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                                  Restore
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
