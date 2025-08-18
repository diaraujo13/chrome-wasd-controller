document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const status = document.getElementById('status');
  
  // Get current tab and check status
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0]) {
      // Send message to content script to get current status
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, function(response) {
        if (chrome.runtime.lastError) {
          // Content script not loaded, assume enabled
          updateUI(true);
        } else {
          updateUI(response ? response.enabled : true);
        }
      });
    }
  });
  
  // Handle toggle click
  toggleSwitch.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' }, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error toggling extension:', chrome.runtime.lastError);
          } else {
            updateUI(response ? response.enabled : false);
          }
        });
      }
    });
  });
  
  function updateUI(enabled) {
    if (enabled) {
      toggleSwitch.classList.add('active');
      status.textContent = 'Extension is active on this page';
      status.className = 'status enabled';
    } else {
      toggleSwitch.classList.remove('active');
      status.textContent = 'Extension is disabled on this page';
      status.className = 'status disabled';
    }
  }
});