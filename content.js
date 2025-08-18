(function() {
  'use strict';
  
  // Configuration
  const SCROLL_AMOUNT = 100; // pixels to scroll for W/S
  const PAGE_SCROLL_FACTOR = 0.8; // factor of viewport height for page scroll
  
  // State management
  let isEnabled = true;
  let pressedKeys = new Set();
  
  // Get scroll amount based on viewport
  function getPageScrollAmount() {
    return window.innerHeight * PAGE_SCROLL_FACTOR;
  }
  
  // Smooth scroll function
  function smoothScroll(target) {
    window.scrollTo({
      top: target,
      left: window.scrollX,
      behavior: 'smooth'
    });
  }
  
  // Handle key press
  function handleKeyPress(key) {
    if (!isEnabled) return;
    
    const currentScroll = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    switch(key.toLowerCase()) {
      case 'w':
        // Scroll up
        smoothScroll(Math.max(0, currentScroll - SCROLL_AMOUNT));
        break;
        
      case 's':
        // Scroll down
        smoothScroll(Math.min(maxScroll, currentScroll + SCROLL_AMOUNT));
        break;
        
      case 'a':
        // Page up
        smoothScroll(Math.max(0, currentScroll - getPageScrollAmount()));
        break;
        
      case 'd':
        // Page down
        smoothScroll(Math.min(maxScroll, currentScroll + getPageScrollAmount()));
        break;
        
      case 'q':
        // Home (top of page)
        smoothScroll(0);
        break;
        
      case 'e':
        // End (bottom of page)
        smoothScroll(maxScroll);
        break;
    }
  }
  
  // Check if element should block WASD controls
  function shouldBlockControls(element) {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    
    // Block in form elements
    if (inputTypes.includes(tagName)) return true;
    
    // Block in contenteditable elements
    if (element.contentEditable === 'true') return true;
    
    // Block in elements with role textbox
    if (element.getAttribute('role') === 'textbox') return true;
    
    return false;
  }
  
  // Keyboard event listeners
  document.addEventListener('keydown', function(e) {
    // Don't interfere if user is typing in input fields
    if (shouldBlockControls(e.target)) return;
    
    // Don't interfere with modifier keys
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    const key = e.key.toLowerCase();
    const validKeys = ['w', 'a', 's', 'd', 'q', 'e'];
    
    if (validKeys.includes(key)) {
      // Prevent default behavior for these keys
      e.preventDefault();
      
      // Add to pressed keys set
      pressedKeys.add(key);
      
      // Handle the key press
      handleKeyPress(key);
    }
  });
  
  document.addEventListener('keyup', function(e) {
    const key = e.key.toLowerCase();
    pressedKeys.delete(key);
  });
  
  // Listen for messages from popup to toggle extension
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggle') {
      isEnabled = !isEnabled;
      sendResponse({ enabled: isEnabled });
    } else if (request.action === 'getStatus') {
      sendResponse({ enabled: isEnabled });
    }
  });
  
  // Visual indicator when extension is active
  function createIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'wasd-controller-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #4CAF50;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      font-weight: bold;
      z-index: 999999;
      transition: opacity 0.3s;
      opacity: 0;
      pointer-events: none;
    `;
    indicator.textContent = 'WASD Controller Active';
    document.body.appendChild(indicator);
    
    return indicator;
  }
  
  // Show indicator briefly when page loads
  const indicator = createIndicator();
  setTimeout(() => {
    indicator.style.opacity = '1';
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }, 500);
  
  // Update indicator based on enabled state
  function updateIndicator() {
    if (isEnabled) {
      indicator.style.background = '#4CAF50';
      indicator.textContent = 'WASD Controller Active';
    } else {
      indicator.style.background = '#f44336';
      indicator.textContent = 'WASD Controller Disabled';
    }
  }
  
  // Show indicator when toggling
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      isEnabled = !isEnabled;
      updateIndicator();
      indicator.style.opacity = '1';
      setTimeout(() => {
        indicator.style.opacity = '0';
      }, 1500);
    }
  });
  
})();