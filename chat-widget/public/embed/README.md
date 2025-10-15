# SupaChatbot Embed Widget

This directory contains the modular embed widget system for SupaChatbot.

## File Structure

```
embed/
├── embed-modular.js    # Main entry point that loads all modules
├── widget-core.js      # Core functionality and state management
├── widget-ui.js        # UI components, templates, and icons
├── widget-api.js       # API communication with backend
├── widget-styles.js    # CSS styling for the widget
├── index.js           # Alternative entry point
└── README.md          # This file
```

## Usage

### Option 1: Direct Modular Loading

```html
<script>
  window.SupaChatbotConfig = {
    apiUrl: "https://your-api-domain.com",
    agentId: "your_agent_id",
    companyApiKey: "your_api_key",
    userId: "your_user_id",
    name: "AI Assistant",
    description: "How can I help you today?",
  };
</script>
<script src="https://your-domain.com/embed/embed-modular.js" async></script>
```

### Option 2: Using Index

```html
<script src="https://your-domain.com/embed/index.js" async></script>
```

## Module Dependencies

The modules load in this order:

1. `widget-core.js` - Core functionality
2. `widget-ui.js` - UI components
3. `widget-api.js` - API communication
4. `widget-styles.js` - CSS styling

## Benefits of Modular Approach

- **Maintainability**: Each module has a single responsibility
- **Reusability**: Modules can be used independently
- **Debugging**: Easier to debug specific functionality
- **Performance**: Can load modules on demand
- **Development**: Multiple developers can work on different modules
- **Testing**: Each module can be tested independently

## File Sizes

- **Original**: `embed.js` (598 lines)
- **Modular**:
  - `widget-core.js` (~108 lines)
  - `widget-ui.js` (~150 lines)
  - `widget-api.js` (~60 lines)
  - `widget-styles.js` (~200 lines)
  - `embed-modular.js` (~50 lines)

## Configuration

The widget accepts the following configuration options:

| Option               | Type    | Default           | Description           |
| -------------------- | ------- | ----------------- | --------------------- |
| `apiUrl`             | string  | Required          | Your backend API URL  |
| `agentId`            | string  | Required          | Your agent identifier |
| `companyApiKey`      | string  | Required          | Your API key          |
| `userId`             | string  | Required          | User identifier       |
| `name`               | string  | "AI Assistant"    | Widget title          |
| `description`        | string  | "How can I help?" | Welcome message       |
| `position`           | string  | "bottom-right"    | Widget position       |
| `theme`              | string  | "default"         | Widget theme          |
| `showWelcomeMessage` | boolean | true              | Show welcome message  |
| `autoOpen`           | boolean | false             | Auto-open widget      |
