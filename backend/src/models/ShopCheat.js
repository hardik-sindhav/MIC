import mongoose from 'mongoose'

const shopCheatSchema = new mongoose.Schema(
  {
    /** Admin-facing label in the list */
    name: { type: String, required: true, trim: true, maxlength: 200 },
    /** Treasure chest variant / tier (e.g. starter, premium) */
    chestType: { type: String, required: true, trim: true, maxlength: 120 },
    price: { type: Number, required: true, min: 0 },
    totalCards: { type: Number, required: true, min: 0 },
    rareCardCount: { type: Number, required: true, min: 0 },
    /** Promotional copy, e.g. “20% off” */
    offer: { type: String, trim: true, maxlength: 500, default: '' },
    /** Bonus cards granted on top of totalCards */
    extraCardBonus: { type: Number, required: true, min: 0, default: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
)

export const ShopCheat =
  mongoose.models.ShopCheat || mongoose.model('ShopCheat', shopCheatSchema, 'shop_cheats')
