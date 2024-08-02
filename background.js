// Initialize the blocking state to true by default
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['enableBlocking'], (result) => {
    if (result.enableBlocking === undefined) {
      chrome.storage.local.set({ enableBlocking: true });
    }
  });

  // Create context menu item
  chrome.contextMenus.create({
    id: "blockAd",
    title: "Block this ad",
    contexts: ["link"]
  });
});

// Handle context menu click event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "blockAd") {
    const adUrl = info.linkUrl;

    // Add the URL to the blocked sites
    chrome.storage.local.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      if (!blockedSites.includes(adUrl)) {
        blockedSites.push(adUrl);
        chrome.storage.local.set({ blockedSites }, () => {
          updateBlockingRules();
        });
      }
    });
  }
});

// Listen for changes to enableBlocking and update rules accordingly
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.enableBlocking) {
    updateBlockingRules();
  }
});

// Function to update blocking rules
function updateBlockingRules() {
  chrome.storage.local.get(['enableBlocking', 'blockedSites'], (result) => {
    const enableBlocking = result.enableBlocking;
    const blockedSites = result.blockedSites || []; // Ensure blockedSites is an array

    const rules = (enableBlocking ? blockedSites : []).map((site, index) => ({
      "id": index + 1,
      "priority": index + 1,
      "action": {
        "type": "block"
      },
      "condition": {
        "urlFilter": site,
        "resourceTypes": ["main_frame", "sub_frame"]
      }
    }));

    // Clear existing rules and apply the new set
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Array.from(Array(1000).keys()).slice(1)  // Remove up to 1000 rules
    }, () => {
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
    });
  });
}
