# LangChain Embeddings Configuration

This document explains how to configure different embedding providers using LangChain's built-in system.

## 🎯 Overview

LangChain provides a unified interface for multiple embedding providers, making it easy to switch between different models without changing your code.

## 🔧 Configuration

### Environment Variables

```bash
# Choose your embedding provider
EMBEDDING_PROVIDER=openai  # or huggingface, cohere

# Provider-specific settings
OPENAI_API_KEY=your_openai_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

HUGGINGFACE_API_KEY=your_hf_key
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

COHERE_API_KEY=your_cohere_key
COHERE_EMBEDDING_MODEL=embed-english-v3.0
```

## 📋 Supported Providers

### 1. OpenAI Embeddings (Recommended)

**Best for**: Production systems, highest quality

```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

**Models Available**:
- `text-embedding-3-small` (1536 dims) - **Recommended**
- `text-embedding-3-large` (3072 dims) - Higher quality
- `text-embedding-ada-002` (1536 dims) - Legacy

**Pros**:
- ✅ Highest quality embeddings
- ✅ Consistent performance
- ✅ Easy to use

**Cons**:
- ❌ API costs (~$0.0001 per 1K tokens)
- ❌ Requires internet connection

---

### 2. Hugging Face Embeddings

**Best for**: Open source alternative, cost-effective

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

**Cons**:
- ❌ Rate limits (1000 requests/month free)
- ❌ Requires internet connection

---

### 3. Cohere Embeddings

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

**Cons**:
- ❌ API costs
- ❌ Requires internet connection

## 🚀 Quick Setup Examples

### Development (Free)
```bash
EMBEDDING_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_free_key
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Production (High Quality)
```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### Enterprise (Multilingual)
```bash
EMBEDDING_PROVIDER=cohere
COHERE_API_KEY=your_key
COHERE_EMBEDDING_MODEL=embed-multilingual-v3.0
```

## 🔄 Switching Providers

### 1. Update Environment Variables
```bash
# Change provider
EMBEDDING_PROVIDER=openai

# Update API key
OPENAI_API_KEY=your_new_key
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

## 📊 Performance Comparison

| Provider | Quality | Speed | Cost | Setup |
|----------|---------|-------|------|-------|
| **OpenAI** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Hugging Face** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cohere** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

## 💡 Best Practices

### 1. Start Simple
- Begin with Hugging Face for development
- Upgrade to OpenAI for production

### 2. Monitor Costs
- Track API usage and costs
- Use free tiers for development
- Switch to paid APIs only for production

### 3. Test Performance
- Compare different providers
- Measure search quality
- Monitor response times

### 4. Plan for Scale
- Consider rate limits
- Implement caching for frequently accessed data
- Monitor resource usage

## 🛠️ Troubleshooting

### Common Issues

#### 1. API Key Errors
```bash
# Check API key is set
echo $OPENAI_API_KEY

# Verify key is valid
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

#### 2. Model Not Found
```bash
# Check model name is correct
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Verify model is available
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models | grep embedding
```

#### 3. Rate Limit Errors
```bash
# Switch to different provider
EMBEDDING_PROVIDER=huggingface

# Or implement retry logic
# (handled automatically by LangChain)
```

## 📈 Cost Optimization

### 1. Use Free Tiers for Development
```bash
EMBEDDING_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_free_key
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

## 🔍 API Usage

### Check Current Configuration
```bash
GET /api/bot/knowledge-base/langchain/config
```

**Response**:
```json
{
  "success": true,
  "isEnabled": true,
  "config": {
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "supportedTypes": ["txt", "md", "pdf", "docx", "csv", "json", "html"],
    "embeddingProvider": "openai"
  },
  "embeddingInfo": {
    "provider": "openai",
    "model": "text-embedding-3-small",
    "dimensions": 1536
  }
}
```

### Test Embedding Generation
```bash
POST /api/bot/knowledge-base/langchain/test
{
  "testContent": "This is a test document for embedding generation."
}
```

## 🎯 Integration with Vector Search

The LangChain embeddings work seamlessly with MongoDB Atlas Vector Search:

1. **Generate Embeddings**: LangChain creates embeddings for documents
2. **Store in MongoDB**: Embeddings are stored in the `embedding` field
3. **Vector Search**: MongoDB Atlas performs similarity search
4. **Return Results**: Ranked results based on similarity scores

## 📚 Additional Resources

- [LangChain Embeddings Documentation](https://js.langchain.com/docs/modules/data_connection/text_embedding/)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference)
- [Cohere Embeddings API](https://docs.cohere.com/reference/embed)
