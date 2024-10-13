/*global chrome:true*/

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // listen for messages sent from background.js

  if (request.name === "GetCommentsCommand") {
    console.log("received message from Btn");
    chrome.storage.local.set({ tabId: request.tabId });
    chrome.tabs.sendMessage(request.tabId, {
      name: "GetComments",
      tabId: request.tabIdid,
    });
    sendResponse(true);
  }

  if (request.name === "NextPageCommand") {
    console.log("received message about next page");
    const tabData = await chrome.storage.local.get("tabId");
    console.log(tabData.tabId);
    console.log(`should navigate to: ${request.shouldNavigate},`);
    if (request.shouldNavigate) {
      chrome.tabs.update(tabData.tabId, { url: request.url }).then(() => {
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
          if (tabId === tabData.tabId) {
            if (tab.url === "chrome://") return undefined;
            if (changeInfo.status === "complete") {
              setTimeout(async () => {
                console.log("about to send message");
                const receivedComments = await chrome.tabs.sendMessage(
                  tabData.tabId,
                  {
                    name: "NextPageGetComments",
                    tabId: tabData.tabId,
                  }
                );
                console.log("comments received", receivedComments);
              }, 2000);
            }
          }
        });
      });
    }
  }
});
