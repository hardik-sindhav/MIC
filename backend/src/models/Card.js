import mongoose from 'mongoose'

const cardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, trim: true, sparse: true },
    image: { type: String, required: true },
    totalHp: { type: Number, required: true, min: 0, max: 999999 },
    totalAttack: { type: Number, required: true, min: 0, max: 999999 },
    totalDefense: { type: Number, required: true, min: 0, max: 999999 },
    totalMagic: { type: Number, required: true, min: 0, max: 999999 },
    stars: { type: Number, required: true, min: 1, max: 5 },
    rarity: { type: Number, required: true, min: 0, max: 100, default: 0 },
    abilities: { type: String, trim: true, default: '' },
    active: { type: Boolean, required: true, default: true },
    /** Soft delete: set when “deleted”; null = active catalog entry */
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export const Card = mongoose.models.Card || mongoose.model('Card', cardSchema, 'cards')
