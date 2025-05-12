class DeepSpeechRecognizer {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.onResultCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
  }
  
  async init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        await this.sendAudioToServer(audioBlob);
        this.audioChunks = [];
        this.isRecording = false;
        if (this.onEndCallback) this.onEndCallback();
      };
      
      return true;
    } catch (error) {
      console.error('Error initializing recorder:', error);
      return false;
    }
  }
  
  start() {
    if (this.mediaRecorder && !this.isRecording) {
      this.audioChunks = [];
      this.mediaRecorder.start();
      this.isRecording = true;
      if (this.onStartCallback) this.onStartCallback();
      return true;
    }
    return false;
  }
  
  stop() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      return true;
    }
    return false;
  }
  
  async sendAudioToServer(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (this.onResultCallback) this.onResultCallback(result.text);
    } catch (error) {
      console.error('Error sending audio to server:', error);
      if (this.onResultCallback) this.onResultCallback('');
    }
  }
  
  onResult(callback) {
    this.onResultCallback = callback;
  }
  
  onStart(callback) {
    this.onStartCallback = callback;
  }
  
  onEnd(callback) {
    this.onEndCallback = callback;
  }
}

// Initialize and export
const deepSpeechRecognizer = new DeepSpeechRecognizer();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  const voiceInputButton = document.getElementById('voice-input-button');
  
  if (voiceInputButton) {
    const initialized = await deepSpeechRecognizer.init();
    
    if (initialized) {
      deepSpeechRecognizer.onStart(() => {
        voiceInputButton.classList.add('recording');
        showToast('Listening...');
      });
      
      deepSpeechRecognizer.onEnd(() => {
        voiceInputButton.classList.remove('recording');
      });
      
      voiceInputButton.addEventListener('click', () => {
        if (deepSpeechRecognizer.isRecording) {
          deepSpeechRecognizer.stop();
        } else {
          deepSpeechRecognizer.start();
        }
      });
    } else {
      voiceInputButton.disabled = true;
      voiceInputButton.title = 'Speech recognition unavailable';
      console.error('Failed to initialize speech recognition');
    }
  }
});

// Make available globally
window.deepSpeechRecognizer = deepSpeechRecognizer;