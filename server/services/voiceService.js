const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const VOICE_DIR = path.join(__dirname, 'voice');
const PIPER_BINARY = process.env.PIPER_BINARY || path.join(VOICE_DIR, 'piper');
const VOICE_MODEL = process.env.VOICE_MODEL || path.join(VOICE_DIR, 'en_US-lessac-medium.onnx');

/**
 * Synthesizes speech from text using Piper
 * @param {string} text - The text to convert to speech
 * @returns {Promise<string>} - Path to the generated audio file
 */
function synthesizeSpeech(text) {
  return new Promise((resolve, reject) => {
    // Check if voice directory exists, create if not
    if (!fs.existsSync(VOICE_DIR)) {
      fs.mkdirSync(VOICE_DIR, { recursive: true });
    }
    
    const outputFile = path.join(VOICE_DIR, `${uuidv4()}.wav`);
    
    // Create a temp file for the text
    const textFile = path.join(VOICE_DIR, `${uuidv4()}.txt`);
    fs.writeFileSync(textFile, text);
    
    // Run Piper command
    const command = `${PIPER_BINARY} --model ${VOICE_MODEL} --output_file ${outputFile} < ${textFile}`;
    
    exec(command, (error) => {
      // Clean up text file
      if (fs.existsSync(textFile)) {
        fs.unlinkSync(textFile);
      }
      
      if (error) {
        console.error('Error synthesizing speech:', error);
        reject(error);
        return;
      }
      
      resolve(outputFile);
    });
  });
}

module.exports = { synthesizeSpeech };
