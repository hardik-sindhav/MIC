import mongoose from 'mongoose'
import crypto from 'crypto'

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    adminId: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId (DB admin) or String (env admin email)
      required: true,
      index: true,
    },
    isEnvToken: { type: Boolean, default: false }, // True for env-based admin tokens
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, maxlength: 512, default: '' },
    ip: { type: String, maxlength: 45, default: '' },
  },
  { timestamps: true },
)

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export function hashRefreshToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken, 'utf8').digest('hex')
}

export const RefreshToken =
  mongoose.models.RefreshToken || mongoose.model('RefreshToken', refreshTokenSchema)
