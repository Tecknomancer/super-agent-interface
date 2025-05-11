// DOM elements
const voiceButton = document.getElementById('voice-button');
let recognition;

/**
 * Initializes speech recognition if available in the browser
 */
function initSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Can be made configurable
    
    recognition.onstart = () => {
      voiceButton.textContent = '🔴';
      voiceButton.classList.add('recording');
      
      // Show recording indicator in the input field
      textInput.placeholder = 'Listening...';
    };
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      textInput.value = transcript;
    };
    
    recognition.onend = () => {
      voiceButton.textContent = '🎤';
      voiceButton.classList.remove('recording');
      textInput.placeholder = 'Type or speak your message...';
      
      // If there's content, send after a short delay
      if (textInput.value.trim()) {
        setTimeout(() => {
          sendMessage();
        }, 500);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      voiceButton.textContent = '🎤';
      voiceButton.classList.remove('recording');
      textInput.placeholder = 'Type or speak your message...';
      
      if (event.error === 'not-allowed') {
        alert('Microphone access is required for voice input. Please allow microphone access and try again.');
      }
    };
    
    voiceButton.addEventListener('