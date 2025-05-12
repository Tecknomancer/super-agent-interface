class VoiceManager {
  constructor() {
    this.voiceEnabled = true;
    this.currentVoice = 'male';
    this.init();
  }
  
  init() {
    // Initialize from localStorage if available
    this.voiceEnabled = localStorage.getItem('voiceEnabled') !== 'false';
    this.currentVoice = localStorage.getItem('selectedVoice') || 'male';
    
    const voiceToggle = document.getElementById('voice-toggle');
    const voiceToggleLabel = document.getElementById('voice-toggle-label');
    const voiceSelect = document.getElementById('voice-select');
    
    if (voiceToggle && voiceToggleLabel) {
      // Update initial state
      this.updateToggleState();
      
      // Add event listener
      voiceToggle.addEventListener('click', () => {
        this.voiceEnabled = !this.voiceEnabled;
        localStorage.setItem('voiceEnabled', this.voiceEnabled);
        this.updateToggleState();
        showToast(`Voice output ${this.voiceEnabled ? 'enabled' : 'disabled'}`);
      });
    }
    
    if (voiceSelect) {
      // Set initial selection
      voiceSelect.value = this.currentVoice;
      
      // Add event listener
      voiceSelect.addEventListener('change', () => {
        this.currentVoice = voiceSelect.value;
        localStorage.setItem('selectedVoice', this.currentVoice);
        
        if (this.currentVoice === 'custom') {
          this.showCustomVoiceModal();
        } else {
          showToast(`Voice changed to ${this.getVoiceDisplayName()}`);
        }
      });
    }
  }
  
  updateToggleState() {
    const voiceToggle = document.getElementById('voice-toggle');
    const voiceToggleLabel = document.getElementById('voice-toggle-label');
    const speakerIcon = voiceToggle.querySelector('.speaker-icon');
    
    voiceToggleLabel.textContent = `Voice: ${this.voiceEnabled ? 'On' : 'Off'}`;
    
    if (this.voiceEnabled) {
      speakerIcon.classList.remove('muted');
      voiceToggle.title = 'Click to disable voice output';
    } else {
      speakerIcon.classList.add('muted');
      voiceToggle.title = 'Click to enable voice output';
    }
  }
  
  getVoiceDisplayName() {
    const voiceNames = {
      'male': 'Male (Default)',
      'female': 'Female',
      'british': 'British',
      'australian': 'Australian',
      'indian': 'Indian',
      'spanish': 'Spanish Accent',
      'custom': 'Custom'
    };
    return voiceNames[this.currentVoice] || this.currentVoice;
  }
  
  getVoiceSettings() {
    return {
      enabled: this.voiceEnabled,
      type: this.currentVoice
    };
  }
  
  showCustomVoiceModal() {
    // Implementation for custom voice modal
    alert('Custom voice configuration will be implemented here');
    
    // For now, revert to default
    this.currentVoice = 'male';
    document.getElementById('voice-select').value = 'male';
    localStorage.setItem('selectedVoice', this.currentVoice);
  }
}

// Initialize and make globally available
const voiceManager = new VoiceManager();
window.voiceManager = voiceManager;