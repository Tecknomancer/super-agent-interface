### 2. server/server.js

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const { generateResponse } = require('./services/llmService');
const { synthesizeSpeech } = require('./services/voiceService');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
const io = socketIo(server);

// Add a route to serve audio files
app.get('/audio/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'services/voice', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Audio file not found');
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('message', async (data) => {
    const { message, history } = data;
    try {
      const response = await generateResponse(message, history);
      
      try {
        const audioFile = await synthesizeSpeech(response);
        const audioFilename = path.basename(audioFile);
        socket.emit('response', { 
          text: response, 
          audio: `/audio/${audioFilename}` 
        });
        
        // Set up a cleanup for the audio file after some time
        setTimeout(() => {
          if (fs.existsSync(audioFile)) {
            fs.unlinkSync(audioFile);
            console.log(`Cleaned up temporary audio file: ${audioFile}`);
          }
        }, 5 * 60 * 1000); // Clean up after 5 minutes
        
      } catch (error) {
        console.error('Voice synthesis error:', error);
        socket.emit('response', { 
          text: response, 
          audio: null
        });
      }
    } catch (error) {
      console.error('LLM service error:', error);
      socket.emit('response', { 
        text: 'Sorry, I encountered an error processing your request.', 
        audio: null
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});