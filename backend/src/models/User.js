import mongoose from 'mongoose'

/** End-user records — extend fields as your product grows */
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    displayName: { type: String, trim: true, maxlength: 120, default: '' },
    /** Match / season wins (sync from your game backend). */
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    /** Total cards owned in collection. */
    cardsHeld: { type: Number, default: 0, min: 0 },
    /** Count of rare-tier cards owned (define "rare" in your app when incrementing). */
    rareCardsHeld: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
)

userSchema.index({ wins: -1 })
userSchema.index({ losses: -1 })
userSchema.index({ cardsHeld: -1 })
userSchema.index({ rareCardsHeld: -1 })

export const User = mongoose.models.User || mongoose.model('User', userSchema, 'users')
