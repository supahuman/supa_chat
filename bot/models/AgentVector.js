import mongoose from 'mongoose';

/**
 * AgentVector Schema - MongoDB model for storing vector embeddings
 * Used by the NLP pipeline for semantic search and knowledge storage
 */
const agentVectorSchema = new mongoose.Schema({
  // Agent and company identification
  agentId: {
    type: String,
    required: true
  },
  companyId: {
    type: String,
    required: true
  },
  
  // Content information
  content: {
    type: String,
    required: true,
    maxlength: 50000 // Reasonable limit for content
  },
  
  // Vector embedding
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 && v.every(n => typeof n === 'number');
      },
      message: 'Embedding must be an array of numbers'
    }
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Source information
  source: {
    type: {
      type: String,
      enum: ['url', 'document', 'text', 'file'],
      required: true
    },
    url: String,
    title: String,
    category: String,
    chunkIndex: Number,
    totalChunks: Number,
    originalLength: Number
  },
  
  // Search optimization
  contentHash: {
    type: String,
    sparse: true // Allow null values but index when present
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
agentVectorSchema.index({ agentId: 1, companyId: 1 });
agentVectorSchema.index({ agentId: 1, 'source.type': 1 });
agentVectorSchema.index({ companyId: 1, createdAt: -1 });

// Content hash index with unique constraint
agentVectorSchema.index(
  { contentHash: 1 }, 
  { 
    unique: true, 
    sparse: true,
    name: 'contentHash_unique_sparse'
  }
);

// Update the updatedAt field before saving
agentVectorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate content hash for deduplication
agentVectorSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.contentHash) {
    const crypto = require('crypto');
    this.contentHash = crypto.createHash('md5').update(this.content).digest('hex');
  }
  next();
});

// Static method to calculate cosine similarity
agentVectorSchema.statics.calculateCosineSimilarity = function(vector1, vector2) {
  if (!vector1 || !vector2) return 0;
  if (vector1.length !== vector2.length) return 0;

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    norm1 += vector1[i] * vector1[i];
    norm2 += vector2[i] * vector2[i];
  }

  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
};

// Static method to get vector statistics
agentVectorSchema.statics.getVectorStats = function(agentId, companyId) {
  return this.aggregate([
    { $match: { agentId, companyId } },
    {
      $group: {
        _id: null,
        totalVectors: { $sum: 1 },
        totalContentLength: { $sum: { $strLenCP: '$content' } },
        avgContentLength: { $avg: { $strLenCP: '$content' } },
        sourceTypes: { $addToSet: '$source.type' },
        categories: { $addToSet: '$source.category' },
        embeddingDimension: { $first: { $size: '$embedding' } },
        oldestVector: { $min: '$createdAt' },
        newestVector: { $max: '$createdAt' }
      }
    }
  ]);
};

// Instance method to get similarity score with another vector
agentVectorSchema.methods.getSimilarity = function(queryEmbedding) {
  return this.constructor.calculateCosineSimilarity(queryEmbedding, this.embedding);
};

// Clear any existing model to avoid conflicts
if (mongoose.models.AgentVector) {
  delete mongoose.models.AgentVector;
}

const AgentVector = mongoose.model('AgentVector', agentVectorSchema);

export default AgentVector;
