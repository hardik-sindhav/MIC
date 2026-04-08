import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createCard, updateCard } from '../../api/cards.js'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Textarea } from '../ui/Textarea.jsx'
import { Modal } from '../ui/Modal.jsx'
import { RaritySlider } from '../ui/RaritySlider.jsx'
import { StarSlider } from '../ui/StarSlider.jsx'
import { API_BASE_URL } from '../../config/env.js'

const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024
const MAX_DATA_URL_LENGTH = 7_200_000

const emptyErrors = {
  name: '',
  image: '',
  totalHp: '',
  totalAttack: '',
  totalDefense: '',
  totalMagic: '',
  stars: '',
  rarity: '',
  abilities: '',
}

function validate({
  name,
  image,
  totalHp,
  totalAttack,
  totalDefense,
  totalMagic,
  stars,
  rarity,
  abilities,
}) {
  const e = { ...emptyErrors }
  if (!name?.trim()) e.name = 'Name is required.'
  if (!image?.trim()) e.image = 'A card image is required.'
  else {
    const t = image.trim()
    if (t.startsWith('data:image/')) {
      if (t.length > MAX_DATA_URL_LENGTH) e.image = 'Uploaded image is too large (max 5 MB).'
    } else {
      try {
        const u = new URL(t)
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          e.image = 'Image must be a file upload or valid image URL.'
        }
      } catch {
        e.image = 'Image must be a file upload or valid image URL.'
      }
    }
  }

  const nums = [
    ['totalHp', totalHp],
    ['totalAttack', totalAttack],
    ['totalDefense', totalDefense],
    ['totalMagic', totalMagic],
  ]
  for (const [key, raw] of nums) {
    if (raw === '' || raw === undefined) {
      e[key] = 'This field is required.'
      continue
    }
    const n = Number(raw)
    if (!Number.isInteger(n) || n < 0) {
      e[key] = 'Use a whole number 0 or greater.'
    } else if (n > 999999) {
      e[key] = 'Maximum is 999999.'
    }
  }

  const s = Number(stars)
  if (!Number.isInteger(s) || s < 1 || s > 5) e.stars = 'Choose 1 to 5 stars.'

  const r = Number(rarity)
  if (!Number.isInteger(r) || r < 0 || r > 100) e.rarity = 'Rarity must be 0–100.'

  return e
}

export function AddCardModal({ open, accessToken, onClose, onCreated, editingCard = null }) {
  const isEdit = Boolean(editingCard?._id)
  const hydrateKeyRef = useRef('')
  const formId = useId()
  const starsFieldId = `${formId}-stars`
  const rarityFieldId = `${formId}-rarity`
  const activeFieldId = `${formId}-active`

  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState(null) // Store actual file object
  const [imagePreview, setImagePreview] = useState('') // For preview only
  const [fileName, setFileName] = useState('')
  const [totalHp, setTotalHp] = useState('')
  const [totalAttack, setTotalAttack] = useState('')
  const [totalDefense, setTotalDefense] = useState('')
  const [totalMagic, setTotalMagic] = useState('')
  const [stars, setStars] = useState(3)
  const [rarity, setRarity] = useState(0)
  const [abilities, setAbilities] = useState('')
  const [active, setActive] = useState(true)
  const [errors, setErrors] = useState(emptyErrors)
  const [submitting, setSubmitting] = useState(false)

  // imagePreview is now a local variable from state

  const reset = useCallback(() => {
    setName('')
    setImageFile(null)
    setImagePreview('')
    setFileName('')
    setTotalHp('')
    setTotalAttack('')
    setTotalDefense('')
    setTotalMagic('')
    setStars(3)
    setRarity(0)
    setAbilities('')
    setActive(true)
    setErrors(emptyErrors)
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  useEffect(() => {
    if (!open) {
      hydrateKeyRef.current = ''
      return
    }
    const key = editingCard?._id ? `edit:${editingCard._id}` : 'add'
    if (hydrateKeyRef.current === key) return
    hydrateKeyRef.current = key
    if (editingCard?._id) {
      setName(editingCard.name || '')
      // Construct full URL for image preview when editing
      const imageUrl = editingCard.image || ''
      const fullImageUrl = imageUrl.startsWith('/') ? `${API_BASE_URL}${imageUrl}` : imageUrl
      setImagePreview(fullImageUrl)
      setImageFile(null) // No file for existing image
      if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('http')) setFileName('Current image')
      else setFileName('')
      setTotalHp(editingCard.totalHp != null ? String(editingCard.totalHp) : '')
      setTotalAttack(editingCard.totalAttack != null ? String(editingCard.totalAttack) : '')
      setTotalDefense(editingCard.totalDefense != null ? String(editingCard.totalDefense) : '')
      setTotalMagic(editingCard.totalMagic != null ? String(editingCard.totalMagic) : '')
      setStars(Math.min(5, Math.max(1, Number(editingCard.stars) || 3)))
      setRarity(Math.min(100, Math.max(0, Number(editingCard.rarity) || 0)))
      setAbilities(editingCard.abilities || '')
      setActive(editingCard.active !== false)
      setErrors(emptyErrors)
    } else {
      reset()
    }
  }, [open, editingCard, reset])

  function onFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Choose an image file (PNG, JPG, WebP, etc.).')
      return
    }
    if (file.size > MAX_IMAGE_FILE_BYTES) {
      toast.error('Image is too large (max 5 MB).')
      return
    }
    // Store the actual file
    setImageFile(file)
    setFileName(file.name)
    setErrors((prev) => ({ ...prev, image: '' }))

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(String(reader.result || ''))
    }
    reader.onerror = () => toast.error('Could not read the file.')
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // Validate - use imagePreview for validation (non-empty check)
    const nextErrors = validate({
      name,
      image: imagePreview,
      totalHp,
      totalAttack,
      totalDefense,
      totalMagic,
      stars,
      rarity,
      abilities,
    })
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error('Fix the highlighted fields.')
      return
    }

    // For new cards, require a file upload
    if (!isEdit && !imageFile) {
      setErrors((prev) => ({ ...prev, image: 'Please upload an image file.' }))
      toast.error('Please upload an image file.')
      return
    }

    setSubmitting(true)
    try {
      // Build FormData for file upload
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('totalHp', String(Number(totalHp)))
      formData.append('totalAttack', String(Number(totalAttack)))
      formData.append('totalDefense', String(Number(totalDefense)))
      formData.append('totalMagic', String(Number(totalMagic)))
      formData.append('stars', String(Number(stars)))
      formData.append('rarity', String(Number(rarity)))
      formData.append('abilities', abilities.trim())
      formData.append('active', String(active))

      // Append image file if selected (new or replacement)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      if (isEdit) {
        await updateCard(accessToken, editingCard._id, formData)
        toast.success('Card updated')
      } else {
        await createCard(accessToken, formData)
        toast.success('Card created')
      }
      onCreated?.()
      handleClose()
    } catch (err) {
      if (err.code === 'PAYLOAD_TOO_LARGE' || err.status === 413) {
        toast.error(err.message || 'Image or payload is too large. Try under 10 MB.')
      } else if (err.details?.fieldErrors) {
        toast.error('Check the form — server rejected some values.')
      } else {
        toast.error(err.message || (isEdit ? 'Could not update card.' : 'Could not create card.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit card' : 'Add new card'}
      description={
        isEdit
          ? 'Change any field. Upload a new file to replace the image, or keep the current one (max 5 MB).'
          : 'All fields are required. Upload artwork (max 5 MB); the image is stored with the card.'
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={`${formId}-add-card`}
            className="w-full sm:w-auto"
            loading={submitting}
            disabled={submitting}
          >
            {isEdit ? 'Save changes' : 'Save card'}
          </Button>
        </div>
      }
    >
      <form id={`${formId}-add-card`} onSubmit={handleSubmit} className="space-y-5" noValidate>
        {imagePreview ? (
          <div className="overflow-hidden rounded-xl border border-border bg-surface-muted dark:bg-surface-muted/50">
            <img
              src={imagePreview}
              alt=""
              className="mx-auto max-h-48 w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/60 text-small text-foreground-subtle dark:bg-surface-muted/30">
            Image preview
          </div>
        )}

        <div>
          <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
            {isEdit ? 'Image (replace or keep current)' : 'Card image (file only)'}
            <span className="ml-1 font-sans text-error" aria-hidden>
              *
            </span>
          </label>
          <label className="flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-center text-small font-medium text-foreground-muted transition-colors hover:border-accent/40 hover:bg-surface-muted dark:bg-surface-elevated">
            <input type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
            {fileName ? `${fileName}` : isEdit ? 'Upload new image (optional)' : 'Upload image'}
          </label>
          <p className="mt-2 text-[13px] text-foreground-subtle">
            {isEdit
              ? 'Leave unchanged to keep the current artwork. New file: max 5 MB.'
              : 'PNG, JPG, WebP… max 5 MB.'}
          </p>
          {errors.image ? (
            <p className="mt-2 text-small text-error" role="alert">
              {errors.image}
            </p>
          ) : null}
        </div>

        <Input
          id={`${formId}-name`}
          label="Name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setErrors((p) => ({ ...p, name: '' }))
          }}
          error={errors.name}
          placeholder="e.g. Shadow Ace"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id={`${formId}-hp`}
            label="Total HP"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={totalHp}
            onChange={(e) => {
              setTotalHp(e.target.value)
              setErrors((p) => ({ ...p, totalHp: '' }))
            }}
            error={errors.totalHp}
            placeholder="0"
          />
          <Input
            id={`${formId}-atk`}
            label="Total attack"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={totalAttack}
            onChange={(e) => {
              setTotalAttack(e.target.value)
              setErrors((p) => ({ ...p, totalAttack: '' }))
            }}
            error={errors.totalAttack}
            placeholder="0"
          />
          <Input
            id={`${formId}-def`}
            label="Total defence"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={totalDefense}
            onChange={(e) => {
              setTotalDefense(e.target.value)
              setErrors((p) => ({ ...p, totalDefense: '' }))
            }}
            error={errors.totalDefense}
            placeholder="0"
          />
          <Input
            id={`${formId}-mag`}
            label="Total magic"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={totalMagic}
            onChange={(e) => {
              setTotalMagic(e.target.value)
              setErrors((p) => ({ ...p, totalMagic: '' }))
            }}
            error={errors.totalMagic}
            placeholder="0"
          />
        </div>

        <StarSlider
          id={starsFieldId}
          label="Star rating"
          required
          value={stars}
          onChange={(n) => {
            setStars(n)
            setErrors((p) => ({ ...p, stars: '' }))
          }}
          error={errors.stars}
        />

        <RaritySlider
          id={rarityFieldId}
          label="Rarity"
          required
          value={rarity}
          onChange={(n) => {
            setRarity(n)
            setErrors((p) => ({ ...p, rarity: '' }))
          }}
          error={errors.rarity}
        />

        <Textarea
          id={`${formId}-abilities`}
          label="Abilities"
          value={abilities}
          onChange={(e) => {
            setAbilities(e.target.value)
            setErrors((p) => ({ ...p, abilities: '' }))
          }}
          error={errors.abilities}
          placeholder="e.g. Double Strike, Flying"
          rows={3}
        />

        <div>
          <span className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
            Active
          </span>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 dark:bg-surface-elevated">
            <div>
              <p className="text-body font-medium text-foreground">Visible / active</p>
              <p className="mt-0.5 text-[13px] text-foreground-subtle">
                Inactive cards stay in the database but can be hidden in your app.
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
