# Chat Widget Component

A reusable chat widget component that provides AI-powered customer support for African Vibes.

## Features

- 🤖 **AI-Powered Responses** - Uses Groq's Llama 3 model
- 💬 **Real-time Chat** - Instant messaging interface
- 🔄 **Session Management** - Maintains conversation context
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Customizable UI** - Matches African Vibes design system
- 🔒 **Authentication** - Requires user login

## Usage

### Basic Implementation

```jsx
import ChatWidgetContainer from '@/components/ChatWidget';

function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <ChatWidgetContainer />
    </div>
  );
}
```

### Components

- **ChatWidgetContainer** - Main container that manages state
- **ChatWidget** - The actual chat interface
- **ChatToggle** - Floating button to open/close chat

## API Integration

The widget communicates with the backend bot API:

- `POST /api/bot/chat` - Send messages and get responses
- `GET /api/bot/conversations` - Get chat history
- `GET /api/bot/stats` - Get conversation statistics

## Styling

The widget uses CSS variables for theming:

```css
--color-primary: #your-primary-color;
--color-bg: #your-background-color;
--color-text-primary: #your-text-color;
```

## Authentication

Users must be logged in to use the chat widget. The component automatically handles authentication through NextAuth.js.

## Customization

You can customize the widget by modifying:

- **Welcome message** - Change the initial bot greeting
- **Styling** - Update colors and layout
- **Position** - Modify the floating button position
- **Size** - Adjust the chat window dimensions

## Dependencies

- NextAuth.js for authentication
- Lucide React for icons
- Tailwind CSS for styling
