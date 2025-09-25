import mongoose from 'mongoose';
import chunkingService from './chunkingService.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import OpenAI from 'openai';

class VectorDBService {
  constructor() {
    this.initialized = false;
    this.provider = process.env.VECTOR_PROVIDER || 'atlas'; // atlas | chroma | pinecone
    this.embeddingModel =
      process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    this.embeddingDimensions = Number(process.env.EMBEDDING_DIMENSIONS || 1536);
    this.openai = null;
  }

  async initialize() {
    try {
      if (this.provider === 'atlas') {
        if (!process.env.OPENAI_API_KEY) {
          console.warn('⚠️ OPENAI_API_KEY not set; embeddings will be unavailable');
        } else {
          this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
      }

      this.initialized = true;
      console.log('✅ Vector DB service initialized');
    } catch (error) {
      console.error('❌ Vector DB initialization failed:', error);
      this.initialized = false;
    }
  }

  async loadKnowledgeBase() {
    if (!this.initialized) {
      console.log('⚠️ Vector DB not initialized, skipping knowledge base load');
      return { success: false, error: 'Service not initialized' };
    }

    try {
      console.log('📚 Loading knowledge base...');

      // Check if knowledge base already exists
      const existingCount = await KnowledgeBase.countDocuments();
      if (existingCount > 0) {
        console.log(
          `📚 Knowledge base already loaded (${existingCount} chunks)`
        );
        return { success: true, count: existingCount };
      }

      // Load and chunk the knowledge base file
      const path = await import('path');
      const filePath = path.join(
        process.cwd(),
        'knowledge-base',
        'african-vibes-knowledge.md'
      );
      const chunks = await chunkingService.processFile(filePath);

      if (chunks.length === 0) {
        console.log('⚠️ No chunks found in knowledge base file');
        return { success: false, error: 'No content found' };
      }

      console.log(`📚 Processing ${chunks.length} chunks...`);

      let documents = [];

      if (this.provider === 'atlas' && this.openai) {
        const texts = chunks.map((c) => c.content);
        const embeddings = await this.generateEmbeddings(texts);
        documents = chunks.map((chunk, idx) => ({
          content: chunk.content,
          title: chunk.title,
          category: chunk.metadata.category,
          metadata: chunk.metadata,
          embedding: embeddings[idx],
        }));
      } else {
        documents = chunks.map((chunk) => ({
          content: chunk.content,
          title: chunk.title,
          category: chunk.metadata.category,
          metadata: chunk.metadata,
          embedding: [],
        }));
      }

      // Insert into database
      await KnowledgeBase.insertMany(documents);

      console.log(
        `✅ Knowledge base loaded successfully (${documents.length} chunks)`
      );
      return { success: true, count: documents.length };
    } catch (error) {
      console.error('❌ Failed to load knowledge base:', error);
      return { success: false, error: error.message };
    }
  }

  async searchSimilar(query, limit = 5) {
    if (!this.initialized) {
      console.log('⚠️ Vector DB not initialized');
      return { success: false, error: 'Service not initialized' };
    }

    try {
      if (this.provider === 'atlas' && this.openai) {
        const [embedding] = await this.generateEmbeddings([query]);

        const collection = mongoose.connection.collection('knowledgebases');
        const vectorResults = await collection
          .aggregate([
            {
              $vectorSearch: {
                index: process.env.ATLAS_VECTOR_INDEX || 'vector_index',
                path: 'embedding',
                queryVector: embedding,
                numCandidates: Number(process.env.VECTOR_CANDIDATES || 200),
                limit,
                similarity: process.env.VECTOR_SIMILARITY || 'cosine',
              },
            },
            {
              $project: {
                content: 1,
                metadata: 1,
                score: { $meta: 'vectorSearchScore' },
              },
            },
          ])
          .toArray();

        return {
          success: true,
          results: vectorResults.map((r) => r.content),
          metadatas: vectorResults.map((r) => r.metadata),
          distances: vectorResults.map((r) => 1 - (r.score || 0)),
        };
      }

      // Fallback to regex-based ranking if embeddings unavailable
      const searchTerms = this.extractSearchTerms(query);
      const searchQuery = {
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { title: { $regex: query, $options: 'i' } },
          ...searchTerms.map((term) => ({ content: { $regex: term, $options: 'i' } })),
          ...searchTerms.map((term) => ({ title: { $regex: term, $options: 'i' } })),
          ...searchTerms.map((term) => ({ category: { $regex: term, $options: 'i' } })),
        ],
      };
      const results = await KnowledgeBase.find(searchQuery)
        .limit(limit * 2)
        .sort({ createdAt: -1 });

      const scoredResults = results.map((doc) => ({
        doc,
        score: this.calculateRelevanceScore(doc, query, searchTerms),
      }));
      const topResults = scoredResults.sort((a, b) => b.score - a.score).slice(0, limit);
      return {
        success: true,
        results: topResults.map((item) => item.doc.content),
        metadatas: topResults.map((item) => item.doc.metadata),
        distances: topResults.map((item) => 1 - item.score),
      };
    } catch (error) {
      console.error('❌ Search failed:', error);
      return { success: false, error: error.message };
    }
  }

  extractSearchTerms(query) {
    // Extract meaningful search terms
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2) // Filter out short words
      .filter(
        (term) =>
          ![
            'the',
            'and',
            'or',
            'but',
            'in',
            'on',
            'at',
            'to',
            'for',
            'of',
            'with',
            'by',
            'is',
            'are',
            'was',
            'were',
            'be',
            'been',
            'have',
            'has',
            'had',
            'do',
            'does',
            'did',
            'will',
            'would',
            'could',
            'should',
            'may',
            'might',
            'can',
            'how',
            'what',
            'when',
            'where',
            'why',
            'who',
          ].includes(term)
      );

    return terms;
  }

  calculateRelevanceScore(doc, query, searchTerms) {
    let score = 0;
    const content = doc.content.toLowerCase();
    const title = doc.title.toLowerCase();
    const category = doc.category.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact query match in content (highest score)
    if (content.includes(queryLower)) {
      score += 10;
    }

    // Exact query match in title (very high score)
    if (title.includes(queryLower)) {
      score += 15;
    }

    // Individual term matches
    searchTerms.forEach((term) => {
      if (content.includes(term)) score += 2;
      if (title.includes(term)) score += 3;
      if (category.includes(term)) score += 1;
    });

    // Category relevance
    if (queryLower.includes('event') && category.includes('event')) score += 5;
    if (queryLower.includes('host') && category.includes('event')) score += 5;
    if (queryLower.includes('account') && category.includes('account'))
      score += 5;
    if (queryLower.includes('ticket') && category.includes('ticket'))
      score += 5;
    if (queryLower.includes('payment') && category.includes('payment'))
      score += 5;

    return Math.min(score, 20); // Cap at 20
  }

  async addToKnowledgeBase(content, metadata = {}) {
    if (!this.initialized) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      let embedding = [];
      if (this.provider === 'atlas' && this.openai) {
        const [e] = await this.generateEmbeddings([content]);
        embedding = e;
      }
      const document = new KnowledgeBase({
        content,
        title: metadata.title || 'Custom Content',
        category: metadata.category || 'general',
        metadata,
        embedding,
      });

      await document.save();
      return { success: true, id: document._id };
    } catch (error) {
      console.error('❌ Failed to add to knowledge base:', error);
      return { success: false, error: error.message };
    }
  }

  async generateEmbeddings(texts) {
    if (!this.openai) return texts.map(() => []);
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: texts,
    });
    return response.data.map((d) => d.embedding);
  }

  async getKnowledgeBaseStats() {
    if (!this.initialized) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const totalChunks = await KnowledgeBase.countDocuments();
      const categories = await KnowledgeBase.distinct('category');

      const categoryStats = {};
      for (const category of categories) {
        categoryStats[category] = await KnowledgeBase.countDocuments({
          category,
        });
      }

      return {
        success: true,
        totalChunks,
        categories: categoryStats,
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return { success: false, error: error.message };
    }
  }

  async clearKnowledgeBase() {
    if (!this.initialized) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      await KnowledgeBase.deleteMany({});
      console.log('✅ Knowledge base cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to clear knowledge base:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new VectorDBService();
