const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a response from the LLM based on the input message and conversation history
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - Previous conversation history
 * @returns {Promise<string>} - The generated response
 */
async function generateResponse(message, conversationHistory) {
  try {
    // Format conversation history for the LLM
    const chatHistory = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    // Add the current message
    chatHistory.push({ role: 'user', content: message });
    
    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: chatHistory,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate response from LLM');
  }
}

module.exports = { generateResponse };
