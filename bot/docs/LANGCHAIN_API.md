# LangChain Knowledge Base API

This document describes the LangChain-specific API endpoints for advanced document processing and chunking.

## Base URL
```
/api/bot/knowledge-base/langchain
```

## Authentication
All endpoints require authentication. Admin endpoints require admin privileges.

## Endpoints

### 1. Process Client Documents
**POST** `/process`

Process multiple documents using LangChain chunking.

**Request Body:**
```json
{
  "filePaths": [
    "/path/to/document1.pdf",
    "/path/to/document2.docx",
    "/path/to/data.csv"
  ],
  "options": {
    "continueOnError": true,
    "metadata": {
      "clientId": "client123",
      "project": "project-name"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "count": 45,
  "chunks": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Document Title",
      "category": "documentation",
      "fileType": "pdf"
    }
  ]
}
```

### 2. Get Supported File Types
**GET** `/supported-types`

Get list of supported file types for LangChain processing.

**Response:**
```json
{
  "success": true,
  "supportedTypes": ["txt", "md", "pdf", "docx", "csv", "json", "html"],
  "strategy": "langchain",
  "isEnabled": true
}
```

### 3. Get Configuration
**GET** `/config`

Get current LangChain configuration.

**Response:**
```json
{
  "success": true,
  "isEnabled": true,
  "config": {
    "name": "LangChain Chunking",
    "description": "Enterprise-grade multi-format document processing",
    "supportedTypes": ["txt", "md", "pdf", "docx", "csv", "json", "html"],
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "features": [
      "PDF text extraction",
      "Word document processing",
      "CSV data parsing",
      "JSON structure analysis",
      "HTML content extraction",
      "Advanced text splitting",
      "Metadata extraction"
    ]
  },
  "currentConfig": {
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "supportedTypes": ["txt", "md", "pdf", "docx", "csv", "json", "html"]
  }
}
```

### 4. Update Configuration
**PUT** `/config` (Admin only)

Update LangChain chunking configuration.

**Request Body:**
```json
{
  "chunkSize": 1500,
  "chunkOverlap": 300,
  "supportedTypes": ["pdf", "docx", "csv", "json"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "LangChain configuration updated successfully",
  "config": {
    "chunkSize": 1500,
    "chunkOverlap": 300,
    "supportedTypes": ["pdf", "docx", "csv", "json"]
  }
}
```

### 5. Test Processing
**POST** `/test` (Admin only)

Test LangChain document processing with sample content.

**Request Body:**
```json
{
  "testContent": "This is a sample document for testing chunking functionality. It should be split into appropriate chunks based on the configuration.",
  "filePath": "/optional/path/to/test/file.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "chunks": [
    {
      "content": "This is a sample document for testing chunking functionality...",
      "title": "test-1234567890",
      "category": "general",
      "fileType": "txt",
      "chunkIndex": 0
    }
  ],
  "totalChunks": 1,
  "summary": {
    "totalCharacters": 150,
    "averageChunkSize": 150,
    "categories": ["general"]
  }
}
```

### 6. Get Statistics
**GET** `/stats`

Get LangChain processing statistics.

**Response:**
```json
{
  "success": true,
  "totalDocuments": 1250,
  "langchainDocuments": 450,
  "customDocuments": 800,
  "categories": {
    "documentation": 200,
    "data": 150,
    "configuration": 100
  },
  "chunkingInfo": {
    "strategy": "langchain",
    "supportedTypes": ["txt", "md", "pdf", "docx", "csv", "json", "html"],
    "isLangChainEnabled": true
  },
  "isLangChainEnabled": true
}
```

### 7. Toggle LangChain
**POST** `/toggle` (Admin only)

Enable or disable LangChain chunking.

**Request Body:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "LangChain chunking enabled",
  "currentStrategy": "langchain",
  "isLangChainEnabled": true
}
```

## Supported File Types

| Type | Extension | Description |
|------|-----------|-------------|
| Text | `.txt` | Plain text files |
| Markdown | `.md` | Markdown documentation |
| PDF | `.pdf` | PDF documents |
| Word | `.docx` | Microsoft Word documents |
| CSV | `.csv` | Comma-separated values |
| JSON | `.json` | JSON data files |
| HTML | `.html` | HTML web pages |

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description",
  "details": ["Additional error details if available"]
}
```

## Usage Examples

### Enable LangChain and Process Documents

```bash
# 1. Enable LangChain
curl -X POST http://localhost:4000/api/bot/knowledge-base/langchain/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"enabled": true}'

# 2. Process documents
curl -X POST http://localhost:4000/api/bot/knowledge-base/langchain/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "filePaths": ["/path/to/manual.pdf", "/path/to/data.csv"],
    "options": {
      "continueOnError": true
    }
  }'
```

### Test Configuration

```bash
# Test with sample content
curl -X POST http://localhost:4000/api/bot/knowledge-base/langchain/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "testContent": "This is a test document to verify chunking works correctly."
  }'
```

## Integration with Main Knowledge Base

The LangChain API works alongside the main knowledge base API:

- **Main API** (`/api/bot/knowledge-base/`): Handles your existing markdown knowledge base
- **LangChain API** (`/api/bot/knowledge-base/langchain/`): Handles client document processing

Both APIs store data in the same MongoDB collection and can be searched together.
