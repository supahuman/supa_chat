# Supa Chatbot - AI Agent Platform

A comprehensive AI agent platform that allows you to create, deploy, and manage intelligent chatbots for your business.

## 🚀 Features

### 🤖 **AI Agent Builder**

- Create custom AI agents with unique personalities
- Train agents with your business knowledge
- Configure conversation flows and responses
- Real-time agent testing and preview

### 💬 **Embeddable Chat Widget**

- Lightweight, modular chat widget
- Conversation context memory
- Customizable themes and positioning
- Easy integration with any website

### 🔧 **Developer-Friendly**

- RESTful API for all operations
- Modular widget architecture
- Comprehensive documentation
- Multiple integration examples

### 💳 **Subscription Management**

- Stripe-powered payment system
- Multiple pricing tiers
- Usage tracking and analytics
- Automated billing

## 🏗️ Architecture

### Frontend (Next.js)

```
chat-widget/
├── components/
│   ├── AgentBuilder/     # Agent creation interface
│   ├── ChatWidget/       # Embeddable widget components
│   ├── Landing/          # Marketing pages
│   └── Authentication/   # User auth components
├── public/embed/         # Widget scripts
└── lib/                  # Utilities and services
```

### Backend (Node.js/Express)

```
bot/
├── controller/           # API controllers
├── models/              # Database models
├── routes/              # API routes
├── services/            # Business logic
└── middleware/          # Authentication & validation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Stripe account (for payments)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/supa-chatbot.git
cd supa-chatbot
```

2. **Install dependencies**

```bash
# Frontend
cd chat-widget
npm install

# Backend
cd ../bot
npm install
```

3. **Environment Setup**

```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/supa-chatbot
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Frontend (.env.local)
NEXT_PUBLIC_BOT_API_URL=http://localhost:4000
NEXT_PUBLIC_EMBED_URL=http://localhost:3000
NEXT_PUBLIC_AGENT_ID=agent_1234567890_abcdef123
NEXT_PUBLIC_COMPANY_API_KEY=sk_your_company_api_key
NEXT_PUBLIC_USER_ID=user_1234567890
```

4. **Start development servers**

```bash
# Backend (Terminal 1)
cd bot
npm run dev

# Frontend (Terminal 2)
cd chat-widget
npm run dev
```

## 📖 Documentation

- [Widget Embedding Guide](chat-widget/docs/EMBEDDING_GUIDE.md)
- [API Documentation](bot/docs/API_OVERVIEW.md)
- [Client Integration Guide](bot/docs/CLIENT_INTEGRATION_GUIDE.md)
- [Quick Reference](bot/docs/QUICK_REFERENCE.md)

## 🔧 Recent Improvements

### ✅ **Conversation Context**

- Agents now maintain conversation history
- Natural conversation flow
- Context-aware responses

### ✅ **Modular Widget Architecture**

- Separated widget components for better maintainability
- Easy customization and updates
- Performance optimizations

### ✅ **Payment System**

- Stripe integration for subscriptions
- Multiple pricing tiers
- Automated billing and usage tracking

### ✅ **Clean Code Architecture**

- Separated concerns
- Reusable components
- Comprehensive error handling

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@supachatbot.com
- 📚 Documentation: [docs.supachatbot.com](https://docs.supachatbot.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/supa-chatbot/issues)

## 🙏 Acknowledgments

- OpenAI for GPT models
- Stripe for payment processing
- MongoDB for database
- Next.js for frontend framework
- Express.js for backend framework
