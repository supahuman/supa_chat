# Chat Widget Embedding Guide

This guide explains how clients can embed the Supa Chatbot widget on their websites.

## Quick Start

### 1. Get Your Widget Code

After creating a client configuration, you'll receive a unique widget code:

```html
<!-- Supa Chatbot Widget -->
<script>
  window.SupaChatbotConfig = {
    clientId: 'your-client-id',
    apiUrl: 'https://your-api-domain.com',
    theme: 'light', // or 'dark'
    position: 'bottom-right', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
    primaryColor: '#3B82F6',
    showBranding: true
  };
</script>
<script src="https://your-cdn-domain.com/supa-chatbot.js" async></script>
```

### 2. Add to Your Website

Simply paste the code before the closing `</body>` tag on any page where you want the chat widget to appear.

## Advanced Configuration

### Custom Styling

```html
<script>
  window.SupaChatbotConfig = {
    clientId: 'your-client-id',
    apiUrl: 'https://your-api-domain.com',
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#FF6B6B', // Your brand color
    secondaryColor: '#4ECDC4',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    showBranding: false, // Hide Supa Chatbot branding
    customCSS: `
      .supa-chatbot-widget {
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      }
      .supa-chatbot-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    `
  };
</script>
```

### Multiple Widgets

You can have different configurations for different pages:

```html
<!-- Homepage -->
<script>
  window.SupaChatbotConfig = {
    clientId: 'general-support',
    apiUrl: 'https://your-api-domain.com',
    theme: 'light'
  };
</script>

<!-- Product Pages -->
<script>
  window.SupaChatbotConfig = {
    clientId: 'product-support',
    apiUrl: 'https://your-api-domain.com',
    theme: 'dark',
    primaryColor: '#10B981'
  };
</script>
```

## Framework Integration

### React

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load the widget script
    const script = document.createElement('script');
    script.src = 'https://your-cdn-domain.com/supa-chatbot.js';
    script.async = true;
    document.body.appendChild(script);

    // Set configuration
    window.SupaChatbotConfig = {
      clientId: 'your-client-id',
      apiUrl: 'https://your-api-domain.com',
      theme: 'light'
    };

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  return <div>Your app content</div>;
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
    // Load widget
    const script = document.createElement('script');
    script.src = 'https://your-cdn-domain.com/supa-chatbot.js';
    script.async = true;
    document.body.appendChild(script);

    window.SupaChatbotConfig = {
      clientId: 'your-client-id',
      apiUrl: 'https://your-api-domain.com',
      theme: 'light'
    };
  }
}
</script>
```

### WordPress

Add to your theme's `functions.php`:

```php
function add_supa_chatbot() {
    ?>
    <script>
        window.SupaChatbotConfig = {
            clientId: 'your-client-id',
            apiUrl: 'https://your-api-domain.com',
            theme: 'light'
        };
    </script>
    <script src="https://your-cdn-domain.com/supa-chatbot.js" async></script>
    <?php
}
add_action('wp_footer', 'add_supa_chatbot');
```

### Shopify

Add to your theme's `theme.liquid` before `</body>`:

```liquid
<script>
  window.SupaChatbotConfig = {
    clientId: 'your-client-id',
    apiUrl: 'https://your-api-domain.com',
    theme: 'light'
  };
</script>
<script src="https://your-cdn-domain.com/supa-chatbot.js" async></script>
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
| `customCSS` | string | '' | Additional CSS styles |
| `autoOpen` | boolean | false | Auto-open widget on page load |
| `greetingMessage` | string | 'Hi! How can I help you?' | Initial greeting message |
| `placeholder` | string | 'Type your message...' | Input placeholder text |

## Security Considerations

### API Key Management

```html
<script>
  window.SupaChatbotConfig = {
    clientId: 'your-client-id',
    apiUrl: 'https://your-api-domain.com',
    // Never expose API keys in client-side code
    // Keys are managed server-side through client configuration
  };
</script>
```

### Content Security Policy

Add to your CSP headers:

```
script-src 'self' https://your-cdn-domain.com;
connect-src 'self' https://your-api-domain.com;
```

## Testing

### Local Development

```html
<script>
  window.SupaChatbotConfig = {
    clientId: 'your-client-id',
    apiUrl: 'http://localhost:4000', // Local development
    theme: 'light',
    debug: true // Enable debug logging
  };
</script>
```

### Staging Environment

```html
<script>
  window.SupaChatbotConfig = {
    clientId: 'your-client-id',
    apiUrl: 'https://staging-api.your-domain.com',
    theme: 'light'
  };
</script>
```

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify `clientId` is correct
3. Ensure API URL is accessible
4. Check network connectivity

### Styling Issues

1. Verify CSS is not being overridden
2. Check for conflicting styles
3. Use browser dev tools to inspect elements

### API Errors

1. Check client configuration
2. Verify API endpoints are working
3. Check authentication tokens

## Support

For technical support or questions:
- Email: support@supachatbot.com
- Documentation: https://docs.supachatbot.com
- GitHub Issues: https://github.com/supachatbot/issues
