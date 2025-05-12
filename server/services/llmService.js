// LLM Service - Handles communication with language model APIs
const { OpenAI } = require('openai');
const { Anthropic } = require('@anthropic-ai/sdk');

/**
 * Generates a response from a language model
 * @param {string} message - User message
 * @param {Array} history - Conversation history
 * @param {string} apiKey - API key to use (optional)
 * @param {string} model - Model to use (e.g., 'gpt-4o', 'claude-3-opus')
 * @returns {Promise<string>} - LLM response
 */
async function generateLLMResponse(message, history = [], apiKey = null, model = 'gpt-4o') {
  // Determine which provider to use based on model name
  if (model.toLowerCase().includes('gpt')) {
    return generateOpenAIResponse(message, history, apiKey, model);
  } else if (model.toLowerCase().includes('claude')) {
    return generateClaudeResponse(message, history, apiKey, model);
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
}

/**
 * Generates a response using OpenAI's API
 */
async function generateOpenAIResponse(message, history = [], apiKey = null, model = 'gpt-4o') {
  try {
    // Use provided API key or fall back to environment variable
    const openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
    
    // Format conversation history for OpenAI
    const messages = formatHistoryForOpenAI(history);
    
    // Add the current message
    messages.push({ role: 'user', content: message });
    
    // Call the API
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Generates a response using Anthropic's API
 */
async function generateClaudeResponse(message, history = [], apiKey = null, model = 'claude-3-opus-20240229') {
  try {
    // Use provided API key or fall back to environment variable
    const anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    });
    
    // Format conversation history for Anthropic
    const formattedHistory = formatHistoryForAnthropic(history);
    
    // Call the API
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2000,
      system: "You are a helpful, precise, and accurate AI assistant that specializes in providing programming help and explanations. When sharing code, ensure it's well-commented and follows best practices.",
      messages: [
        ...formattedHistory,
        { role: 'user', content: message }
      ]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error: ${error.message}`);
  }
}

/**
 * Formats conversation history for OpenAI
 */
function formatHistoryForOpenAI(history) {
  if (!history || !Array.isArray(history) || history.length === 0) {
    return [
      {
        role: 'system',
        content: 'You are a helpful, precise, and accurate AI assistant that specializes in providing programming help and explanations. When sharing code, ensure it\'s well-commented and follows best practices.'
      }
    ];
  }
  
  const formattedHistory = [
    {
      role: 'system',
      content: 'You are a helpful, precise, and accurate AI assistant that specializes in providing programming help and explanations. When sharing code, ensure it\'s well-commented and follows best practices.'
    }
  ];
  
  history.forEach(message => {
    if (message.role && message.content) {
      formattedHistory.push({
        role: message.role,
        content: message.content
      });
    }
  });
  
  return formattedHistory;
}

/**
 * Formats conversation history for Anthropic
 */
function formatHistoryForAnthropic(history) {
  if (!history || !Array.isArray(history) || history.length === 0) {
    return [];
  }
  
  const formattedHistory = [];
  
  history.forEach(message => {
    if (message.role && message.content) {
      // Convert 'assistant' role to 'assistant' for Anthropic
      const role = message.role === 'assistant' ? 'assistant' : 'user';
      formattedHistory.push({
        role: role,
        content: message.content
      });
    }
  });
  
  return formattedHistory;
}

module.exports = { generateLLMResponse };
