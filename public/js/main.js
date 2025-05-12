document.addEventListener('DOMContentLoaded', function() {
  // Socket.io connection
  const socket = io();
  
  // DOM Elements
  const resizer = document.getElementById('resizer');
  const leftPanel = document.querySelector('.left-panel');
  const rightPanel = document.querySelector('.right-panel');
  const textInput = document.getElementById('text-input');
  const sendButton = document.getElementById('send-button');
  const voiceInputButton = document.getElementById('voice-input-button');
  const conversationHistory = document.getElementById('conversation-history');
  const resetLayoutButton = document.getElementById('reset-layout');
  const copyButton = document.getElementById('copy-button');
  const codeDisplay = document.getElementById('code-display');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  // Initialize speech recognition
  initSpeechRecognition();
  
  // Initialize code highlighting
  hljs.highlightAll();
  
  // State
  let isResizing = false;
  let initialMouseX = 0;
  let initialLeftPanelWidth = 0;
  let conversationHistoryData = [];
  
  // Panel Resizing Functionality
  resizer.addEventListener('mousedown', initResize);
  
  function initResize(e) {
    isResizing = true;
    initialMouseX = e.clientX;
    initialLeftPanelWidth = leftPanel.offsetWidth;
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    
    // Add resize class for styling during resize
    document.body.classList.add('resizing');
  }
  
  function resize(e) {
    if (isResizing) {
      const newWidth = initialLeftPanelWidth + (e.clientX - initialMouseX);
      
      // Limit the minimum and maximum width
      const minWidth = 300;
      const maxWidth = window.innerWidth * 0.8;
      const finalWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      
      // Update left panel width
      leftPanel.style.width = finalWidth + 'px';
      
      // Update resizer position
      resizer.style.left = finalWidth + 'px';
      
      // Update right panel position
      rightPanel.style.left = (finalWidth + resizer.offsetWidth) + 'px';
    }
  }
  
  function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.body.classList.remove('resizing');
  }
  
  // Reset layout to default
  resetLayoutButton.addEventListener('click', function() {
    const defaultWidth = window.innerWidth * 0.4;
    leftPanel.style.width = defaultWidth + 'px';
    resizer.style.left = defaultWidth + 'px';
    rightPanel.style.left = (defaultWidth + resizer.offsetWidth) + 'px';
  });
  
  // Send Message to LLM
  function sendMessage() {
    const message = textInput.value.trim();
    if (!message) return;
    
    // Add user message to UI
    addMessageToConversation('user', message);
    
    // Update conversation history data
    conversationHistoryData.push({
      role: 'user',
      content: message
    });
    
    // Clear input field
    textInput.value = '';
    
    // Show loading indicator
    showLoading();
    
    // Get API key if available
    const apiKey = getSelectedApiKey();
    
    // Get voice settings
    const voiceSettings = window.voiceManager ? window.voiceManager.getVoiceSettings() : { enabled: true, type: 'male' };
    
    // Get model
    const model = document.getElementById('model-select').value;
    
    // Send message to server
    socket.emit('message', {
      message: message,
      history: conversationHistoryData.slice(0, -1), // Exclude current message
      apiKey: apiKey,
      model: model,
      voiceSettings: voiceSettings
    });
  }
  
  // Handle response from server
  socket.on('response', (data) => {
    // Hide loading indicator
    hideLoading();
    
    // Add message to UI
    addMessageToConversation('assistant', data.text);
    
    // Update conversation history data
    conversationHistoryData.push({
      role: 'assistant',
      content: data.text
    });
    
    // Play audio if available
    if (data.audio && window.voiceManager && window.voiceManager.voiceEnabled) {
      playAudio(data.audio);
    }
    
    // Check for code in response and update code display
    if (data.text.includes('```')) {
      const codeSnippet = extractCodeFromMarkdown(data.text);
      if (codeSnippet) {
        updateCodeDisplay(codeSnippet.code, codeSnippet.language);
      }
    }
  });
  
  // Handle errors from server
  socket.on('error', (data) => {
    hideLoading();
    showToast(data.message || 'An error occurred', 'error');
  });
  
  // Add message to conversation UI
  function addMessageToConversation(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);
    messageDiv.textContent = content;
    conversationHistory.appendChild(messageDiv);
    
    // Scroll to bottom
    conversationHistory.scrollTop = conversationHistory.scrollHeight;
  }
  
  // Show/Hide Loading Indicator
  function showLoading() {
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }
  }
  
  function hideLoading() {
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  }
  
  // Get currently selected API key
  function getSelectedApiKey() {
    const currentApiName = document.getElementById('current-api-name').textContent;
    if (currentApiName === 'Default') {
      return null;
    }
    
    const savedKeys = JSON.parse(localStorage.getItem('apiKeys') || '[]');
    const selectedKey = savedKeys.find(key => key.name === currentApiName);
    
    if (selectedKey) {
      return decodeApiKey(selectedKey.value);
    }
    
    return null;
  }
  
  // Simple "decryption" (not secure, just for demo)
  function decodeApiKey(encodedKey) {
    // In production, use proper encryption/decryption
    return atob(encodedKey); // Base64 decoding for demo
  }
  
  // Extract code from markdown response
  function extractCodeFromMarkdown(text) {
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const match = codeBlockRegex.exec(text);
    
    if (match) {
      return {
        language: match[1] || 'javascript',
        code: match[2]
      };
    }
    
    return null;
  }
  
  // Update code display with syntax highlighting
  function updateCodeDisplay(code, language = 'javascript') {
    codeDisplay.textContent = code;
    codeDisplay.className = `language-${language}`;
    document.querySelector('.language-indicator').textContent = language || 'javascript';
    hljs.highlightBlock(codeDisplay);
  }
  
  // Play audio from URL
  function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  }
  
  // Initialize Speech Recognition
  function initSpeechRecognition() {
    if (window.deepSpeechRecognizer) {
      window.deepSpeechRecognizer.onResult(text => {
        textInput.value = text;
      });
      
      voiceInputButton.addEventListener('click', () => {
        if (window.deepSpeechRecognizer.isRecording) {
          window.deepSpeechRecognizer.stop();
        } else {
          window.deepSpeechRecognizer.start();
        }
      });
    } else {
      console.warn('Speech recognition not initialized');
      voiceInputButton.addEventListener('click', () => {
        showToast('Speech recognition not available', 'error');
      });
    }
  }
  
  // Event Listeners
  sendButton.addEventListener('click', sendMessage);
  
  textInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Copy code button
  copyButton.addEventListener('click', function() {
    navigator.clipboard.writeText(codeDisplay.textContent)
      .then(() => {
        showToast('Code copied to clipboard!', 'success');
      })
      .catch(err => {
        showToast('Failed to copy code', 'error');
        console.error('Error copying text: ', err);
      });
  });
  
  // Add welcome message
  addMessageToConversation('assistant', "Welcome to the LLM Voice Interface! I'm ready to assist you with coding and other tasks. You can type a message or use the microphone button for voice input.");
});

// Show toast notification
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast';
  
  if (type) {
    toast.classList.add(type);
  }
  
  toast.style.display = 'block';
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
