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
		if (request.shouldNavigate) {
			chrome.tabs.update({ url: request.url }).then(() => {
				chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
					if (tabId === tabData.tabId) {
						if (tab.url === "chrome://") return undefined;
						if (changeInfo.status === "complete") {
							setTimeout(() => {
								console.log("about to send message");
								chrome.tabs.sendMessage(tabData.tabId, {
									name: "NextPageGetComments",
									tabId: tabData.tabId,
								});
							}, 2000);
						}
					}
				});
			});
		}
	}
});

/* ; */

/* chrome.webNavigation.onCompleted.addListener(
    () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Send a message to the content script in the active tab
        chrome.tabs.sendMessage(tabs[0].id, { message: "myMessage" });
      });
    },
    { url: [{ schemes: ["http", "https"] }] }
  ); */
