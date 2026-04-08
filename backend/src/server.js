import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import pino from 'pino'

import { getCorsOrigins } from './config/env.js'

/* Import API routes */
import { apiRouter } from './routes/index.js'

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
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', '*'], // Allow images from any source (for cross-origin uploads)
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  }))

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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))

  /*
   HANDLE PREFLIGHT - ensure all methods are allowed
  */
  app.options('*', cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }))

  /*
   BODY PARSER (increased limit for image uploads - 10MB)
  */
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

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
   SERVE UPLOADED FILES (images) with CORS and CORP headers
  */
  app.use('/uploads', (req, res, next) => {
    // Allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    // Allow cross-origin resource loading (required for images in cross-origin context)
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  }, express.static('uploads'))

  /*
   ROUTES
  */
  app.use('/api', apiRouter)

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

    // Handle multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      })
    }

    if (err.message && err.message.includes('Only image files')) {
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }

    res.status(err.status || 500).json({
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
import { ensureBootstrapAdmin } from './services/adminBootstrap.service.js'

async function startServer() {
  try {
    await connectDatabase(logger)
    await ensureBootstrapAdmin(logger)
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
