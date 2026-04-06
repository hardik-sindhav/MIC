import { env } from '../config/env.js'
import { Admin } from '../models/Admin.js'
import { hashPassword } from './auth.service.js'

/**
 * Creates the first admin from env when no admin exists (bootstrap only).
 * Does not overwrite existing accounts.
 */
export async function ensureBootstrapAdmin(log) {
  const email = env.ADMIN_EMAIL
  const password = env.ADMIN_PASSWORD
  if (!email || !password) {
    log?.warn('No ADMIN_EMAIL/ADMIN_PASSWORD — skipping bootstrap (create an admin manually)')
    return
  }

  const count = await Admin.countDocuments()
  if (count > 0) {
    log?.info('Admin users already exist — bootstrap skipped')
    return
  }

  const passwordHash = await hashPassword(password)
  await Admin.create({
    email: email.toLowerCase().trim(),
    passwordHash,
    role: 'admin',
  })

  log?.warn(
    { email: email.toLowerCase().trim() },
    'Bootstrap admin created from environment — change password after first login in production',
  )
}
