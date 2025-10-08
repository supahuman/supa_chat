import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    unique: true
  },
  companyId: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  personality: {
    type: String,
    required: true
  },
  knowledgeBase: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'url', 'file', 'qa'],
      required: true
    },
    content: String,        // For text knowledge
    url: String,           // For URLs
    fileName: String,      // For files
    fileSize: Number,      // For files
    question: String,      // For Q&A
    answer: String,        // For Q&A
    status: {
      type: String,
      enum: ['saved', 'processing', 'completed', 'failed'],
      default: 'saved'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  trainingExamples: [{
    input: String,
    output: String,
    rating: Number
  }],
  model: {
    provider: String,
    model: String,
    temperature: Number,
    maxTokens: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'training', 'deleted'],
    default: 'active'
  },
  industry: {
    type: String,
    enum: ['healthcare', 'finance', 'ecommerce', 'events', 'education', 'support', 'technology', 'retail', 'hospitality', 'general'],
    default: 'general'
  },
  usage: {
    totalConversations: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    lastUsed: Date
  },
  tools: {
    enabled: [{
      type: String,
      enum: ['onedrive', 'slack', 'email', 'ticket', 'callback', 'docs', 'update', 'refund', 'escalate', 'survey']
    }],
    configurations: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    },
    permissions: {
      type: Map,
      of: {
        read: { type: Boolean, default: true },
        write: { type: Boolean, default: false },
        admin: { type: Boolean, default: false }
      },
      default: new Map()
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
agentSchema.index({ companyId: 1, agentId: 1 });
agentSchema.index({ companyId: 1, createdBy: 1 });
agentSchema.index({ companyId: 1, status: 1 });
// Note: apiKey index is automatically created by unique: true

export default mongoose.model('Agent', agentSchema);
