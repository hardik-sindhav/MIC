import mongoose from 'mongoose'
import { buildMongoUri, env } from './env.js'

export async function connectDatabase(log) {
  const uri = buildMongoUri()
  mongoose.set('strictQuery', true)

  await mongoose.connect(uri, {
    autoIndex: env.NODE_ENV !== 'production',
    maxPoolSize: 10,
  })

  log?.info({ msg: 'MongoDB connected' })
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
