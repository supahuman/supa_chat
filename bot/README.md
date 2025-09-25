# African Vibes Bot

An AI-powered customer service bot using RAG (Retrieval-Augmented Generation) to provide intelligent responses for the African Vibes event platform.

## Features

- 🤖 **AI-Powered Responses**: Uses Groq's Llama 3 model for fast, intelligent responses
- 📚 **Knowledge Base**: Vector database with event platform knowledge
- 💬 **Conversation Management**: Tracks chat history and user sessions
- 🔍 **Context-Aware**: Uses conversation history for better responses
- 🎯 **Domain-Specific**: Tailored for event platform support

## Architecture

```
bot/
├── services/
│   ├── groqService.js          # Groq LLM integration
│   ├── vectorDBService.js      # ChromaDB vector database
│   ├── ragService.js           # RAG logic and orchestration
│   └── conversationService.js  # Chat history management
├── routes/
│   └── chatRoutes.js           # API endpoints
├── models/
│   └── Conversation.js         # MongoDB schema
├── knowledge-base/
│   ├── events/                 # Event-related knowledge
│   ├── payments/               # Payment and refund info
│   └── user-support/           # Account and technical support
└── utils/
    └── (utility functions)
```

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Bot Configuration
GROQ_API_KEY=your_groq_api_key_here
CHROMA_DB_URL=http://localhost:8000
BOT_ENABLED=true
```

### 2. Install Dependencies

```bash
npm install groq-sdk chromadb
```

### 3. Setup ChromaDB

Install and run ChromaDB:

```bash
# Using Docker (recommended)
docker run -p 8000:8000 chromadb/chroma

# Or using pip
pip install chromadb
chroma run --host localhost --port 8000
```

### 4. Initialize Knowledge Base

```javascript
import ragService from './bot/services/ragService.js';

// Add knowledge base content
await ragService.addToKnowledgeBase('Your knowledge content here', {
  category: 'events',
  source: 'manual',
});
```

## API Endpoints

### Chat

- `POST /api/bot/chat` - Send a message to the bot
- `GET /api/bot/conversations` - Get user's conversation history
- `GET /api/bot/conversation/:sessionId` - Get specific conversation
- `POST /api/bot/conversation/:sessionId/close` - Close a conversation
- `GET /api/bot/stats` - Get conversation statistics
- `POST /api/bot/test` - Test bot functionality

### Example Usage

```javascript
// Send a message
const response = await fetch('/api/bot/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    message: 'How do I create an event?',
    sessionId: 'optional_session_id',
  }),
});

const result = await response.json();
console.log(result.response); // Bot's response
```

## Knowledge Base

The bot uses a vector database to store and retrieve relevant information. Knowledge is organized into categories:

- **Events**: Event creation, management, promotion
- **Payments**: Refunds, billing, payment methods
- **User Support**: Account management, technical issues

### Adding Knowledge

```javascript
import ragService from './bot/services/ragService.js';

// Add new knowledge
await ragService.addToKnowledgeBase(
  "To create an event, go to your dashboard and click 'Create Event'...",
  {
    category: 'events',
    source: 'user_guide',
    tags: ['create', 'event', 'dashboard'],
  }
);
```

## Testing

Run the test script to verify bot functionality:

```bash
node bot/test-bot.js
```

## Configuration

### Model Settings

- **LLM**: Llama 3 8B (via Groq)
- **Embeddings**: text-embedding-3-small
- **Vector DB**: ChromaDB
- **Temperature**: 0.7 (balanced creativity/accuracy)

### Performance

- **Response Time**: 1-3 seconds
- **Cost**: ~$0.05 per 1M tokens
- **Concurrent Users**: Limited by Groq rate limits

## Troubleshooting

### Common Issues

1. **"Groq connection failed"**

   - Check `GROQ_API_KEY` environment variable
   - Verify API key is valid and has credits

2. **"Vector DB connection failed"**

   - Ensure ChromaDB is running on port 8000
   - Check `CHROMA_DB_URL` environment variable

3. **"No relevant information found"**
   - Add more knowledge base content
   - Check embedding generation

### Debug Mode

Enable debug logging:

```javascript
// In your environment
DEBUG = true;
```

## Future Enhancements

- [ ] Multi-language support
- [ ] Voice integration
- [ ] Advanced analytics
- [ ] Custom model fine-tuning
- [ ] Integration with help desk systems

## Support

For bot-related issues, contact the development team or check the logs in your application.
