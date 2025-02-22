document.getElementById("start").addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true})
        .then(([tab]) => {
            console.log("tab", tab);
            if (tab) {
                chrome.runtime.sendMessage({
                    action: "StartMonitoring",
                    tabId: tab.id,
                    tabUrl: tab.url
                }, {}, (response) => {
                    if (response && response.status) {
                        alert(response.status);
                    }
                });
            } else {
                alert("No active tab found!");
            }
        })
        .catch((error) => {
            console.error(error);
        })
});

document.getElementById("stop").addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true})
        .then(([tab]) => {
            console.log(`Attempting to stop monitoring on tab: ${tab.id}`);
            chrome.runtime.sendMessage({
                action: "StopMonitoring",
                tabId: tab.id,
                tabUrl: tab.url
            }, {}, (response) => {
                if (response && response.status) {
                    console.log(response.status);
                }
            })
        })
        .catch((error) => {
            console.error(error);
        })
});