import mongoose from 'mongoose';

// Conversation Schema
const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        metadata: {
          sources: [String],
          confidence: Number,
          model: String,
          usage: Object,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ sessionId: 1 });
conversationSchema.index({ status: 1, updatedAt: -1 });

// Virtual for message count
conversationSchema.virtual('messageCount').get(function () {
  return this.messages.length;
});

// Method to add message
conversationSchema.methods.addMessage = function (message) {
  this.messages.push(message);
  this.updatedAt = new Date();
  return this.save();
};

// Method to close conversation
conversationSchema.methods.close = function () {
  this.status = 'closed';
  this.updatedAt = new Date();
  return this.save();
};

// Static method to get user conversations
conversationSchema.statics.getUserConversations = function (
  userId,
  limit = 20
) {
  return this.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('sessionId status createdAt updatedAt messages');
};

// Static method to get conversation stats
conversationSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: { $size: '$messages' } },
        activeConversations: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
      },
    },
  ]);
};

// Static method to cleanup old conversations
conversationSchema.statics.cleanupOld = function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    updatedAt: { $lt: cutoffDate },
    status: 'closed',
  });
};

export default mongoose.model('Conversation', conversationSchema);
