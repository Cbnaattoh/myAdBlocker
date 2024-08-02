// Get references to DOM elements
const statusElement = document.getElementById('status');
const toggleButton = document.getElementById('toggle');

// Function to update the status text and color
function updateStatus(isBlockingActive) {
  if (isBlockingActive) {
    statusElement.textContent = 'active';
    statusElement.className = 'status-active';
  } else {
    statusElement.textContent = 'inactive';
    statusElement.className = 'status-inactive';
  }
}

// Restore the state from chrome.storage
chrome.storage.local.get(['enableBlocking'], (result) => {
  const isBlockingActive = result.enableBlocking !== undefined ? result.enableBlocking : false;
  updateStatus(isBlockingActive);
});

// Add event listener to toggle button
toggleButton.addEventListener('click', () => {
  // Toggle the blocking state
  chrome.storage.local.get(['enableBlocking'], (result) => {
    const isBlockingActive = result.enableBlocking !== undefined ? result.enableBlocking : false;
    const newBlockingState = !isBlockingActive;
    updateStatus(newBlockingState);

    // Save the new state
    chrome.storage.local.set({ enableBlocking: newBlockingState });
  });
});
