document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const apiKeySelect = document.getElementById('api-key-select');
  const keyNameInput = document.getElementById('key-name');
  const keyTypeSelect = document.getElementById('key-type');
  const keyValueInput = document.getElementById('key-value');
  const addApiKeyButton = document.getElementById('add-api-key');
  const useSelectedKeyButton = document.getElementById('use-selected-key');
  const deleteSelectedKeyButton = document.getElementById('delete-selected-key');
  const toggleKeyVisibilityButton = document.getElementById('toggle-key-visibility');
  const currentApiNameDisplay = document.getElementById('current-api-name');
  const apiSettingsButton = document.getElementById('api-settings-button');
  const apiSettingsModal = document.getElementById('api-settings-modal');
  const closeModalButton = document.getElementById('close-modal');
  
  // Initialize
  loadSavedApiKeys();
  
  // Event Listeners
  addApiKeyButton.addEventListener('click', addApiKey);
  useSelectedKeyButton.addEventListener('click', useSelectedKey);
  deleteSelectedKeyButton.addEventListener('click', deleteSelectedKey);
  
  toggleKeyVisibilityButton.addEventListener('click', function() {
    if (keyValueInput.type === 'password') {
      keyValueInput.type = 'text';
      toggleKeyVisibilityButton.textContent = 'Hide';
    } else {
      keyValueInput.type = 'password';
      toggleKeyVisibilityButton.textContent = 'Show';
    }
  });
  
  // Modal controls
  apiSettingsButton.addEventListener('click', function() {
    apiSettingsModal.style.display = 'block';
  });
  
  closeModalButton.addEventListener('click', function() {
    apiSettingsModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === apiSettingsModal) {
      apiSettingsModal.style.display = 'none';
    }
  });
  
  // Functions
  function addApiKey() {
    const name = keyNameInput.value.trim();
    const type = keyTypeSelect.value;
    const value = keyValueInput.value.trim();
    
    if (!name || !value) {
      showToast('Please enter both name and API key', 'error');
      return;
    }
    
    // Get existing keys or initialize empty array
    const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '[]');
    
    // Check for duplicate name
    if (apiKeys.some(key => key.name === name)) {
      showToast('An API key with this name already exists', 'error');
      return;
    }
    
    // Add new key
    apiKeys.push({
      name,
      type,
      value: encryptKey(value), // In production, use actual encryption
      dateAdded: new Date().toISOString()
    });
    
    // Save to localStorage
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    
    // Update UI
    loadSavedApiKeys();
    resetForm();
    
    showToast('API key added successfully', 'success');
  }
  
  function useSelectedKey() {
    const selectedKeyId = apiKeySelect.value;
    
    if (!selectedKeyId) {
      showToast('Please select an API key', 'error');
      return;
    }
    
    // Get existing keys
    const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '[]');
    const selectedKey = apiKeys.find(key => key.name === selectedKeyId);
    
    if (selectedKey) {
      // Set as current API key
      localStorage.setItem('currentApiKey', selectedKey.name);
      
      // Update UI
      currentApiNameDisplay.textContent = selectedKey.name;
      
      showToast(`Now using ${selectedKey.name} API key`, 'success');
      
      // Close modal
      apiSettingsModal.style.display = 'none';
    }
  }
  
  function deleteSelectedKey() {
    const selectedKeyId = apiKeySelect.value;
    
    if (!selectedKeyId) {
      showToast('Please select an API key', 'error');
      return;
    }
    
    // Get confirmation
    if (!confirm(`Are you sure you want to delete the "${selectedKeyId}" API key?`)) {
      return;
    }
    
    // Get existing keys
    const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '[]');
    
    // Filter out the selected key
    const updatedKeys = apiKeys.filter(key => key.name !== selectedKeyId);
    
    // Save updated array
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    
    // Update UI
    loadSavedApiKeys();
    
    // If the deleted key was the current key, reset the current key
    if (localStorage.getItem('currentApiKey') === selectedKeyId) {
      localStorage.removeItem('currentApiKey');
      currentApiNameDisplay.textContent = 'Default';
    }
    
    showToast('API key deleted successfully', 'success');
  }
  
  function loadSavedApiKeys() {
    // Clear current options
    apiKeySelect.innerHTML = '<option value="" disabled selected>Select an API Key</option>';
    
    // Get saved keys
    const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '[]');
    
    // Add options for each key
    apiKeys.forEach(key => {
      const option = document.createElement('option');
      option.value = key.name;
      option.textContent = `${key.name} (${key.type})`;
      apiKeySelect.appendChild(option);
    });
    
    // Update UI state based on available keys
    const noKeysMessage = document.querySelector('.no-keys-message');
    if (apiKeys.length === 0) {
      noKeysMessage.style.display = 'block';
      useSelectedKeyButton.disabled = true;
      deleteSelectedKeyButton.disabled = true;
    } else {
      noKeysMessage.style.display = 'none';
      useSelectedKeyButton.disabled = false;
      deleteSelectedKeyButton.disabled = false;
    }
    
    // Set current API display
    const currentApiKey = localStorage.getItem('currentApiKey');
    if (currentApiKey) {
      currentApiNameDisplay.textContent = currentApiKey;
    }
  }
  
  function resetForm() {
    keyNameInput.value = '';
    keyTypeSelect.selectedIndex = 0;
    keyValueInput.value = '';
  }
  
  // Simple "encryption" (not secure, just for demo)
  function encryptKey(key) {
    // In production, use actual encryption
    return btoa(key); // Base64 encoding for demo
  }
});