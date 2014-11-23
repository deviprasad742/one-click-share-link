var pollInterval = 1000 * 60; // 1 minute, in milliseconds

function startRequest() {
    updateBadge();
    window.setTimeout(startRequest, pollInterval);
}

DOMAIN_URL = "https://one-click-share-link-dev.herokuapp.com/";
//DOMAIN_URL = "https://one-click-share-link.herokuapp.com/"

KEY_ACCESS_TOKEN = "access-token";
KEY_EMAIL_ID = "email-id";
KEY_NAME = "name";
KEY_IMAGE = "image";
KEY_URL_RECENT = "last-contact";
KEY_URL_IN_LINKS = "in-links";
KEY_URL_OUT_LINKS = "out-links";



function updateBadge() {
    if (hasCredentials()) {
        var xmlhttp = new XMLHttpRequest();
        var url = DOMAIN_URL + "in-links-size";
        xmlhttp.open("GET", url, true);
        addCredentials(xmlhttp);
        xmlhttp.send();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                setBadgeText(xmlhttp.responseText);
            }
        };
    } else {
        setBadgeText(0);
    }
}

function setBadgeText(count) {
    var bg_color = "#0000FF";
    var bg_text = count > 0 ? "" + count : "";
    chrome.browserAction.setBadgeBackgroundColor({
        color: bg_color
    });
    chrome.browserAction.setBadgeText({
        text: bg_text
    });
}


document.addEventListener('DOMContentLoaded', function () {
    startRequest();
});

function addCredentials(xmlhttp) {
    xmlhttp.setRequestHeader(KEY_EMAIL_ID, localStorage[KEY_EMAIL_ID]);
    xmlhttp.setRequestHeader(KEY_ACCESS_TOKEN, localStorage[KEY_ACCESS_TOKEN]);
}

function createLocalStorage(jsonData) {
    localStorage[KEY_NAME] = jsonData.name;
    localStorage[KEY_EMAIL_ID] = jsonData.emailId;
    localStorage[KEY_IMAGE] = jsonData.image;
    localStorage[KEY_ACCESS_TOKEN] = jsonData.accessToken;
}

function clearLocalStorage() {
    localStorage.clear();
}

function hasCredentials() {
    return localStorage[KEY_EMAIL_ID] != null;
}

function syncData(callback) {
    if (hasCredentials()) {
        fetchData(null, KEY_URL_RECENT);
        fetchData(null, KEY_URL_IN_LINKS);
        fetchData(function () {
            callback(true);
        }, KEY_URL_OUT_LINKS);

    } else {
        callback(false);
    }
}

function fetchData(callback, key_url) {
    var xmlhttp = new XMLHttpRequest();
    var url = DOMAIN_URL + key_url;
    xmlhttp.open("GET", url, true);
    addCredentials(xmlhttp);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var result = xmlhttp.responseText;
            localStorage[key_url] = result;
            console.log(result);
            if (callback != null) {
                callback();
            }
        }
    };
}


function getInLinks() {
    return localStorage[KEY_URL_IN_LINKS];
}

function getOutLinks() {
    return localStorage[KEY_URL_OUT_LINKS];
}

function getRecentContacts() {
    return localStorage[KEY_URL_RECENT];
}