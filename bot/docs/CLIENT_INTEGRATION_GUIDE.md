# Client Integration Guide

This guide explains how clients can plug in their own databases and LLM providers into the Supa Chatbot system.

## Overview

The Supa Chatbot system is designed to be **multi-tenant** and **provider-agnostic**. Each client can:

- **Use their own vector database** (MongoDB Atlas, Supabase, Pinecone, etc.)
- **Use their own LLM provider** (OpenAI, Groq, Anthropic, etc.)
- **Configure their own settings** (chunking strategy, models, parameters)
- **Maintain data isolation** from other clients

## Supported Providers

### Vector Databases
- ✅ **MongoDB Atlas** - Full support with vector search
- ✅ **Supabase** - Full support with vector search
- 🔄 **Pinecone** - Adapter ready for implementation
- 🔄 **ChromaDB** - Adapter ready for implementation

### LLM Providers
- ✅ **Groq** - Fast, cost-effective responses
- ✅ **OpenAI** - GPT models with embeddings support
- ✅ **Anthropic** - Claude models
- 🔄 **Cohere** - Adapter ready for implementation
- 🔄 **Hugging Face** - Adapter ready for implementation

## Client Configuration

### 1. Basic Configuration Structure

```json
{
  "client-id": {
    "name": "Client Company Name",
    "description": "Client description",
    "vectorDB": {
      "type": "mongodb|supabase|pinecone|chroma",
      "connectionString": "your_connection_string",
      "database": "your_database",
      "collection": "your_collection",
      "vectorIndex": "your_vector_index"
    },
    "llm": {
      "provider": "groq|openai|anthropic",
      "model": "model_name",
      "temperature": 0.7,
      "maxTokens": 1000
    },
    "apiKey": "your_api_key",
    "chunking": {
      "strategy": "custom|langchain",
      "chunkSize": 1000,
      "chunkOverlap": 200
    }
  }
}
```

### 2. MongoDB Atlas Configuration

```json
{
  "client-mongodb": {
    "name": "MongoDB Client",
    "vectorDB": {
      "type": "mongodb",
      "connectionString": "mongodb+srv://username:password@cluster.mongodb.net/database",
      "database": "client_knowledge",
      "collection": "documents",
      "vectorIndex": "vector_index",
      "numCandidates": 20,
      "similarity": 0.7
    },
    "llm": {
      "provider": "groq",
      "model": "llama-3.1-8b-instant",
      "temperature": 0.7,
      "maxTokens": 1000
    },
    "groqApiKey": "your_groq_api_key"
  }
}
```

### 3. Supabase Configuration

```json
{
  "client-supabase": {
    "name": "Supabase Client",
    "vectorDB": {
      "type": "supabase",
      "url": "https://your-project.supabase.co",
      "key": "your_supabase_anon_key",
      "database": "client_knowledge",
      "collection": "documents",
      "vectorIndex": "embeddings",
      "numCandidates": 20,
      "similarity": 0.7
    },
    "llm": {
      "provider": "openai",
      "model": "gpt-4",
      "temperature": 0.8,
      "maxTokens": 1500
    },
    "openaiApiKey": "your_openai_api_key"
  }
}
```

### 4. OpenAI Configuration

```json
{
  "client-openai": {
    "name": "OpenAI Client",
    "vectorDB": {
      "type": "mongodb",
      "connectionString": "mongodb+srv://username:password@cluster.mongodb.net/database",
      "database": "client_knowledge",
      "collection": "documents",
      "vectorIndex": "vector_index"
    },
    "llm": {
      "provider": "openai",
      "model": "gpt-3.5-turbo",
      "temperature": 0.7,
      "maxTokens": 1000
    },
    "openaiApiKey": "your_openai_api_key",
    "embeddingProvider": {
      "provider": "openai",
      "model": "text-embedding-3-small"
    }
  }
}
```

### 5. Anthropic Configuration

```json
{
  "client-anthropic": {
    "name": "Anthropic Client",
    "vectorDB": {
      "type": "mongodb",
      "connectionString": "mongodb+srv://username:password@cluster.mongodb.net/database",
      "database": "client_knowledge",
      "collection": "documents",
      "vectorIndex": "vector_index"
    },
    "llm": {
      "provider": "anthropic",
      "model": "claude-3-sonnet-20240229",
      "temperature": 0.6,
      "maxTokens": 2000
    },
    "anthropicApiKey": "your_anthropic_api_key"
  }
}
```

## API Integration

### 1. Client Management Endpoints

```bash
# List all clients
GET /api/client

# Get specific client
GET /api/client/{clientId}

# Create new client
POST /api/client
{
  "clientId": "new-client",
  "config": { /* client configuration */ }
}

# Update client
PUT /api/client/{clientId}
{
  "config": { /* updated configuration */ }
}

# Delete client
DELETE /api/client/{clientId}
```

### 2. Client Chat Endpoints

```bash
# Send message to specific client
POST /api/client/{clientId}/bot
{
  "message": "How do I create an account?",
  "sessionId": "session_123"
}

# Get conversation history
GET /api/client/{clientId}/conversations/{sessionId}

# Delete conversation
DELETE /api/client/{clientId}/conversations/{sessionId}
```

### 3. Client Knowledge Base Management

```bash
# Process documents for client
POST /api/client/{clientId}/knowledge-base/process
{
  "filePaths": ["/path/to/document.pdf"],
  "options": {
    "chunkSize": 1000,
    "chunkOverlap": 200
  }
}

# Search client knowledge base
POST /api/client/{clientId}/knowledge-base/search
{
  "query": "account creation",
  "limit": 5
}
```

## Security Considerations

### 1. API Key Management
- **Never store API keys in the repository**
- **Use environment variables** for default keys
- **Allow client-specific keys** in configuration
- **Rotate keys regularly**

### 2. Data Isolation
- **Each client has separate database collections**
- **No cross-client data access**
- **Client-specific vector indexes**
- **Isolated conversation histories**

### 3. Access Control
- **JWT-based authentication** (coming soon)
- **Role-based authorization**
- **Rate limiting per client**
- **Input validation and sanitization**

## Implementation Steps

### For New Clients:

1. **Choose your providers** (database + LLM)
2. **Set up your infrastructure** (database, API keys)
3. **Create client configuration** using the examples above
4. **Add configuration** to `client-configs.json`
5. **Test the integration** using the API endpoints
6. **Deploy and monitor** your setup

### For Existing Clients:

1. **Review current configuration**
2. **Update to new format** if needed
3. **Test with new system**
4. **Migrate data** if necessary
5. **Update API integrations**

## Troubleshooting

### Common Issues:

1. **"Client configuration not found"**
   - Check client ID spelling
   - Verify configuration exists in `client-configs.json`

2. **"Database connection failed"**
   - Verify connection string
   - Check database permissions
   - Ensure database is accessible

3. **"LLM provider not supported"**
   - Check provider name spelling
   - Verify provider is implemented
   - Check API key validity

4. **"Vector search failed"**
   - Verify vector index exists
   - Check embedding dimensions
   - Ensure documents are properly indexed

### Debug Mode:

```bash
# Enable debug logging
NODE_ENV=development
DEBUG=client:*
```

## Examples

See `bot/examples/client-configurations.json` for complete configuration examples.

## Support

For integration support:
1. Check the logs for error messages
2. Verify your configuration format
3. Test with the provided examples
4. Contact the development team

## Future Enhancements

- **More vector database adapters** (Pinecone, ChromaDB, Weaviate)
- **More LLM providers** (Cohere, Hugging Face, local models)
- **Advanced analytics** and monitoring
- **Multi-language support**
- **Custom model fine-tuning**
- **Advanced security features**
