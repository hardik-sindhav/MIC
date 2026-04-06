import mongoose from 'mongoose'

const networkSchema = new mongoose.Schema(
  {
    /** When true, the app may load ads from this network (subject to your mediation/fallback logic). */
    enabled: { type: Boolean, default: false },
    bannerAdUnitId: { type: String, trim: true, default: '' },
    interstitialAdUnitId: { type: String, trim: true, default: '' },
    rewardedAdUnitId: { type: String, trim: true, default: '' },
  },
  { _id: false },
)

const adConfigSchema = new mongoose.Schema(
  {
    meta: { type: networkSchema, default: () => ({}) },
    google: { type: networkSchema, default: () => ({}) },
    applovin: { type: networkSchema, default: () => ({}) },
    unity: { type: networkSchema, default: () => ({}) },
  },
  { timestamps: true },
)

export const AdConfig =
  mongoose.models.AdConfig || mongoose.model('AdConfig', adConfigSchema, 'ad_configs')
