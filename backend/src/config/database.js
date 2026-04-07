import mongoose from 'mongoose'
import { buildMongoUri, env } from './env.js'

export async function connectDatabase(log) {
  const uri = buildMongoUri()
  mongoose.set('strictQuery', true)

  try {
    log?.info({ msg: 'Connecting to MongoDB...', uri: uri.replace(/:([^:@]+)@/, ':****@') })
    await mongoose.connect(uri, {
      autoIndex: env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000,
    })
    log?.info({ msg: 'MongoDB connected successfully' })
  } catch (err) {
    log?.error({ msg: 'MongoDB connection error', error: err.message })
    throw err
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
