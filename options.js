const siteInput = document.getElementById('siteInput');
const addSiteButton = document.getElementById('addSiteButton');
const siteList = document.getElementById('siteList');

// Load the current blocked sites
function loadBlockedSites() {
  chrome.storage.local.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    siteList.innerHTML = '';
    blockedSites.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site;
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => removeSiteFromBlockList(site));
      li.appendChild(removeButton);
      siteList.appendChild(li);
    });
    updateBlockingRules(blockedSites);
  });
}

// Add a site to the block list
function addSiteToBlockList(site) {
  chrome.storage.local.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    if (!blockedSites.includes(site)) {
      blockedSites.push(site);
      chrome.storage.local.set({ blockedSites: blockedSites }, () => {
        loadBlockedSites();  // Refresh the list
      });
    }
  });
}

// Remove a site from the block list
function removeSiteFromBlockList(site) {
  if (confirm(`Are you sure you want to remove ${site} from the blocked sites list?`)) {
    chrome.storage.local.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      const newBlockedSites = blockedSites.filter(s => s !== site);
      chrome.storage.local.set({ blockedSites: newBlockedSites }, () => {
        loadBlockedSites();  // Refresh the list
      });
      updateBlockingRules(newBlockedSites);  // Update blocking rules after removal
    });
  } else {
    console.log(`${site} was not removed from the blocked sites list.`);
  }
}

// Update blocking rules based on stored sites
function updateBlockingRules(sites) {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    // Extract existing rule IDs that need to be removed
    const existingRuleIds = rules.map(rule => rule.id);

    // Determine which rules to remove
    const ruleIdsToRemove = existingRuleIds.filter(id => {
      // Check if the rule id corresponds to a site that was removed
      const siteIndex = sites.findIndex(site => site.id === id);
      return siteIndex === -1;
    });

    // Remove old rules
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove
    }, () => {
      // Add new rules
      const rulesToAdd = sites.map((site, index) => ({
        "id": index + 1,  // Ensure unique IDs for each rule
        "priority": index + 1,
        "action": {
          "type": "block"
        },
        "condition": {
          "urlFilter": site,
          "resourceTypes": ["main_frame", "sub_frame"]
        }
      }));

      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rulesToAdd
      });
    });
  });
}

// Event listener for adding sites
addSiteButton.addEventListener('click', () => {
  const site = siteInput.value.trim();
  if (site) {
    addSiteToBlockList(site);
    siteInput.value = '';  // Clear input
  }
});

// Load sites on page load
loadBlockedSites();
