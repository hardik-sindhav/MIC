import { SupportTicket } from '../models/SupportTicket.js'

export async function createTicket(userId, { title, description, images }) {
  // Generate custom ID: TIC-YYYYMMDD-XXX
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // 20260411
  
  // Find latest ticket of today to get the next sequence number
  const startOfDay = new Date(now.setHours(0, 0, 0, 0))
  const endOfDay = new Date(now.setHours(23, 59, 59, 999))
  
  const lastTicket = await SupportTicket.findOne({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ createdAt: -1 })

  let seq = 1
  if (lastTicket && lastTicket.ticketId) {
    const parts = lastTicket.ticketId.split('-')
    const lastSeq = parseInt(parts[2])
    if (!isNaN(lastSeq)) seq = lastSeq + 1
  }

  const ticketId = `TIC-${dateStr}-${String(seq).padStart(3, '0')}`

  const ticket = await SupportTicket.create({
    userId,
    ticketId,
    title,
    description,
    images: images || [],
    status: 'open',
  })
  return ticket
}

export async function listUserTickets(userId) {
  return await SupportTicket.find({ userId }).sort({ createdAt: -1 })
}

export async function listAllTicketsAdmin(filter = {}) {
  return await SupportTicket.find(filter)
    .populate('userId', 'name email image imageUrl')
    .sort({ createdAt: -1 })
}

export async function getTicketById(id) {
  return await SupportTicket.findById(id).populate('userId', 'name email image imageUrl')
}

export async function updateTicketStatus(id, status, solution = '') {
  const update = { status }
  if (status === 'resolved' && solution) {
    update.solution = solution
  }
  return await SupportTicket.findByIdAndUpdate(id, update, { new: true })
}

export async function addReply(ticketId, { senderId, senderType, message, images }) {
  const ticket = await SupportTicket.findById(ticketId)
  if (!ticket) return null

  ticket.replies.push({
    senderId,
    senderType,
    message,
    images: images || [],
  })

  // Auto-update status when admin replies and it's currently "open"
  if (senderType === 'admin' && ticket.status === 'open') {
    ticket.status = 'in-progress'
  }

  await ticket.save()
  return ticket
}
