# Knowledge Base API Quick Reference

## 🚀 Quick Commands

### Check Status
```bash
# Main KB status
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/bot/knowledge-base/info

# LangChain status
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/bot/knowledge-base/langchain/config
```

### Load Knowledge Base
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/bot/knowledge-base/load
```

### Enable LangChain
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"enabled": true}' \
  http://localhost:4000/api/bot/knowledge-base/langchain/toggle
```

### Process Documents (LangChain)
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"filePaths": ["/path/to/doc.pdf"]}' \
  http://localhost:4000/api/bot/knowledge-base/langchain/process
```

## 📋 Environment Variables

```bash
# Core
BOT_ENABLED=true
CHUNKING_STRATEGY=custom  # or 'langchain'

# AI Services
GROQ_API_KEY=your_key
OPENAI_API_KEY=your_key

# LangChain (when enabled)
LANGCHAIN_CHUNK_SIZE=1000
LANGCHAIN_CHUNK_OVERLAP=200
```

## 🔧 CLI Commands

```bash
# Check chunking status
pnpm chunking:status

# List strategies
pnpm chunking:list

# Switch to LangChain
pnpm chunking:switch langchain

# Switch to custom
pnpm chunking:switch custom

# Test file type support
pnpm chunking:test pdf
```

## 📊 File Type Support

| Type | Custom | LangChain |
|------|--------|-----------|
| `.md` | ✅ | ✅ |
| `.txt` | ✅ | ✅ |
| `.pdf` | ❌ | ✅ |
| `.docx` | ❌ | ✅ |
| `.csv` | ❌ | ✅ |
| `.json` | ❌ | ✅ |
| `.html` | ❌ | ✅ |

## 🎯 Use Cases

### Custom Chunking
- ✅ Internal documentation
- ✅ Markdown knowledge bases
- ✅ Fast processing
- ✅ Zero dependencies

### LangChain Chunking
- ✅ Client document processing
- ✅ Multi-format support
- ✅ Enterprise features
- ✅ Advanced metadata

## 🔍 Common Endpoints

### Main KB
- `GET /info` - KB information
- `POST /load` - Load KB
- `POST /search` - Search content
- `POST /test` - Test queries

### LangChain KB
- `GET /config` - Configuration
- `POST /process` - Process documents
- `GET /supported-types` - File types
- `POST /toggle` - Enable/disable

## ⚡ Performance

| Metric | Custom | LangChain |
|--------|--------|-----------|
| Speed | 1000 chunks/sec | 100 chunks/sec |
| Memory | Low | High |
| Dependencies | 0 | 7+ |

## 🛠️ Troubleshooting

### KB Not Loading
```bash
# Check bot status
GET /api/bot/knowledge-base/info

# Check health
GET /health
```

### LangChain Issues
```bash
# Check config
GET /api/bot/knowledge-base/langchain/config

# Test processing
POST /api/bot/knowledge-base/langchain/test
```

### File Processing Fails
```bash
# Check supported types
GET /api/bot/knowledge-base/langchain/supported-types

# Verify file path
ls -la /path/to/file.pdf
```

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔐 Authentication

```bash
# Required header
Authorization: Bearer YOUR_JWT_TOKEN

# Admin endpoints require admin role
```

## 📈 Monitoring

```bash
# Health check
GET /health

# KB stats
GET /api/bot/knowledge-base/info

# LangChain stats
GET /api/bot/knowledge-base/langchain/stats
```

## 🚨 Error Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 💡 Tips

1. **Start with Custom**: Use custom chunking for simple markdown KBs
2. **Upgrade to LangChain**: When you need PDF/Word processing
3. **Monitor Performance**: Check stats regularly
4. **Test First**: Use test endpoints before production
5. **Backup Data**: Always backup before major changes

## 📚 Full Documentation

- [API Overview](./API_OVERVIEW.md)
- [Custom Chunking API](./CUSTOM_CHUNKING_API.md)
- [LangChain API](./LANGCHAIN_API.md)
