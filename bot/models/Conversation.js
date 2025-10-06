import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  companyId: {
    type: String,
    required: true
  },
  agentId: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  summary: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'escalated'],
    default: 'active'
  },
  metrics: {
    messageCount: { type: Number, default: 0 },
    duration: Number, // in seconds
    satisfaction: Number // 1-5 rating
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
conversationSchema.index({ companyId: 1, userId: 1 });
conversationSchema.index({ companyId: 1, agentId: 1 });
// sessionId already has unique: true which creates an index automatically
conversationSchema.index({ companyId: 1, createdAt: -1 });

export default mongoose.model('Conversation', conversationSchema);