# Changelog

All notable changes to the Supa Chatbot project will be documented in this file.

## [1.2.0] - 2024-10-15

### 🎯 Added

- **Conversation Context Memory**: Agents now maintain conversation history for natural dialogue flow
- **Modular Widget Architecture**: Separated widget into core, UI, API, and styles components
- **WidgetLoader Component**: Clean React component for easy widget integration
- **Payment System**: Complete Stripe integration with subscription management
- **Environment Variable Validation**: Proper error handling for missing configuration

### 🔧 Changed

- **Widget Script Loading**: Fixed async timing issues with proper script loading sequence
- **API Authentication**: Improved JWT token handling and user session management
- **Error Handling**: Enhanced error messages and debugging capabilities
- **Code Organization**: Separated widget logic from landing page components

### 🐛 Fixed

- **Conversation Context Loss**: Agents no longer lose track of previous messages
- **Environment Variable Typos**: Fixed `gent_` → `agent_` and `mbed_` → `embed_` typos
- **Payment Redirects**: Fixed success redirects to agent-builder page
- **ObjectId Casting**: Fixed MongoDB ObjectId casting errors in payment middleware
- **Suspense Boundaries**: Added proper Suspense boundaries for Next.js 15 compatibility

### 🚀 Performance

- **Conversation History Limit**: Limited to last 10 messages to prevent token overflow
- **Modular Loading**: Widget components load independently for better performance
- **Clean Architecture**: Separated concerns for better maintainability

### 📚 Documentation

- **Updated Embedding Guide**: Reflects new widget configuration structure
- **Added README**: Comprehensive project overview and setup instructions
- **Code Comments**: Enhanced code documentation and inline comments

## [1.1.0] - 2024-10-14

### 🎯 Added

- **Agent Builder Interface**: Complete UI for creating and managing AI agents
- **Knowledge Base Management**: Upload and manage agent training data
- **Real-time Chat Testing**: Test agents before deployment
- **User Authentication**: Google OAuth and email/password signup

### 🔧 Changed

- **Database Schema**: Updated models for agents, users, and conversations
- **API Structure**: RESTful endpoints for all operations
- **Frontend Architecture**: Component-based React structure

## [1.0.0] - 2024-10-13

### 🎯 Added

- **Initial Release**: Basic chatbot functionality
- **Widget Embedding**: Simple HTML/JavaScript widget
- **Backend API**: Node.js/Express server
- **Database Integration**: MongoDB for data persistence

---

## Migration Guide

### From v1.1.0 to v1.2.0

#### Widget Configuration Changes

```javascript
// Old configuration
window.SupaChatbotConfig = {
  clientId: "your-client-id",
  apiUrl: "https://api.example.com",
  theme: "light",
};

// New configuration
window.SupaChatbotConfig = {
  apiUrl: "https://api.example.com",
  agentId: "agent_1234567890_abcdef123",
  companyApiKey: "sk_your_company_api_key",
  userId: "user_1234567890",
  name: "Your AI Assistant",
  description: "AI Agent created with Miana Agent Builder",
  position: "bottom-right",
  theme: "default",
  showWelcomeMessage: true,
  autoOpen: false,
};
```

#### Environment Variables

```bash
# Add these new environment variables
NEXT_PUBLIC_AGENT_ID=agent_1234567890_abcdef123
NEXT_PUBLIC_COMPANY_API_KEY=sk_your_company_api_key
NEXT_PUBLIC_USER_ID=user_1234567890
```

#### React Integration

```jsx
// Old way - manual script loading
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://cdn.example.com/widget.js";
  document.head.appendChild(script);
}, []);

// New way - use WidgetLoader component
import WidgetLoader from "./components/ChatWidget/WidgetLoader";

function App() {
  return (
    <div>
      <YourContent />
      <WidgetLoader />
    </div>
  );
}
```
