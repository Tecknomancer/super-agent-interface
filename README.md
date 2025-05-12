# LLM Voice Interface

A web-based interface for LLM agents with full conversational voice capabilities, featuring a separate window for code/script display. This project allows users to interact with advanced language models using both voice and text, with real-time responses in both modalities.

![LLM Voice Interface](https://example.com/screenshot.png)

## 🌟 Features

- **Voice Interaction**: Seamless voice input and output with high-quality, low-latency synthesis using Piper (offline TTS)
- **Speech Recognition**: Offline speech recognition powered by Mozilla DeepSpeech
- **Text Conversation**: Real-time text display with proper formatting for messages
- **Code Display**: Separate window for viewing and copying generated code, with syntax highlighting
- **API Key Management**: Securely store and manage your API keys for different LLM providers
- **Multiple LLM Support**: Connect to different LLM providers including OpenAI (GPT-4, GPT-3.5) and Anthropic (Claude)
- **Customizable Voice**: Select from multiple voice options including male, female, British, Australian, Indian, and Spanish accents
- **Responsive Design**: Works on desktop and mobile devices with adaptive layout
- **Resizable Interface**: Drag to resize conversation and code panels to your preference

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.io
- **Speech Recognition**: Mozilla DeepSpeech (offline)
- **Text-to-Speech**: Piper (offline, high-quality synthesis)
- **Code Highlighting**: highlight.js
- **LLM Integration**: OpenAI API, Anthropic API

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- 2GB+ free disk space for voice models

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/llm-voice-interface.git
   cd llm-voice-interface
   ```

2. **Install dependencies and download models**
   ```bash
   npm run setup
   ```
   This will install all required dependencies and download the voice models needed for speech recognition and synthesis.

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file to add your API keys for OpenAI and/or Anthropic.

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to start using the interface.

## 📝 Usage Guide

### Voice Interaction

1. Click the microphone button to start voice recording
2. Speak clearly into your microphone
3. Recording will automatically stop after you finish speaking
4. The system will process your speech, send it to the LLM, and respond both in text and voice

### Text Interaction

1. Type your message in the input field
2. Press Enter or click the send button
3. The system will process your message and respond in text (and voice if enabled)

### Code Display

- Code snippets detected in the LLM response will automatically appear in the code window
- Use the "Copy" button to copy code to your clipboard
- The language is automatically detected and syntax highlighting applied

### Customizing Voice

1. Use the voice selector dropdown to choose your preferred voice
2. Toggle voice output on/off using the speaker button
3. Voice settings are remembered between sessions

### Managing API Keys

1. Click the "API Keys" button to open the management modal
2. Add new API keys with a name, provider type, and the key itself
3. Select and use any stored API key
4. Delete keys you no longer need

## 🔊 Voice Features

### Available Voices

The system includes multiple voice options:

- Male (US English)
- Female (US English)
- British English
- Australian English
- Indian English
- Spanish

### Offline Processing

Both speech recognition and text-to-speech are processed locally, providing:

- Enhanced privacy (no audio data sent to external services)
- Lower latency for voice interactions
- No usage limits or API costs
- Ability to function without internet connectivity

## 🛠️ Project Structure

```
llm-voice-interface/
├── .github/               # GitHub workflow configurations
├── public/                # Client-side files
│   ├── css/               # Styling
│   ├── js/                # Client JavaScript
│   ├── assets/            # Images and other assets
│   └── index.html         # Main HTML file
├── server/                # Server-side code
│   ├── server.js          # Express server
│   └── services/          # Service modules
│       ├── llmService.js  # LLM API integration
│       ├── piperService.js # Text-to-speech
│       └── speechRecognitionService.js # Speech-to-text
├── scripts/               # Utility scripts
└── README.md              # This file
```

## 🧩 API Integration

### Supported LLM Providers

- **OpenAI**: GPT-4o, GPT-3.5-turbo
- **Anthropic**: Claude 3 Opus, Claude 3 Sonnet

### Adding New LLM Providers

To add support for additional LLM providers:

1. Extend the `llmService.js` file with appropriate API calls
2. Add the new provider to the model selector in `index.html`
3. Implement the necessary authentication in `apiKeyManager.js`

## 🔒 Security Notes

- API keys are stored in browser localStorage with basic encoding
- For production use, consider implementing a more secure key management system
- The project is designed for personal/local use by default

## 🔍 Troubleshooting

### Voice Recognition Issues

- Ensure your microphone is properly connected and has necessary permissions
- Check that the DeepSpeech models were downloaded correctly
- Consider using a USB microphone for better quality in noisy environments

### Voice Synthesis Issues

- Verify that Piper was installed correctly during setup
- Check console for any errors related to voice synthesis
- Ensure the selected voice model exists in the models directory

### Connection Issues

- Verify that the server is running on the expected port
- Check for any CORS issues if accessing from a different domain
- Ensure WebSocket connections are not blocked by firewalls

## 📚 Development

### Running in Development Mode

```bash
npm run dev
```

This starts the server with hot reloading enabled.

### Adding Custom Voice Models

Custom voice models compatible with Piper can be added to the `server/services/voice/models` directory. After adding, update the `VOICE_MODELS` object in `piperService.js`.

## 📱 Mobile Support

The interface is fully responsive and works on mobile devices with the following considerations:

- The panels stack vertically on small screens
- Microphone access requires HTTPS on most mobile browsers
- Performance may vary depending on the device's capabilities

## 📄 License

MIT License - See LICENSE file for details.

## 🙏 Acknowledgments

- [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech) for the speech recognition engine
- [Piper](https://github.com/rhasspy/piper) for the high-quality text-to-speech synthesis
- [Socket.io](https://socket.io/) for real-time communication
- [highlight.js](https://highlightjs.org/) for code syntax highlighting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📬 Contact

Project Link: [https://github.com/yourusername/llm-voice-interface](https://github.com/yourusername/llm-voice-interface)
```

This comprehensive README.md file includes:

1. Detailed features and capabilities of the LLM Voice Interface
2. Complete installation and usage instructions
3. Information about the voice recognition and synthesis features
4. Project structure breakdown
5. API integration details
6. Security notes and troubleshooting guidance
7. Development instructions and mobile support information
8. Proper acknowledgment of key libraries and technologies used
9. License and contribution information

You can copy this entire README.md to replace your existing one in the repository. Would you like me to make any specific changes or additions to this version?
