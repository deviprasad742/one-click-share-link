var pollInterval = 1000 * 60; // 1 minute, in milliseconds

function startRequest() {
    updateBadge();
    window.setTimeout(startRequest, pollInterval);
}

function updateBadge() {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://one-click-share-link.herokuapp.com/links";

    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var linksArr = JSON.parse(xmlhttp.responseText);
            var bg_color = "#00FF00";
            var bg_text = "" + linksArr.length;
            chrome.browserAction.setBadgeBackgroundColor({
                color: bg_color
            });
            chrome.browserAction.setBadgeText({
                text: bg_text
            });
        }
    };
}


document.addEventListener('DOMContentLoaded', function () {
    startRequest();
});