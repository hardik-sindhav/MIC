import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createShopCheat, updateShopCheat } from '../../api/shopCheats.js'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Modal } from '../ui/Modal.jsx'

const emptyErrors = {
  name: '',
  chestType: '',
  price: '',
  totalCards: '',
  rareCardCount: '',
  offer: '',
  extraCardBonus: '',
}

function flattenApiErrors(details) {
  const fe = details?.fieldErrors
  if (!fe || typeof fe !== 'object') return {}
  const out = {}
  for (const [key, val] of Object.entries(fe)) {
    if (Array.isArray(val) && val[0]) out[key] = val[0]
  }
  return out
}

export function ShopCheatModal({ open, accessToken, onClose, onSaved, editingItem = null }) {
  const isEdit = Boolean(editingItem?._id)
  const hydrateKeyRef = useRef('')
  const formId = useId()
  const activeFieldId = `${formId}-active`

  const [name, setName] = useState('')
  const [chestType, setChestType] = useState('')
  const [price, setPrice] = useState('')
  const [totalCards, setTotalCards] = useState('')
  const [rareCardCount, setRareCardCount] = useState('')
  const [offer, setOffer] = useState('')
  const [extraCardBonus, setExtraCardBonus] = useState('0')
  const [active, setActive] = useState(true)
  const [errors, setErrors] = useState(emptyErrors)
  const [submitting, setSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    if (submitting) return
    setErrors(emptyErrors)
    onClose()
  }, [onClose, submitting])

  useEffect(() => {
    if (!open) return
    const key = editingItem?._id ? String(editingItem._id) : '__new__'
    if (hydrateKeyRef.current === key) return
    hydrateKeyRef.current = key

    if (editingItem?._id) {
      setName(editingItem.name ?? '')
      setChestType(editingItem.chestType ?? editingItem.cheatType ?? '')
      setPrice(String(editingItem.price ?? ''))
      setTotalCards(String(editingItem.totalCards ?? ''))
      setRareCardCount(String(editingItem.rareCardCount ?? ''))
      setOffer(editingItem.offer ?? '')
      setExtraCardBonus(String(editingItem.extraCardBonus ?? 0))
      setActive(editingItem.active !== false)
    } else {
      setName('')
      setChestType('')
      setPrice('')
      setTotalCards('')
      setRareCardCount('')
      setOffer('')
      setExtraCardBonus('0')
      setActive(true)
    }
    setErrors(emptyErrors)
  }, [open, editingItem])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!accessToken) return

    const nextErrors = { ...emptyErrors }
    if (!name.trim()) nextErrors.name = 'Name is required.'
    if (!chestType.trim()) nextErrors.chestType = 'Chest type is required.'

    const p = price === '' ? NaN : Number(price)
    if (!Number.isFinite(p) || p < 0) nextErrors.price = 'Enter a valid price (0 or more).'

    const tc = totalCards === '' ? NaN : Number(totalCards)
    if (!Number.isInteger(tc) || tc < 0) nextErrors.totalCards = 'Use a whole number 0 or greater.'

    const rc = rareCardCount === '' ? NaN : Number(rareCardCount)
    if (!Number.isInteger(rc) || rc < 0) nextErrors.rareCardCount = 'Use a whole number 0 or greater.'

    const eb = extraCardBonus === '' ? NaN : Number(extraCardBonus)
    if (!Number.isInteger(eb) || eb < 0) nextErrors.extraCardBonus = 'Use a whole number 0 or greater.'

    if (Number.isInteger(rc) && Number.isInteger(tc) && rc > tc) {
      nextErrors.rareCardCount = 'Cannot exceed total card count.'
    }

    const hasErr = Object.values(nextErrors).some(Boolean)
    if (hasErr) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      name: name.trim(),
      chestType: chestType.trim(),
      price: p,
      totalCards: tc,
      rareCardCount: rc,
      offer: offer.trim(),
      extraCardBonus: eb,
      active,
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateShopCheat(accessToken, editingItem._id, payload)
        toast.success('Treasure chest updated')
      } else {
        await createShopCheat(accessToken, payload)
        toast.success('Treasure chest created')
      }
      onSaved?.()
      handleClose()
    } catch (err) {
      const apiField = flattenApiErrors(err.details)
      if (Object.keys(apiField).length) {
        setErrors((prev) => ({ ...prev, ...apiField }))
        toast.error('Check the form — server rejected some values.')
      } else {
        toast.error(err.message || (isEdit ? 'Could not update item.' : 'Could not create item.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit treasure chest' : 'Add treasure chest'}
      description={
        isEdit
          ? 'Update chest type, pricing, card counts, offer text, and bonus cards.'
          : 'Each row is a treasure chest in the shop: chest type, price, card totals (including rares), optional offer line, and extra bonus cards.'
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={`${formId}-treasure-chest`}
            className="w-full sm:w-auto"
            loading={submitting}
            disabled={submitting}
          >
            {isEdit ? 'Save changes' : 'Save item'}
          </Button>
        </div>
      }
    >
      <form id={`${formId}-treasure-chest`} onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          id={`${formId}-name`}
          label="Display name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setErrors((p) => ({ ...p, name: '' }))
          }}
          error={errors.name}
          placeholder="e.g. Golden hoard chest"
        />

        <Input
          id={`${formId}-chestType`}
          label="Chest type"
          required
          value={chestType}
          onChange={(e) => {
            setChestType(e.target.value)
            setErrors((p) => ({ ...p, chestType: '' }))
          }}
          error={errors.chestType}
          hint="Variant or tier of the treasure chest (wood, royal, event…)."
          placeholder="e.g. Premium"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id={`${formId}-price`}
            label="Price (₹)"
            required
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value)
              setErrors((p) => ({ ...p, price: '' }))
            }}
            error={errors.price}
            hint="Amount in Indian Rupees (INR)."
            placeholder="0"
          />
          <Input
            id={`${formId}-totalCards`}
            label="Total card"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={totalCards}
            onChange={(e) => {
              setTotalCards(e.target.value)
              setErrors((p) => ({ ...p, totalCards: '', rareCardCount: '' }))
            }}
            error={errors.totalCards}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id={`${formId}-rare`}
            label="Rare Card"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={rareCardCount}
            onChange={(e) => {
              setRareCardCount(e.target.value)
              setErrors((p) => ({ ...p, rareCardCount: '' }))
            }}
            error={errors.rareCardCount}
            hint="Must not exceed total card count."
          />
          <Input
            id={`${formId}-bonus`}
            label="Bounce Card"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={extraCardBonus}
            onChange={(e) => {
              setExtraCardBonus(e.target.value)
              setErrors((p) => ({ ...p, extraCardBonus: '' }))
            }}
            error={errors.extraCardBonus}
            hint="Extra bounce cards on top of what is inside the chest."
          />
        </div>

        <Input
          id={`${formId}-offer`}
          label="Offer"
          value={offer}
          onChange={(e) => {
            setOffer(e.target.value)
            setErrors((p) => ({ ...p, offer: '' }))
          }}
          error={errors.offer}
          hint="Optional promo line (e.g. “20% off this week”)."
          placeholder="e.g. Launch week — +2 bonus rares"
        />

        <div>
          <span className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
            Active
          </span>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 dark:bg-surface-elevated">
            <div>
              <p className="text-body font-medium text-foreground">Visible in shop</p>
              <p className="mt-0.5 text-[13px] text-foreground-subtle">
                Turn off to hide this chest in the shop without deleting it.
              </p>
            </div>
            <button
              type="button"
              id={activeFieldId}
              role="switch"
              aria-checked={active}
              onClick={() => setActive((a) => !a)}
              className={`inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 px-1 py-0 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                active
                  ? 'border-accent/50 bg-accent shadow-md'
                  : 'border-foreground/30 bg-surface-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] dark:border-white/35 dark:bg-surface-muted/90 dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.45)]'
              }`}
            >
              <span
                aria-hidden
                className={`pointer-events-none block h-6 w-6 shrink-0 rounded-full border border-foreground/25 bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)] transition-transform duration-200 ease-out will-change-transform dark:border-white/30 dark:bg-surface-elevated dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)] ${
                  active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
