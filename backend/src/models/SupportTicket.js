import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema(
  {
    subject: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['open', 'pending', 'closed'],
      default: 'open',
      index: true,
    },
  },
  { timestamps: true },
)

export const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model('SupportTicket', ticketSchema, 'support_tickets')
