import pino from 'pino'
import { createApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { ensureBootstrapAdmin } from './services/adminBootstrap.service.js'

const logger = pino({ level: env.LOG_LEVEL })

async function main() {
  await connectDatabase(logger)
  await ensureBootstrapAdmin(logger)

  const app = createApp(logger)
  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(
      { host: env.HOST, port: env.PORT, env: env.NODE_ENV },
      'MIC API listening',
    )
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.fatal(
        { port: env.PORT, host: env.HOST },
        `Port ${env.PORT} is already in use — stop the other process or set PORT in .env`,
      )
      process.exit(1)
    }
    throw err
  })

  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down')
    server.close(async () => {
      await disconnectDatabase()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
