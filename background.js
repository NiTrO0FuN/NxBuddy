chrome.webRequest.onCompleted.addListener((details) => {
        const parsedUrl = new URL(details.url);
        if(parsedUrl.pathname.startsWith("/api/online")) {return}
        chrome.tabs.sendMessage(details.tabId, "onlineStatus")
    },
    { urls: ['*://nxserv.gg/api/*']}
);