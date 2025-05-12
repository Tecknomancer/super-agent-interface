// Speech Recognition Service - Handles speech-to-text using DeepSpeech
const DeepSpeech = require('deepspeech');
const fs = require('fs');
const path = require('path');
const wav = require('wav');

// Path to DeepSpeech model files
const MODEL_DIR = path.join(__dirname, process.env.DEEPSPEECH_MODEL_DIR || '../services/speech/models');
const MODEL_PATH = path.join(MODEL_DIR, 'deepspeech-0.9.3-models.pbmm');
const SCORER_PATH = path.join(MODEL_DIR, 'deepspeech-0.9.3-models.scorer');

let model;
let modelLoading = false;
let lastUseTimestamp = 0;

// Load model on demand
async function getModel() {
  if (model) {
    // Update timestamp to track usage
    lastUseTimestamp = Date.now();
    return model;
  }
  
  if (modelLoading) {
    // Wait for model to finish loading if already in progress
    while (modelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return model;
  }
  
  try {
    modelLoading = true;
    console.log('Loading DeepSpeech model...');
    
    if (!fs.existsSync(MODEL_PATH) || !fs.existsSync(SCORER_PATH)) {
      throw new Error(`DeepSpeech model files not found at ${MODEL_PATH}`);
    }
    
    model = new DeepSpeech.Model(MODEL_PATH);
    model.enableExternalScorer(SCORER_PATH);
    
    console.log('DeepSpeech model loaded successfully');
    modelLoading = false;
    lastUseTimestamp = Date.now();
    
    // Set up model unloading after inactivity to free memory
    startModelUnloadTimer();
    
    return model;
  } catch (error) {
    console.error('Error loading DeepSpeech model:', error);
    modelLoading = false;
    throw error;
  }
}

// Unload model after inactivity
function startModelUnloadTimer() {
  const INACTIVITY_THRESHOLD = 10 * 60 * 1000; // 10 minutes
  
  setInterval(() => {
    if (model && (Date.now() - lastUseTimestamp > INACTIVITY_THRESHOLD)) {
      console.log('Unloading DeepSpeech model due to inactivity');
      model = null;
    }
  }, 60 * 1000); // Check every minute
}

// Process audio file with DeepSpeech
async function recognizeSpeech(audioFilePath) {
  try {
    // Check if model files exist
    if (!fs.existsSync(MODEL_PATH) || !fs.existsSync(SCORER_PATH)) {
      console.warn('DeepSpeech model files not found. Please run "npm run download-models"');
      return "Speech recognition model not installed. Please run setup.";
    }
    
    // Get model (loads if needed)
    const modelInstance = await getModel();
    
    return new Promise((resolve, reject) => {
      const reader = new wav.Reader();
      
      reader.on('format', (format) => {
        const buffers = [];
        
        reader.on('data', (data) => {
          buffers.push(data);
        });
        
        reader.on('end', () => {
          try {
            const buffer = Buffer.concat(buffers);
            const audioBuffer = buffer.slice(0, buffer.length / 2); // Convert to 16-bit
            const result = modelInstance.stt(audioBuffer);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
      
      reader.on('error', (err) => {
        reject(err);
      });
      
      const stream = fs.createReadStream(audioFilePath);
      stream.pipe(reader);
    });
  } catch (error) {
    console.error('DeepSpeech recognition error:', error);
    throw error;
  }
}

module.exports = { recognizeSpeech };
