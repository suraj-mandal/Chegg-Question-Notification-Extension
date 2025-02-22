// script to reload the page in the background and check if the question is available or not.

const urlToMonitor = "https://expert.chegg.com/qna/authoring/answer"
const checkInterval = 180;
let targetTabId = null;

function checkForQuestions() {
    const questionNotAvailable = document.body.innerText.includes("Unfortunately, no Qs are available in your queue at the moment.");
    if (!questionNotAvailable) {
        console.log("A question has been found. Notify")
        chrome.runtime.sendMessage({notify: true})
            .then(() => {
                console.log("Successfully notified");
            })
            .catch(error => console.error(error));
    } else {
        console.log("Not questions available right now");
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "StartMonitoring") {
        if (message.tabUrl && message.tabUrl === urlToMonitor) {
            targetTabId = message.tabId;
            chrome.alarms.create("refreshCheck", {periodInMinutes: checkInterval / 60})
                .then(() => {
                    console.log("Alarm created for monitoring the tab");
                    sendResponse({status: "Monitoring started on tab " + targetTabId});
                })
                .catch((e) => {
                    console.error(e);
                    sendResponse({status: "Error creating monitoring the tab", error: e});
                })
        }
    }
    if (message.action === "StopMonitoring") {
        chrome.alarms.clearAll()
            .then(() => {
                console.log("Successfully stopped all existing monitors");
                sendResponse({status: "Search for questions have stopped."})
            })
            .catch((e) => {
                console.error(e);
                sendResponse({status: "Error stopping the search", error: e});

            })
    }
});


chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "refreshCheck" && targetTabId) {
        chrome.tabs.reload(targetTabId)
            .then(() => {
                console.log("Tab has been reloaded. Checking whether questions are available or not.")

            })
        setTimeout(() => {
            chrome.scripting.executeScript({
                target: {tabId: targetTabId},
                function: checkForQuestions
            })
                .then(() => {
                    console.log("Successfully started the search");
                })
                .catch((e) => {
                    console.error(e);
                })
        });
    }
})

chrome.runtime.onMessage.addListener((message) => {
    if (message.notify) {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "./icons/sample.png",
            title: "Question is Available",
            message: "Please check the website to see which question is available"
        })
            .then(() => {
                console.log("Successfully created the notification");
            })
            .catch((e) => {
                console.error(e);
            })
    }
})