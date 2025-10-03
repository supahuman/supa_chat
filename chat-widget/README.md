# Supa Chatbot Widget

A powerful, embeddable chat widget for websites with multi-tenant support and customizable AI providers.

## Features

- 🤖 **Multi-LLM Support**: Groq, OpenAI, Anthropic
- 🗄️ **Multi-Database Support**: MongoDB, Supabase, Pinecone, ChromaDB
- 🎨 **Customizable**: Themes, colors, positioning, fonts
- 📱 **Responsive**: Works on all devices
- ⚡ **Lightweight**: ~15KB minified
- 🔧 **Framework Agnostic**: Works with any website
- 🎯 **Easy Integration**: One-line embed code

## Quick Start

### 1. Create a Client

1. Navigate to the Client Management page
2. Click "Add New Client"
3. Configure your database and LLM settings
4. Save your configuration

### 2. Generate Widget Code

1. Select your client from the list
2. Customize the widget appearance
3. Copy the generated embed code
4. Paste it into your website

### 3. Embed on Your Website

```html
<!-- Add this before </body> -->
<script>
  window.SupaChatbotConfig = {
    clientId: 'your-client-id',
    apiUrl: 'https://your-api-domain.com',
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#3B82F6'
  };
</script>
<script src="https://your-cdn-domain.com/supa-chatbot.js" async></script>
```

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Project Structure

```
chat-widget/
├── app/                    # Next.js app directory
│   ├── clients/           # Client management page
│   ├── layout.js          # Root layout with navigation
│   └── page.js            # Home page
├── components/
│   ├── ChatWidget/        # Chat widget components
│   ├── ClientManagement/  # Client management components
│   ├── Landing/           # Landing page components
│   └── Navigation/        # Navigation components
├── public/
│   ├── supa-chatbot.js    # Embeddable widget script
│   └── example.html       # Example implementation
├── store/
│   └── botApi.js          # RTK Query API configuration
└── docs/
    └── EMBEDDING_GUIDE.md # Detailed embedding guide
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientId` | string | required | Your unique client identifier |
| `apiUrl` | string | required | API endpoint URL |
| `theme` | string | 'light' | 'light' or 'dark' |
| `position` | string | 'bottom-right' | Widget position on screen |
| `primaryColor` | string | '#3B82F6' | Primary brand color |
| `secondaryColor` | string | '#1E40AF' | Secondary brand color |
| `borderRadius` | string | '8px' | Widget border radius |
| `fontFamily` | string | 'Inter' | Font family |
| `showBranding` | boolean | true | Show Supa Chatbot branding |
| `autoOpen` | boolean | false | Auto-open widget on page load |
| `greetingMessage` | string | 'Hi! How can I help you?' | Initial greeting |
| `placeholder` | string | 'Type your message...' | Input placeholder |

## API Integration

The widget communicates with your backend API:

### Endpoints

- `POST /api/client/{clientId}/bot` - Send chat message
- `GET /api/client` - List all clients
- `POST /api/client` - Create new client
- `PUT /api/client/{clientId}` - Update client
- `DELETE /api/client/{clientId}` - Delete client

### Message Format

```javascript
// Request
{
  "message": "Hello, how can I help?",
  "sessionId": "session_123456789"
}

// Response
{
  "success": true,
  "response": "Hi! I'm here to help you with any questions.",
  "sessionId": "session_123456789"
}
```

## Customization

### CSS Customization

```html
<script>
  window.SupaChatbotConfig = {
    // ... other config
    customCSS: `
      .supa-chatbot-widget {
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }
      .supa-chatbot-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    `
  };
</script>
```

### JavaScript API

```javascript
// Open widget
window.SupaChatbot.open();

// Close widget
window.SupaChatbot.close();

// Toggle widget
window.SupaChatbot.toggle();

// Send message programmatically
window.SupaChatbot.sendMessage('Hello!');

// Add custom message
window.SupaChatbot.addMessage('Custom message', 'bot');

// Update configuration
window.SupaChatbot.updateConfig({
  theme: 'dark',
  primaryColor: '#FF6B6B'
});
```

## Framework Examples

### React

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://your-cdn-domain.com/supa-chatbot.js';
    script.async = true;
    document.body.appendChild(script);

    window.SupaChatbotConfig = {
      clientId: 'your-client-id',
      apiUrl: 'https://your-api-domain.com'
    };

    return () => document.body.removeChild(script);
  }, []);

  return <div>Your app</div>;
}
```

### Vue.js

```vue
<template>
  <div id="app">
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://your-cdn-domain.com/supa-chatbot.js';
    script.async = true;
    document.body.appendChild(script);

    window.SupaChatbotConfig = {
      clientId: 'your-client-id',
      apiUrl: 'https://your-api-domain.com'
    };
  }
}
</script>
```

### WordPress

Add to `functions.php`:

```php
function add_supa_chatbot() {
    ?>
    <script>
        window.SupaChatbotConfig = {
            clientId: 'your-client-id',
            apiUrl: 'https://your-api-domain.com'
        };
    </script>
    <script src="https://your-cdn-domain.com/supa-chatbot.js" async></script>
    <?php
}
add_action('wp_footer', 'add_supa_chatbot');
```

## Security

- API keys are managed server-side
- Client configurations are validated
- CORS headers are properly configured
- Content Security Policy compatible

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: [docs.supachatbot.com](https://docs.supachatbot.com)
- Email: support@supachatbot.com
- GitHub Issues: [github.com/supachatbot/issues](https://github.com/supachatbot/issues)