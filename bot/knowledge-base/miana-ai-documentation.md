# Miana AI Platform Documentation

## What is Miana AI?

Miana AI is a comprehensive platform for creating, deploying, and managing intelligent AI agents. Our platform allows businesses to build custom chatbots that can understand their business, answer customer questions, and provide personalized assistance 24/7.

### Key Features:
- Natural conversation flow with context memory
- Knowledge base integration
- Customizable agent personalities
- Multi-platform deployment
- Real-time analytics and insights
- Easy widget embedding
- RESTful API for custom integrations

## Getting Started

### Creating Your First Agent

1. **Sign Up**: Create your Miana AI account and verify your email address
2. **Choose a Plan**: Select from Starter ($29/month), Professional ($99/month), or Enterprise ($299/month)
3. **Create Agent**: Use our Agent Builder to define your agent's personality and capabilities
4. **Add Knowledge**: Upload documents, FAQs, or manually input information for your agent to learn from
5. **Test & Deploy**: Test your agent in the preview mode, then deploy to your website

### Pro Tips for New Users:
- Start with a simple agent focused on your most common customer questions
- Gradually add more complex capabilities as you learn the platform
- Use the preview mode extensively before deploying to production
- Regularly review conversation logs to improve your agent's responses

## Agent Configuration

### Essential Settings

#### Agent Personality
Define how your agent communicates:
- **Tone**: Professional, friendly, casual, or technical
- **Response Style**: Concise, detailed, or conversational
- **Specialization**: Customer support, sales, technical help, etc.

#### Knowledge Base
Upload and organize your content:
- PDF documents, Word files, and text files
- FAQ sections and knowledge articles
- Product catalogs and service descriptions
- Company policies and procedures

#### Conversation Flow
Configure how your agent handles conversations:
- Welcome messages and greetings
- Escalation to human agents when needed
- Conversation timeouts and session management
- Follow-up questions and clarification requests

## Widget Embedding

### Easy Integration
Add your AI agent to any website with just a few lines of code:

```html
<!-- Add this code before </body> tag -->
<script>
  window.SupaChatbotConfig = {
    apiUrl: 'https://your-api-domain.com',
    agentId: 'agent_1234567890_abcdef123',
    companyApiKey: 'sk_your_company_api_key',
    userId: 'user_1234567890',
    name: 'Your AI Assistant',
    description: 'AI Agent created with Miana Agent Builder',
    position: 'bottom-right',
    theme: 'default',
    showWelcomeMessage: true,
    autoOpen: false
  };
</script>
<script src="https://your-cdn-domain.com/embed/embed-modular.js" async></script>
```

### Customization Options
- **Position**: bottom-right, bottom-left, top-right, top-left
- **Theme**: default, light, dark, or custom colors
- **Behavior**: auto-open, welcome messages, conversation history
- **Styling**: custom CSS, fonts, colors, and branding

## API Integration

### RESTful API
Integrate Miana AI into your existing applications using our comprehensive REST API:

#### Chat Endpoint
- **URL**: `POST /api/agent/chat`
- **Purpose**: Send messages to your agent and receive responses
- **Headers**: Content-Type: application/json, X-Company-Key: your_api_key, X-User-ID: user_id
- **Body**: { "message": "user message", "sessionId": "session_id", "conversationHistory": [] }

#### Agent Management
- **URL**: `GET/POST/PUT /api/agent`
- **Purpose**: Create, update, and manage your agents
- **Authentication**: Bearer token required

#### Knowledge Base
- **URL**: `POST /api/agent/knowledge`
- **Purpose**: Upload and manage agent knowledge
- **File Types**: PDF, DOC, DOCX, TXT, MD

## Pricing & Plans

### Starter Plan - $29/month
- 1 AI Agent
- 1,000 conversations/month
- Basic knowledge base
- Email support
- Perfect for small businesses getting started

### Professional Plan - $99/month (Most Popular)
- 5 AI Agents
- 10,000 conversations/month
- Advanced knowledge base
- Priority support
- Analytics dashboard
- Custom integrations
- Ideal for growing businesses

### Enterprise Plan - $299/month
- Unlimited AI Agents
- Unlimited conversations
- Custom integrations
- 24/7 phone support
- Custom training
- Dedicated account manager
- Perfect for large organizations

## Troubleshooting

### Common Issues

#### Widget Not Loading
- Check that all required environment variables are set
- Verify the agent ID and API key are correct
- Ensure the embed script URL is accessible
- Check browser console for JavaScript errors

#### Agent Not Responding
- Verify the agent is properly trained with knowledge
- Check that the agent is active and deployed
- Review conversation logs for error messages
- Test the agent in the preview mode first

#### Knowledge Base Issues
- Ensure uploaded documents are in supported formats (PDF, DOC, DOCX, TXT, MD)
- Check that documents are properly processed
- Verify knowledge base is linked to the agent
- Test with simple questions first

#### Payment Issues
- Verify Stripe configuration is correct
- Check that price IDs are properly set
- Ensure webhook endpoints are configured
- Contact support for billing questions

## Support & Contact

### Get Help
- **Email Support**: support@miana-ai.com
- **Documentation**: Complete API documentation available at /docs
- **Community**: Join our Discord community for peer support
- **Knowledge Base**: Search our comprehensive help articles

### Business Hours
- **Monday - Friday**: 9:00 AM - 6:00 PM EST
- **Saturday**: 10:00 AM - 4:00 PM EST
- **Sunday**: Closed
- **Emergency**: 24/7 for Enterprise customers

### Response Times
- **Starter Plan**: 24-48 hours
- **Professional Plan**: 4-8 hours
- **Enterprise Plan**: 1-2 hours (24/7 for critical issues)

## Best Practices

### Agent Training
1. **Start Simple**: Begin with basic Q&A before adding complex workflows
2. **Use Real Data**: Train with actual customer questions and scenarios
3. **Regular Updates**: Continuously improve based on conversation logs
4. **Test Thoroughly**: Use preview mode extensively before deployment

### Knowledge Management
1. **Organize Content**: Structure your knowledge base logically
2. **Keep Updated**: Regularly update information to maintain accuracy
3. **Use Keywords**: Include relevant keywords for better matching
4. **Monitor Performance**: Track which knowledge items are most helpful

### Deployment
1. **Gradual Rollout**: Start with a small user group before full deployment
2. **Monitor Closely**: Watch conversation logs and user feedback
3. **Have Fallbacks**: Always provide escalation to human agents
4. **Regular Maintenance**: Schedule regular reviews and updates

## Security & Privacy

### Data Protection
- All conversations are encrypted in transit and at rest
- User data is never shared with third parties
- GDPR and CCPA compliant
- SOC 2 Type II certified

### API Security
- JWT-based authentication
- Rate limiting to prevent abuse
- IP whitelisting available for Enterprise customers
- Regular security audits and updates

## Integration Examples

### WordPress
Add to your theme's functions.php:
```php
function add_miana_chatbot() {
    ?>
    <script>
        window.SupaChatbotConfig = {
            apiUrl: 'https://your-api-domain.com',
            agentId: 'your-agent-id',
            companyApiKey: 'your-api-key',
            userId: 'user_123',
            name: 'Your AI Assistant'
        };
    </script>
    <script src="https://your-cdn-domain.com/embed/embed-modular.js" async></script>
    <?php
}
add_action('wp_footer', 'add_miana_chatbot');
```

### Shopify
Add to your theme.liquid before </body>:
```liquid
<script>
  window.SupaChatbotConfig = {
    apiUrl: 'https://your-api-domain.com',
    agentId: 'your-agent-id',
    companyApiKey: 'your-api-key',
    userId: 'user_123',
    name: 'Your AI Assistant'
  };
</script>
<script src="https://your-cdn-domain.com/embed/embed-modular.js" async></script>
```

### React
```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    window.SupaChatbotConfig = {
      apiUrl: 'https://your-api-domain.com',
      agentId: 'your-agent-id',
      companyApiKey: 'your-api-key',
      userId: 'user_123',
      name: 'Your AI Assistant'
    };
    
    const script = document.createElement('script');
    script.src = 'https://your-cdn-domain.com/embed/embed-modular.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return <div>Your app content</div>;
}
```

## Frequently Asked Questions

### Q: How quickly can I get started?
A: You can create your first agent in under 10 minutes. Simply sign up, choose a plan, and start building!

### Q: Can I customize the widget appearance?
A: Yes! You can customize colors, fonts, positioning, and even add custom CSS for complete brand alignment.

### Q: What file types can I upload to the knowledge base?
A: We support PDF, DOC, DOCX, TXT, and MD files. Files are automatically processed and indexed for optimal performance.

### Q: Can I integrate with my existing CRM?
A: Yes! Our REST API allows integration with any system. Enterprise customers get dedicated integration support.

### Q: How does conversation context work?
A: Our agents maintain conversation history for up to 10 messages, allowing for natural, contextual conversations.

### Q: What happens if my agent doesn't know an answer?
A: You can configure escalation to human agents, or the agent can politely explain its limitations and suggest contacting support.

### Q: Can I test my agent before deploying?
A: Absolutely! Use our preview mode to test conversations and fine-tune responses before going live.

### Q: How do I upgrade or downgrade my plan?
A: You can change your plan anytime from your dashboard. Changes take effect on your next billing cycle.

### Q: Is there a free trial?
A: We offer a 14-day free trial for all new users. No credit card required to start.

### Q: What kind of analytics do you provide?
A: Track conversation volume, user satisfaction, popular questions, response accuracy, and more through our analytics dashboard.
