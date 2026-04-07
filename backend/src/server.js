import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import pino from 'pino'

import { getCorsOrigins } from './config/env.js'

/* Import your routes here */
import { authRoutes } from './routes/auth.routes.js'
// import other routes if needed

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
})

export function createApp(logger) {
  const app = express()

  /*
   TRUST PROXY (REQUIRED FOR RATE LIMITING)
  */
  app.set('trust proxy', 1)

  /*
   SECURITY MIDDLEWARE
  */
  app.use(helmet())

  /*
   CORS CONFIG
  */
  const allowedOrigins = getCorsOrigins()

  app.use(cors({
    origin: function (origin, callback) {
      // allow requests with no origin 
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))

  /*
   HANDLE PREFLIGHT
  */
  app.options('*', cors())

  /*
   BODY PARSER
  */
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  /*
   LOGGING
  */
  app.use(morgan('dev'))

  /*
   HEALTH CHECK ROUTE
  */
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'MIC API running'
    })
  })

  /*
   ROUTES
  */
  app.use('/api/auth', authRoutes)

  // add more routes like:
  // app.use('/api/admin', adminRoutes)

  /*
   404 HANDLER
  */
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    })
  })

  /*
   ERROR HANDLER
  */
  app.use((err, req, res, next) => {
    logger.error(err)

    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    })
  })

  return app
}

/*
 START SERVER
*/
const PORT = process.env.PORT || 3000
const app = createApp(logger)

import { connectDatabase } from './config/database.js'

async function startServer() {
  try {
    await connectDatabase(logger)
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
