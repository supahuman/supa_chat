# Embedding Providers & Vector Search Guide

This document explains the different embedding providers and vector search options available in the system.

## 🎯 Overview

The system supports multiple embedding providers and vector search solutions, giving you flexibility to choose based on your needs:

- **Cost**: Free local models vs. paid API services
- **Quality**: Different models have different performance characteristics
- **Speed**: Local processing vs. API calls
- **Scalability**: Self-hosted vs. managed services

## 🔤 Embedding Providers

### 1. OpenAI Embeddings (Recommended for Production)

**Best for**: High-quality embeddings, production systems

```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

**Models Available**:
- `text-embedding-3-small` (1536 dims) - **Recommended**
- `text-embedding-3-large` (3072 dims) - Higher quality
- `text-embedding-ada-002` (1536 dims) - Legacy model

**Pros**:
- ✅ Highest quality embeddings
- ✅ Consistent performance
- ✅ Easy to use
- ✅ Good documentation

**Cons**:
- ❌ API costs (~$0.0001 per 1K tokens)
- ❌ Requires internet connection
- ❌ Rate limits

**Cost**: ~$0.0001 per 1K tokens

---

### 2. Hugging Face Embeddings (Open Source)

**Best for**: Cost-effective, open source alternative

```bash
EMBEDDING_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_key
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

**Models Available**:
- `sentence-transformers/all-MiniLM-L6-v2` (384 dims) - Fast, good quality
- `sentence-transformers/all-mpnet-base-v2` (768 dims) - Higher quality
- `sentence-transformers/all-MiniLM-L12-v2` (384 dims) - Better than L6

**Pros**:
- ✅ Free API (with rate limits)
- ✅ Good quality
- ✅ Open source models
- ✅ Multiple model options

**Cons**:
- ❌ Rate limits (1000 requests/month free)
- ❌ Requires internet connection
- ❌ Slower than local models

**Cost**: Free (with rate limits)

---

### 3. Sentence Transformers (Local, Free)

**Best for**: Development, offline systems, cost-sensitive applications

```bash
EMBEDDING_PROVIDER=sentence-transformers
SENTENCE_TRANSFORMERS_MODEL=all-MiniLM-L6-v2
```

**Models Available**:
- `all-MiniLM-L6-v2` (384 dims) - Fast, good quality
- `all-mpnet-base-v2` (768 dims) - Higher quality
- `all-MiniLM-L12-v2` (384 dims) - Better than L6

**Pros**:
- ✅ Completely free
- ✅ No API limits
- ✅ Works offline
- ✅ Fast after initial load

**Cons**:
- ❌ Requires local storage (~400MB per model)
- ❌ Slower initial load
- ❌ Lower quality than OpenAI

**Cost**: Free

---

### 4. Cohere Embeddings (Enterprise Alternative)

**Best for**: Enterprise users, multilingual support

```bash
EMBEDDING_PROVIDER=cohere
COHERE_API_KEY=your_key
COHERE_EMBEDDING_MODEL=embed-english-v3.0
```

**Models Available**:
- `embed-english-v3.0` (1024 dims) - English
- `embed-multilingual-v3.0` (1024 dims) - Multilingual
- `embed-english-light-v3.0` (384 dims) - Faster, smaller

**Pros**:
- ✅ Good quality
- ✅ Multilingual support
- ✅ Enterprise features
- ✅ Competitive pricing

**Cons**:
- ❌ API costs
- ❌ Requires internet connection
- ❌ Less popular than OpenAI

**Cost**: ~$0.0001 per 1K tokens

## 🔍 Vector Search Providers

### 1. MongoDB Atlas Vector Search (Current)

**Best for**: Existing MongoDB users, managed service

```bash
VECTOR_SEARCH_PROVIDER=atlas
ATLAS_VECTOR_INDEX=vector_index
VECTOR_CANDIDATES=200
```

**Pros**:
- ✅ Integrated with existing MongoDB
- ✅ Managed service
- ✅ Good performance
- ✅ No additional setup

**Cons**:
- ❌ MongoDB Atlas costs
- ❌ Vendor lock-in
- ❌ Limited to MongoDB ecosystem

**Cost**: Included in MongoDB Atlas pricing

---

### 2. FAISS (Local, Free)

**Best for**: Cost-sensitive applications, offline systems

```bash
VECTOR_SEARCH_PROVIDER=faiss
FAISS_INDEX_PATH=./data/faiss_index
```

**Pros**:
- ✅ Completely free
- ✅ Fast similarity search
- ✅ Works offline
- ✅ No vendor lock-in

**Cons**:
- ❌ Requires local storage
- ❌ Manual index management
- ❌ No built-in persistence

**Cost**: Free

---

### 3. Pinecone (Managed Vector Database)

**Best for**: High-scale applications, managed service

```bash
VECTOR_SEARCH_PROVIDER=pinecone
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=supa-chatbot
```

**Pros**:
- ✅ Managed service
- ✅ High performance
- ✅ Auto-scaling
- ✅ Good documentation

**Cons**:
- ❌ Additional costs
- ❌ Vendor lock-in
- ❌ Requires internet connection

**Cost**: $70/month starter plan

---

### 4. Chroma (Self-Hosted)

**Best for**: Open source, self-hosted solutions

```bash
VECTOR_SEARCH_PROVIDER=chroma
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=supa-chatbot
```

**Pros**:
- ✅ Open source
- ✅ Self-hosted
- ✅ Good performance
- ✅ No vendor lock-in

**Cons**:
- ❌ Requires self-hosting
- ❌ Additional infrastructure
- ❌ Manual maintenance

**Cost**: Free (infrastructure costs only)

## 🚀 Recommended Configurations

### Development Setup (Free)
```bash
EMBEDDING_PROVIDER=sentence-transformers
SENTENCE_TRANSFORMERS_MODEL=all-MiniLM-L6-v2
VECTOR_SEARCH_PROVIDER=faiss
FAISS_INDEX_PATH=./data/faiss_index
```

### Production Setup (High Quality)
```bash
EMBEDDING_PROVIDER=openai
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
VECTOR_SEARCH_PROVIDER=atlas
ATLAS_VECTOR_INDEX=vector_index
```

### Cost-Optimized Setup
```bash
EMBEDDING_PROVIDER=huggingface
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_SEARCH_PROVIDER=faiss
FAISS_INDEX_PATH=./data/faiss_index
```

### Enterprise Setup
```bash
EMBEDDING_PROVIDER=cohere
COHERE_EMBEDDING_MODEL=embed-english-v3.0
VECTOR_SEARCH_PROVIDER=pinecone
PINECONE_INDEX_NAME=supa-chatbot
```

## 📊 Performance Comparison

| Provider | Quality | Speed | Cost | Setup |
|----------|---------|-------|------|-------|
| **OpenAI** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Hugging Face** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Sentence Transformers** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cohere** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

## 🔧 Switching Providers

### 1. Update Environment Variables
```bash
# Change embedding provider
EMBEDDING_PROVIDER=openai

# Change vector search provider
VECTOR_SEARCH_PROVIDER=faiss
```

### 2. Restart the Service
```bash
pnpm dev
```

### 3. Rebuild Vector Index
```bash
# Clear existing data
DELETE /api/bot/knowledge-base/crawled

# Reload knowledge base
POST /api/bot/knowledge-base/load
```

## 💡 Best Practices

### 1. Start Simple
- Begin with Sentence Transformers + FAISS for development
- Upgrade to OpenAI + Atlas for production

### 2. Monitor Costs
- Track API usage and costs
- Use local models for development
- Switch to APIs only for production

### 3. Test Performance
- Compare different providers
- Measure search quality
- Monitor response times

### 4. Plan for Scale
- Consider managed services for high volume
- Implement caching for frequently accessed data
- Monitor resource usage

## 🛠️ Troubleshooting

### Common Issues

#### 1. Embedding Generation Fails
```bash
# Check API keys
echo $OPENAI_API_KEY

# Test with different provider
EMBEDDING_PROVIDER=sentence-transformers
```

#### 2. Vector Search Errors
```bash
# Check vector dimensions match
echo $EMBEDDING_DIMENSIONS

# Verify index exists
ls -la ./data/faiss_index
```

#### 3. Performance Issues
```bash
# Use smaller models for faster processing
SENTENCE_TRANSFORMERS_MODEL=all-MiniLM-L6-v2

# Reduce vector dimensions
EMBEDDING_DIMENSIONS=384
```

## 📈 Cost Optimization

### 1. Use Local Models for Development
```bash
EMBEDDING_PROVIDER=sentence-transformers
VECTOR_SEARCH_PROVIDER=faiss
```

### 2. Cache Embeddings
- Store generated embeddings in database
- Reuse embeddings for similar content
- Implement embedding versioning

### 3. Batch Processing
- Process multiple documents together
- Use bulk API calls when possible
- Implement retry logic for failed requests

### 4. Monitor Usage
- Track API calls and costs
- Set up alerts for high usage
- Implement rate limiting
