console.log("YouTube Auto Skip: content script loaded");

function findAndSkipAd() {
    const selectors = [
        ".ytp-ad-skip-button",
        ".ytp-ad-skip-button-modern",
        ".ytp-ad-skip-button-container button",
        "button.ytp-ad-skip-button-modern"
    ];

    for (const selector of selectors) {
        const button = document.querySelector(selector);

        if (button) {
            console.log("YouTube Auto Skip: Skip button found");

            button.click();

            return true;
        }
    }

    return false;
}

function checkForAd() {
    const video = document.querySelector("video");

    if (!video) {
        return;
    }

    const adShowing =
        document.querySelector(".ad-showing") ||
        document.querySelector(".ytp-ad-player-overlay");

    if (adShowing) {
        console.log("YouTube Auto Skip: Advertisement detected");

        findAndSkipAd();
    }
}

const observer = new MutationObserver(() => {
    checkForAd();
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

setInterval(checkForAd, 500);

console.log("YouTube Auto Skip: observer started");