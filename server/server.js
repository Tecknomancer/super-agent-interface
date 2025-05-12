// Main Express Server
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// Import services
const { generateLLMResponse } = require('./services/llmService');
const { synthesizeSpeech } = require('./services/piperService');
const { recognizeSpeech } = require('./services/speechRecognitionService');

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Create HTTP server and Socket.io
const server = http.createServer(app);
const io = socketIo(server);

// File upload configuration for audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `speech-${Date.now()}.wav`);
  }
});

const upload = multer({ storage });

// API endpoint for speech recognition
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    const audioFilePath = req.file.path;
    const text = await recognizeSpeech(audioFilePath);
    
    // Clean up the file after processing
    fs.unlinkSync(audioFilePath);
    
    res.json({ text });
  } catch (error) {
    console.error('Speech recognition error:', error);
    res.status(500).json({ error: 'Speech recognition failed' });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('message', async (data) => {
    try {
      const { message, history, apiKey, model, voiceSettings } = data;
      
      // Generate response from LLM
      const llmResponse = await generateLLMResponse(message, history, apiKey, model);
      
      // Synthesize speech if voice is enabled
      let audioUrl = null;
      if (voiceSettings.enabled) {
        try {
          const audioFilePath = await synthesizeSpeech(llmResponse, voiceSettings);
          audioUrl = `/audio/${path.basename(audioFilePath)}`;
        } catch (error) {
          console.error('Speech synthesis error:', error);
        }
      }
      
      // Send response back to client
      socket.emit('response', { 
        text: llmResponse, 
        audio: audioUrl 
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Add route to serve audio files
app.get('/audio/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'services/voice/output', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Audio file not found');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
