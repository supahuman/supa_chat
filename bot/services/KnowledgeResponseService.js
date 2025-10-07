/**
 * KnowledgeResponseService - Manages knowledge-aware response generation
 * Provides confidence-based response instructions and industry-specific guidelines
 */

class KnowledgeResponseService {
  constructor() {
    this.industryGuidelines = {
      healthcare: "Ensure all information comes from verified sources. Never provide medical advice without proper disclaimers. Always recommend consulting healthcare professionals for medical concerns.",
      finance: "Be precise with financial information. Always recommend consulting qualified professionals for investment advice. Emphasize the importance of professional financial guidance.",
      ecommerce: "Focus on product information, policies, and customer service from your knowledge base. Be clear about return/refund policies and shipping information.",
      events: "Provide specific event details, ticket information, and venue policies from your knowledge base. Include relevant dates, times, and location information.",
      education: "Reference official curriculum, policies, and procedures from your knowledge base. Guide users to appropriate educational resources and support services.",
      support: "Follow established troubleshooting procedures from your knowledge base. Escalate complex issues appropriately and provide clear next steps.",
      technology: "Provide technical information from your knowledge base. Be clear about system requirements, compatibility, and technical limitations.",
      retail: "Focus on product details, availability, pricing, and customer service policies from your knowledge base. Provide accurate inventory and shipping information.",
      hospitality: "Provide information about services, amenities, policies, and local recommendations from your knowledge base. Include relevant contact information and hours.",
      general: "Use your knowledge base as the primary source for all domain-specific information. Be helpful and accurate while maintaining your personality."
    };
  }

  /**
   * Calculate confidence score based on knowledge search results
   * @param {Array} searchResults - Array of knowledge search results
   * @returns {Object} Confidence score and metadata
   */
  calculateConfidence(searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return {
        score: 0,
        level: 'none',
        count: 0,
        averageSimilarity: 0
      };
    }

    const similarities = searchResults.map(result => result.similarity || result.score || 0);
    const averageSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
    const count = searchResults.length;

    let level;
    if (averageSimilarity >= 0.8 && count >= 2) {
      level = 'high';
    } else if (averageSimilarity >= 0.6 && count >= 1) {
      level = 'medium';
    } else if (averageSimilarity >= 0.4 && count >= 1) {
      level = 'low';
    } else {
      level = 'none';
    }

    return {
      score: averageSimilarity,
      level,
      count,
      averageSimilarity
    };
  }

  /**
   * Get confidence-based response instructions
   * @param {Object} confidence - Confidence object from calculateConfidence
   * @returns {string} Response instructions
   */
  getConfidenceInstructions(confidence) {
    switch (confidence.level) {
      case 'high':
        return `You have HIGH-CONFIDENCE knowledge about this topic (${confidence.count} relevant sources, ${(confidence.score * 100).toFixed(0)}% match). Use this knowledge as your primary source and respond with authority while maintaining your personality.`;
      
      case 'medium':
        return `You have PARTIAL knowledge about this topic (${confidence.count} relevant sources, ${(confidence.score * 100).toFixed(0)}% match). Provide what you know in your own voice and acknowledge any gaps naturally.`;
      
      case 'low':
        return `You have LIMITED knowledge about this topic (${confidence.count} relevant sources, ${(confidence.score * 100).toFixed(0)}% match). Share what's relevant in your personality and suggest alternatives.`;
      
      case 'none':
      default:
        return `You have NO SPECIFIC KNOWLEDGE about this topic. Be honest about limitations in your own voice and offer related help or suggest contacting support.`;
    }
  }

  /**
   * Get industry-specific guidelines
   * @param {string} industry - Industry type
   * @returns {string} Industry guidelines
   */
  getIndustryGuidelines(industry) {
    return this.industryGuidelines[industry] || this.industryGuidelines.general;
  }

  /**
   * Generate enhanced system prompt with knowledge enforcement
   * @param {Object} agent - Agent object
   * @param {string} knowledgeContext - Knowledge base content
   * @param {Object} confidence - Confidence object
   * @param {string} toolResults - Tool execution results
   * @returns {string} Enhanced system prompt
   */
  generateSystemPrompt(agent, knowledgeContext, confidence, toolResults = '') {
    const industryGuidelines = this.getIndustryGuidelines(agent.industry);
    const confidenceInstructions = this.getConfidenceInstructions(confidence);

    return `You are ${agent.name}, an AI assistant with the following personality:
${agent.personality}

${agent.description ? `Description: ${agent.description}` : ''}

KNOWLEDGE BASE PRIORITY:
- ALWAYS prioritize information from your knowledge base over general knowledge
- If you have relevant knowledge, use it as your primary source
- If knowledge is insufficient, clearly state limitations
- Maintain your personality while being factually accurate

${confidenceInstructions}

${knowledgeContext ? `RELEVANT KNOWLEDGE FROM YOUR KNOWLEDGE BASE:
${knowledgeContext}

IMPORTANT: This knowledge is specific to your domain. Use it to provide accurate answers while maintaining your personality.` : 'NO RELEVANT KNOWLEDGE FOUND - Be honest about limitations while staying in character.'}

${toolResults ? `TOOL EXECUTION RESULTS:
${toolResults}` : ''}

INDUSTRY GUIDELINES:
${industryGuidelines}

RESPONSE GUIDELINES:
- If you have knowledge base content: Use it confidently while staying true to your personality
- If knowledge is partial: Acknowledge limitations in your own voice
- If no knowledge: Be honest about limitations and offer related help
- Always maintain your ${agent.personality} personality
- Follow industry guidelines while staying in character

Respond to the user's message in character, using your personality and prioritizing the provided knowledge.`;
  }

  /**
   * Generate response metadata for tracking
   * @param {Object} confidence - Confidence object
   * @param {boolean} knowledgeUsed - Whether knowledge was used
   * @param {boolean} toolsExecuted - Whether tools were executed
   * @returns {Object} Response metadata
   */
  generateResponseMetadata(confidence, knowledgeUsed, toolsExecuted) {
    return {
      knowledgeUsed,
      toolsExecuted,
      confidence: confidence.score,
      confidenceLevel: confidence.level,
      knowledgeCount: confidence.count,
      averageSimilarity: confidence.averageSimilarity
    };
  }
}

export default new KnowledgeResponseService();
