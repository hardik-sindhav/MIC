import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      immutable: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true },
)

adminSchema.methods.isLocked = function isLocked() {
  return this.lockUntil != null && this.lockUntil > new Date()
}

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema, 'admins')
