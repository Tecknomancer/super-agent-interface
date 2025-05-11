// Initialize socket connection
const socket = io();

// DOM elements
const conversationHistory = document.getElementById('conversation-history');
const textInput = document.getElementById('text-input');
const sendButton = document.getElementById('send-button');
const themeSwitch = document.getElementById('theme-switch');
const resizer = document.getElementById('resizer');
const conversationContainer = document.getElementById('conversation-container');
const codeContainer = document.getElementById('code-container');

// Conversation state
let conversationArray = [];

// Event listeners
sendButton.addEventListener('click', sendMessage);
textInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Theme toggle
themeSwitch.addEventListener('change', toggleTheme);

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeSwitch.checked = true;
}

/**
 * Toggles between light and dark theme
 */
function toggleTheme() {
  if (themeSwitch.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }
}

/**
 * Sends user message to server
 */
function sendMessage() {
  const message = textInput.value.trim();
  if (!message) return;
  
  addMessageToConversation('user', message);
  conversationArray.push({ sender: 'user', content: message });
  textInput.value = '';
  
  // Add loading indicator
  const loadingElement = document.createElement('div');
  loadingElement.classList.add('message', 'assistant', 'loading');
  loadingElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  conversationHistory.appendChild(loadingElement);
  conversationHistory.scrollTop = conversationHistory.scrollHeight;
  
  socket.emit('message', { message, history: conversationArray });
}

/**
 * Adds a message to the conversation history
 * @param {string} sender - 'user' or 'assistant'
 * @param {string} message - The message content
 */
function addMessageToConversation(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  
  // Format the message to highlight code blocks in the conversation
  let formattedMessage = message.replace(/```([\w]*)\n([\s\S]*?)```/g, 
    '<pre class="inline-code"><code>$2</code></pre>');
  
  messageElement.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Assistant'}:</strong> ${formattedMessage}`;
  conversationHistory.appendChild(messageElement);
  conversationHistory.scrollTop = conversationHistory.scrollHeight;
  
  // Update code display if message has code blocks
  if (message.includes('```')) {
    handleCodeBlocks(message);
  }
}

// Socket event handlers
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('response', (data) => {
  // Remove loading indicator
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) loadingElement.remove();
  
  addMessageToConversation('assistant', data.text);
  conversationArray.push({ sender: 'assistant', content: data.text });
  
  if (data.audio) {
    const audio = new Audio(data.audio);
    audio.play();
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Initial welcome message
setTimeout(() => {
  addMessageToConversation('assistant', 'Hello! I\'m your AI assistant. How can I help you today?');
  conversationArray.push({ 
    sender: 'assistant', 
    content: 'Hello! I\'m your AI assistant. How can I help you today?' 
  });
}, 500);

// Panel resizing functionality
let isResizing = false;
let lastDownX = 0;

resizer.addEventListener('mousedown', (e) => {
  isResizing = true;
  lastDownX = e.clientX;
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  
  const offsetX = e.clientX - lastDownX;
  const conversationWidth = conversationContainer.offsetWidth + offsetX;
  const codeWidth = codeContainer.offsetWidth - offsetX;
  
  // Calculate percentages
  const totalWidth = conversationContainer.offsetWidth + codeContainer.offsetWidth;
  const conversationPercent = (conversationWidth / totalWidth) * 100;
  const codePercent = (codeWidth / totalWidth) * 100;
  
  // Apply minimum widths
  if (conversationPercent > 20 && codePercent > 20) {
    conversationContainer.style.flex = `0 0 ${conversationPercent}%`;
    codeContainer.style.flex = `0 0 ${codePercent}%`;
    lastDownX = e.clientX;
  }
});

document.addEventListener('mouseup', () => {
  isResizing = false;
});
