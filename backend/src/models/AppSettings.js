import mongoose from 'mongoose'

const appSettingsSchema = new mongoose.Schema(
  {
    /** The version currently live in stores (e.g. "1.0.5") */
    latestVersion: { type: String, trim: true, default: '1.0.0' },
    /** URL to download the update (Play Store, App Store, or direct APK) */
    updateUrl: { type: String, trim: true, default: '' },
    /** What's new in this version? (shown in the app's update dialog) */
    updateNote: { type: String, trim: true, default: '' },
    /** If true, the app blocks the user until they update */
    forceUpdate: { type: Boolean, default: false },
    /** Welcome reward configuration */
    welcomeReward: {
      totalCards: { type: Number, default: 10 },
      bonusCards: { type: Number, default: 0 },
      bonusCardIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
      starChances: {
        star1: { type: Number, default: 40 },
        star2: { type: Number, default: 30 },
        star3: { type: Number, default: 15 },
        star4: { type: Number, default: 10 },
        star5: { type: Number, default: 5 },
      }
    },
    /** Same shape as welcomeReward — used by reward pack claims (only adds cards user does not own yet) */
    rewardPack: {
      totalCards: { type: Number, default: 5 },
      bonusCards: { type: Number, default: 0 },
      bonusCardIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
      starChances: {
        star1: { type: Number, default: 40 },
        star2: { type: Number, default: 30 },
        star3: { type: Number, default: 15 },
        star4: { type: Number, default: 10 },
        star5: { type: Number, default: 5 },
      }
    },
    /**
     * Max rewarded-ad pack claims per user per rolling window (claim-reward-pack).
     * 0 = unlimited.
     */
    rewardAdMaxPerDay: { type: Number, default: 10, min: 0, max: 500 },
    /**
     * Length of that window in minutes (admin: 10–1440 = 10 min to 24 h). After it ends, count resets.
     */
    rewardAdWindowMinutes: { type: Number, default: 1440, min: 10, max: 1440 },
  },
  { timestamps: true },
)

export const AppSettings =
  mongoose.models.AppSettings || mongoose.model('AppSettings', appSettingsSchema, 'app_settings')
