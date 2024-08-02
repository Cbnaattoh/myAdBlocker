chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "blockAd",
      title: "Block this ad",
      contexts: ["link"]
    });
  });
  