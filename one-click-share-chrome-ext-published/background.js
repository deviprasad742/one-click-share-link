var pollInterval = 1000 * 60; // 1 minute, in milliseconds

function startRequest() {
    updateBadge();
    window.setTimeout(startRequest, pollInterval);
}

DOMAIN_URL = "https://one-click-share-link-dev.herokuapp.com/";
KEY_ACCESS_TOKEN = "access-token";
KEY_EMAIL_ID = "email-id";

function updateBadge() {
    var xmlhttp = new XMLHttpRequest();
    var url = DOMAIN_URL + "in-links-size";
    xmlhttp.open("GET", url, true);
    addCredentials(xmlhttp);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var linksArr = xmlhttp.responseText;
            var bg_color = "#0000FF";
            var bg_text = linksArr > 0 ? "" + linksArr : "";
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

function addCredentials(xmlhttp) {
    xmlhttp.setRequestHeader(KEY_EMAIL_ID, localStorage[KEY_EMAIL_ID]);
    xmlhttp.setRequestHeader(KEY_ACCESS_TOKEN, localStorage[KEY_ACCESS_TOKEN]);
}


function checkLogin() {
    var xmlhttp = new XMLHttpRequest();
    var url = DOMAIN_URL + "is-valid";
    xmlhttp.open("GET", url, true);
    addCredentials(xmlhttp);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var isValid = xmlhttp.responseText;
            if (isValid == "true") {

            } else {

            }
        }
    };
};



setIcon();
chrome.browserAction.onClicked.addListener(checkLogin);