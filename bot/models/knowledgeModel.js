import mongoose from 'mongoose';

// KnowledgeBase Schema
const knowledgeBaseSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
  embedding: {
    type: [Number],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
knowledgeBaseSchema.index({ category: 1 });
knowledgeBaseSchema.index({ title: 1 });
knowledgeBaseSchema.index({ createdAt: -1 });

// Virtual for content preview
knowledgeBaseSchema.virtual('contentPreview').get(function () {
  return this.content.length > 100
    ? this.content.substring(0, 100) + '...'
    : this.content;
});

// Static method to get stats
knowledgeBaseSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalChunks: { $sum: 1 },
        categories: { $addToSet: '$category' },
        totalContentLength: { $sum: { $strLenCP: '$content' } },
      },
    },
  ]);
};

// Static method to get by category
knowledgeBaseSchema.statics.getByCategory = function (category, limit = 10) {
  return this.find({ category }).sort({ createdAt: -1 }).limit(limit);
};

// Static method to search content
knowledgeBaseSchema.statics.searchContent = function (query, limit = 5) {
  return this.find({
    $or: [
      { content: { $regex: query, $options: 'i' } },
      { title: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

export default mongoose.model('KnowledgeBase', knowledgeBaseSchema);
