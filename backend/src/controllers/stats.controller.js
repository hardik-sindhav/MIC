import { getDashboardStats, getTopPerformance } from '../services/stats.service.js'

export async function getDashboard(_req, res, next) {
  try {
    const stats = await getDashboardStats()
    return res.status(200).json(stats)
  } catch (e) {
    next(e)
  }
}

export async function getTopPerformanceController(req, res, next) {
  try {
    const raw = req.query?.limit
    const limit = raw !== undefined ? Number(raw) : 5
    const payload = await getTopPerformance(limit)
    return res.status(200).json(payload)
  } catch (e) {
    next(e)
  }
}
