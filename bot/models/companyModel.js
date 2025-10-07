import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  settings: {
    maxAgents: {
      type: Number,
      default: 10
    },
    features: [{
      type: String,
      enum: ['chat', 'knowledge-base', 'actions', 'forms', 'analytics']
    }],
    llmProvider: {
      type: String,
      default: 'groq'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
// companyId and apiKey already have unique: true which creates indexes automatically

export default mongoose.model('Company', companySchema);
