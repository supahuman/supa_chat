# Knowledge Base API Overview

This document provides a comprehensive overview of all knowledge base APIs available in the chatbot system.

## Architecture Overview

The system supports two chunking strategies:

1. **Custom Chunking** - Fast, lightweight processing for markdown files
2. **LangChain Chunking** - Enterprise-grade multi-format document processing

## API Endpoints Summary

### Main Knowledge Base API
**Base URL:** `/api/bot/knowledge-base/`

| Endpoint | Method | Description | Auth Level |
|----------|--------|-------------|------------|
| `/info` | GET | Get KB information | Private |
| `/load` | POST | Load complete KB | Admin |
| `/update` | POST | Update KB from web crawl | Admin |
| `/test` | POST | Test KB with sample queries | Admin |
| `/search` | POST | Search KB content | Admin |
| `/crawled` | DELETE | Clear crawled content | Admin |
| `/crawl-stats` | GET | Get crawl statistics | Admin |

### LangChain Knowledge Base API
**Base URL:** `/api/bot/knowledge-base/langchain/`

| Endpoint | Method | Description | Auth Level |
|----------|--------|-------------|------------|
| `/process` | POST | Process client documents | Private |
| `/supported-types` | GET | Get supported file types | Private |
| `/config` | GET | Get configuration | Private |
| `/config` | PUT | Update configuration | Admin |
| `/test` | POST | Test document processing | Admin |
| `/stats` | GET | Get processing statistics | Private |
| `/toggle` | POST | Enable/disable LangChain | Admin |

## Quick Start Guide

### 1. Check Current Configuration
```bash
# Check main KB status
GET /api/bot/knowledge-base/info

# Check LangChain status
GET /api/bot/knowledge-base/langchain/config
```

### 2. Load Your Knowledge Base
```bash
# Load markdown knowledge base
POST /api/bot/knowledge-base/load
```

### 3. Enable LangChain (Optional)
```bash
# Enable LangChain for client documents
POST /api/bot/knowledge-base/langchain/toggle
{"enabled": true}
```

### 4. Process Client Documents (LangChain)
```bash
# Process client documents
POST /api/bot/knowledge-base/langchain/process
{
  "filePaths": ["/path/to/client-doc.pdf"],
  "options": {"clientId": "client123"}
}
```

## Configuration Options

### Environment Variables

#### Core Configuration
```bash
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/supa_chatbot

# Bot
BOT_ENABLED=true
ALLOW_PUBLIC_BOT=true
```

#### AI Services
```bash
# AI APIs
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# Vector Database
VECTOR_PROVIDER=atlas
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

#### Chunking Strategy
```bash
# Chunking Strategy (custom | langchain)
CHUNKING_STRATEGY=custom

# LangChain Configuration (only when CHUNKING_STRATEGY=langchain)
LANGCHAIN_CHUNK_SIZE=1000
LANGCHAIN_CHUNK_OVERLAP=200
LANGCHAIN_SUPPORTED_TYPES=txt,md,pdf,docx,csv,json,html
```

#### Web Crawler
```bash
# Web Crawler (for knowledge base updates)
CRAWLER_ENABLED=true
CRAWLER_BASE_URL=https://help.africanvibes.com
CRAWLER_MAX_PAGES=50
CRAWLER_DELAY=1000
```

## Service Tiers

### Basic Tier (Custom Chunking)
- ✅ Markdown processing
- ✅ Text file processing
- ✅ Web crawling
- ✅ Fast performance
- ✅ Zero dependencies

**Use Case:** Internal documentation, simple knowledge bases

### Professional Tier (LangChain Chunking)
- ✅ All Basic Tier features
- ✅ PDF document processing
- ✅ Word document processing
- ✅ CSV data processing
- ✅ JSON configuration processing
- ✅ HTML content processing
- ✅ Advanced metadata extraction

**Use Case:** Client document processing, enterprise knowledge bases

## File Type Support Matrix

| File Type | Custom | LangChain | Use Case |
|-----------|--------|-----------|----------|
| `.md` | ✅ | ✅ | Documentation |
| `.txt` | ✅ | ✅ | Plain text |
| `.pdf` | ❌ | ✅ | Reports, manuals |
| `.docx` | ❌ | ✅ | Word documents |
| `.csv` | ❌ | ✅ | Data files |
| `.json` | ❌ | ✅ | Configuration |
| `.html` | ❌ | ✅ | Web content |

## Performance Comparison

| Metric | Custom Chunking | LangChain Chunking |
|--------|----------------|-------------------|
| **Processing Speed** | 1000 chunks/sec | 100 chunks/sec |
| **Memory Usage** | Low | High |
| **Dependencies** | 0 | 7+ packages |
| **Setup Time** | Instant | 2-3 minutes |
| **File Size Limit** | No limit | Depends on memory |
| **Concurrent Processing** | Excellent | Good |

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional details if available"]
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

### Required Headers
```bash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Permission Levels
- **Private**: Requires valid JWT token
- **Admin**: Requires admin role in JWT token

## Rate Limiting

### Default Limits
- **API Calls**: 100 requests/minute per user
- **File Uploads**: 10 files/minute per user
- **Large Documents**: 1 document/minute per user

### Headers
```bash
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Monitoring and Logging

### Health Check
```bash
GET /health
```

### Log Levels
- `ERROR`: System errors, failed operations
- `WARN`: Non-critical issues, fallbacks
- `INFO`: Normal operations, status updates
- `DEBUG`: Detailed debugging information

### Metrics Available
- Request count and response times
- Chunking performance metrics
- Database operation statistics
- Memory and CPU usage

## Security Considerations

### Data Protection
- All documents are processed in memory only
- No temporary files are stored on disk
- Database connections use SSL/TLS
- API keys are stored as environment variables

### Access Control
- JWT-based authentication
- Role-based authorization
- Rate limiting per user
- Input validation and sanitization

## Troubleshooting

### Common Issues

#### 1. Knowledge Base Not Loading
```bash
# Check if bot is enabled
GET /api/bot/knowledge-base/info

# Check MongoDB connection
GET /health
```

#### 2. LangChain Not Working
```bash
# Check if LangChain is enabled
GET /api/bot/knowledge-base/langchain/config

# Verify dependencies are installed
pnpm list langchain
```

#### 3. File Processing Fails
```bash
# Check supported file types
GET /api/bot/knowledge-base/langchain/supported-types

# Test with sample content
POST /api/bot/knowledge-base/langchain/test
```

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development
DEBUG=bot:*
```

## Migration Guide

### From Custom to LangChain
1. Install LangChain dependencies: `pnpm install`
2. Set environment: `CHUNKING_STRATEGY=langchain`
3. Restart the service
4. Test with: `GET /api/bot/knowledge-base/langchain/config`

### From LangChain to Custom
1. Set environment: `CHUNKING_STRATEGY=custom`
2. Restart the service
3. Verify: `GET /api/bot/knowledge-base/info`

## Support and Documentation

### Additional Resources
- [Custom Chunking API](./CUSTOM_CHUNKING_API.md)
- [LangChain API](./LANGCHAIN_API.md)
- [CLI Tools](../scripts/chunking-control.js)

### Getting Help
1. Check the logs for error messages
2. Verify environment configuration
3. Test with the provided test endpoints
4. Review the API documentation

### Contributing
- Follow the existing code structure
- Add tests for new features
- Update documentation for API changes
- Use consistent error handling patterns
