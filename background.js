chrome.webRequest.onCompleted.addListener((details) => {
        const parsedUrl = new URL(details.url);
        if(parsedUrl.pathname.startsWith("/api/online")) {return}
        else if(parsedUrl.pathname === "/api/forum") {
            chrome.tabs.sendMessage(details.tabId, "searchBuddy")
            return
        }
        chrome.tabs.sendMessage(details.tabId, "onlineStatus")
    },
    { urls: ['*://nxserv.gg/api/*']}
);