// Piper Service - Handles text-to-speech synthesis using Piper
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Path configurations
const PIPER_DIR = path.join(__dirname, '../services/voice');
const PIPER_BINARY = process.env.PIPER_BINARY_PATH || path.join(PIPER_DIR, 'piper');
const MODELS_DIR = process.env.PIPER_MODEL_DIR || path.join(PIPER_DIR, 'models');
const OUTPUT_DIR = path.join(PIPER_DIR, 'output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Voice configuration mapping
const VOICE_MODELS = {
  'male': {
    model: path.join(MODELS_DIR, 'en_US-lessac-medium.onnx'),
    speaker: ''
  },
  'female': {
    model: path.join(MODELS_DIR, 'en_US-amy-medium.onnx'),
    speaker: ''
  },
  'british': {
    model: path.join(MODELS_DIR, 'en_GB-alba-medium.onnx'),
    speaker: ''
  },
  'australian': {
    model: path.join(MODELS_DIR, 'en_AU-sydney-medium.onnx'),
    speaker: ''
  },
  'indian': {
    model: path.join(MODELS_DIR, 'en_IN-athens-medium.onnx'),
    speaker: ''
  },
  'spanish': {
    model: path.join(MODELS_DIR, 'es_ES-mls_10246-medium.onnx'),
    speaker: ''
  }
};

/**
 * Synthesizes speech from text using Piper
 * @param {string} text - The text to convert to speech
 * @param {object} voiceSettings - Voice settings (type, speed, etc.)
 * @returns {Promise<string>} - Path to the generated audio file
 */
function synthesizeSpeech(text, voiceSettings = {}) {
  const voiceType = voiceSettings.type || 'male';
  const voiceConfig = VOICE_MODELS[voiceType] || VOICE_MODELS.male;
  
  return new Promise((resolve, reject) => {
    // Generate unique output filename
    const outputFile = path.join(OUTPUT_DIR, `${uuidv4()}.wav`);
    
    // Create temporary text file
    const textFile = path.join(OUTPUT_DIR, `${uuidv4()}.txt`);
    fs.writeFileSync(textFile, text);
    
    // Build Piper command
    let command = `${PIPER_BINARY} --model ${voiceConfig.model} --output_file ${outputFile}`;
    
    // Add speaker ID if available
    if (voiceConfig.speaker) {
      command += ` --speaker ${voiceConfig.speaker}`;
    }
    
    // Execute Piper
    exec(`${command} < ${textFile}`, (error, stdout, stderr) => {
      // Clean up text file
      if (fs.existsSync(textFile)) {
        fs.unlinkSync(textFile);
      }
      
      if (error) {
        console.error('Error synthesizing speech:', error);
        console.error('Piper stderr:', stderr);
        reject(error);
        return;
      }
      
      console.log('Speech synthesis completed:', outputFile);
      
      // Set up cleanup of audio file after some time
      setTimeout(() => {
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
          console.log(`Cleaned up temporary audio file: ${outputFile}`);
        }
      }, 30 * 60 * 1000); // 30 minutes
      
      resolve(outputFile);
    });
  });
}

// Check if Piper binary exists
function checkPiperInstallation() {
  if (!fs.existsSync(PIPER_BINARY)) {
    console.warn(`Piper binary not found at ${PIPER_BINARY}. Text-to-speech will not work.`);
    console.warn('Run "npm run download-models" to download Piper.');
    return false;
  }
  
  // Check if at least one model exists
  let modelExists = false;
  Object.values(VOICE_MODELS).forEach(config => {
    if (fs.existsSync(config.model)) {
      modelExists = true;
    }
  });
  
  if (!modelExists) {
    console.warn('No Piper voice models found. Text-to-speech will not work.');
    console.warn('Run "npm run download-models" to download voice models.');
    return false;
  }
  
  return true;
}

// Initialize on module load
checkPiperInstallation();

module.exports = { synthesizeSpeech };
