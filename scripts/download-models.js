// Script to download required voice models
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');

// Directories
const MODELS_DIR = path.join(__dirname, '../server/services/voice/models');
const SPEECH_MODELS_DIR = path.join(__dirname, '../server/services/speech/models');

// Ensure directories exist
[MODELS_DIR, SPEECH_MODELS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Piper voice models to download
const PIPER_MODELS = [
  {
    name: 'en_US-lessac-medium',
    url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx',
    configUrl: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json'
  },
  {
    name: 'en_US-amy-medium',
    url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/medium/en_US-amy-medium.onnx',
    configUrl: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/medium/en_US-amy-medium.onnx.json'
  },
  {
    name: 'en_GB-alba-medium',
    url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_GB/alba/medium/en_GB-alba-medium.onnx',
    configUrl: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_GB/alba/medium/en_GB-alba-medium.onnx.json'
  },
  {
    name: 'en_AU-sydney-medium',
    url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_AU/sydney/medium/en_AU-sydney-medium.onnx',
    configUrl: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_AU/sydney/medium/en_AU-sydney-medium.onnx.json'
  },
  {
    name: 'en_IN-athens-medium',
    url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_IN/athens/medium/en_IN-athens-medium.onnx',
    configUrl: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_IN/athens/medium/en_IN-athens-medium.onnx.json'
  },
  {
    name: 'es_ES-mls_10246-medium',
    url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/es/es_ES/mls_10246/medium/es_ES-mls_10246-medium.onnx',
    configUrl: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/es/es_ES/mls_10246/medium/es_ES-mls_10246-medium.onnx.json'
  }
];

// DeepSpeech model
const DEEPSPEECH_MODEL = {
  name: 'deepspeech-0.9.3-models',
  modelUrl: 'https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm',
  scorerUrl: 'https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer'
};

// Download file helper
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destination}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(destination, () => {});
      reject(err);
    });
  });
}

// Download all models
async function downloadModels() {
  try {
    console.log('Downloading Piper voice models...');
    
    // Download Piper voice models
    for (const model of PIPER_MODELS) {
      const modelPath = path.join(MODELS_DIR, `${model.name}.onnx`);
      const configPath = path.join(MODELS_DIR, `${model.name}.onnx.json`);
      
      if (!fs.existsSync(modelPath)) {
        console.log(`Downloading ${model.name}...`);
        await downloadFile(model.url, modelPath);
      } else {
        console.log(`${model.name} already exists, skipping.`);
      }
      
      if (!fs.existsSync(configPath)) {
        console.log(`Downloading ${model.name} config...`);
        await downloadFile(model.configUrl, configPath);
      } else {
        console.log(`${model.name} config already exists, skipping.`);
      }
    }
    
    console.log('Downloading DeepSpeech models...');
    
    // Download DeepSpeech model and scorer
    const modelPath = path.join(SPEECH_MODELS_DIR, `${DEEPSPEECH_MODEL.name}.pbmm`);
    const scorerPath = path.join(SPEECH_MODELS_DIR, `${DEEPSPEECH_MODEL.name}.scorer`);
    
    if (!fs.existsSync(modelPath)) {
      console.log('Downloading DeepSpeech model...');
      await downloadFile(DEEPSPEECH_MODEL.modelUrl, modelPath);
    } else {
      console.log('DeepSpeech model already exists, skipping.');
    }
    
    if (!fs.existsSync(scorerPath)) {
      console.log('Downloading DeepSpeech scorer...');
      await downloadFile(DEEPSPEECH_MODEL.scorerUrl, scorerPath);
    } else {
      console.log('DeepSpeech scorer already exists, skipping.');
    }
    
    console.log('All models downloaded successfully!');
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

// Download Piper binary for current platform
async function downloadPiperBinary() {
  const platform = process.platform;
  const arch = process.arch;
  
  let piperUrl;
  let binName = 'piper';
  
  if (platform === 'linux') {
    if (arch === 'x64') {
      piperUrl = 'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz';
    } else if (arch === 'arm64') {
      piperUrl = 'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_arm64.tar.gz';
    } else if (arch === 'arm') {
      piperUrl = 'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_armv7.tar.gz';
    }
  } else if (platform === 'darwin') {
    piperUrl = 'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_macos.tar.gz';
  } else if (platform === 'win32') {
    piperUrl = 'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_windows.zip';
    binName = 'piper.exe';
  }
  
  if (!piperUrl) {
    console.error(`Unsupported platform: ${platform} ${arch}`);
    return;
  }
  
  const piperDir = path.join(__dirname, '../server/services/voice');
  const tempFile = path.join(piperDir, 'piper_temp.tar.gz');
  const piperPath = path.join(piperDir, binName);
  
  if (!fs.existsSync(piperDir)) {
    fs.mkdirSync(piperDir, { recursive: true });
  }
  
  if (fs.existsSync(piperPath)) {
    console.log('Piper binary already exists, skipping download.');
    return;
  }
  
  console.log(`Downloading Piper binary for ${platform} ${arch}...`);
  
  try {
    await downloadFile(piperUrl, tempFile);
    
    console.log('Extracting Piper binary...');
    
    if (platform === 'win32') {
      // Extract zip file on Windows
      exec(`powershell -command "Expand-Archive -Path '${tempFile}' -DestinationPath '${piperDir}'"`, (error) => {
        if (error) {
          console.error('Error extracting Piper binary:', error);
          return;
        }
        fs.unlinkSync(tempFile);
        console.log('Piper binary extracted successfully.');
      });
    } else {
      // Extract tar.gz on Unix
      exec(`tar -xzf "${tempFile}" -C "${piperDir}"`, (error) => {
        if (error) {
          console.error('Error extracting Piper binary:', error);
          return;
        }
        fs.unlinkSync(tempFile);
        exec(`chmod +x "${piperPath}"`);
        console.log('Piper binary extracted successfully.');
      });
    }
  } catch (error) {
    console.error('Error downloading Piper binary:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('Starting LLM Voice Interface setup...');
    
    console.log('Setting up voice synthesis (Piper)...');
    await downloadPiperBinary();
    
    console.log('Setting up voice models...');
    await downloadModels();
    
    console.log('Setup completed successfully!');
    console.log('You can now start the server with: npm start');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run the script
main();