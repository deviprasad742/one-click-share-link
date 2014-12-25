var pollInterval = 1000 * 60; // 1 minute, in milliseconds

function startRequest() {
    updateBadge();
    window.setTimeout(startRequest, pollInterval);
}


PARAM_ACCESS_TOKEN = "access-token";
PARAM_EMAIL_ID = "email-id";
KEY_NAME = "name";
KEY_IMAGE = "image";
URL_SEND = "send";

KEY_URL_RECENT = "last-contact";
KEY_URL_FRIENDS = "friends";
KEY_URL_IN_LINKS = "in-links";
KEY_URL_IN_LINKS_SIZE = "in-links-size";
KEY_URL_OUT_LINKS = "out-links";
KEY_URL_HAS_IN_LINKS = "has-in-links";
KEY_URL_CLEAR_IN_LINKS = "clear-in-links";

JSON_KEY_NAME = "name";
JSON_KEY_TITLE = "title";
JSON_KEY_URL = "url";
JSON_KEY_EMAIL_ID = "emailId";
JSON_KEY_IMAGE = "image";

MAIL_STATUS_INVALID = "invalid";
MAIL_STATUS_PROMPT_MAIL = "prompt_mail";
EXTENSION_URL = "https://chrome.google.com/webstore/detail/1-click-share-link/ahphcmppigmmngfoehcncdfpafapijmj";
EXTENSION_NAME = "1-Click Share Link";


function updateBadge() {
    if (hasCredentials()) {
        fetchData(function (result) {
            if (result == "true") {
                updateInLinks(true);
            } else {
                setBadgeText(localStorage[KEY_URL_IN_LINKS_SIZE]);
            }
        }, KEY_URL_HAS_IN_LINKS);
    } else {
        setBadgeText(0);
    }
}

function updateInLinks(notify) {
    console.log("Updating in links information");
    fetchData(null, KEY_URL_IN_LINKS);
    fetchData(function (result) {
        setBadgeText(result);

        if (notify) {
            notifyIncomingLinks(result);
        }
    }, KEY_URL_IN_LINKS_SIZE);
}

function notifyIncomingLinks(size) {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
    String title = "You have " +

    var notification = new Notification(title, {
        icon: 'icon16.png',
        body: url,
    });

    notification.onclick = function () {
        chrome.tabs.create({
            url: "inbox.html"
        });
        popup.cancel();
    };
}

function setBadgeText(count) {
    var bg_color = "#00FF00";
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
    xmlhttp.setRequestHeader(PARAM_EMAIL_ID, localStorage[PARAM_EMAIL_ID]);
    xmlhttp.setRequestHeader(PARAM_ACCESS_TOKEN, localStorage[PARAM_ACCESS_TOKEN]);
}

function createLocalStorage(jsonData) {
    localStorage[KEY_NAME] = jsonData.name;
    localStorage[PARAM_EMAIL_ID] = jsonData.emailId;
    localStorage[KEY_IMAGE] = jsonData.image;
    localStorage[PARAM_ACCESS_TOKEN] = jsonData.accessToken;
}

function clearLocalStorage() {
    localStorage.clear();
}

function hasCredentials() {
    return localStorage[PARAM_EMAIL_ID] != null;
}

function checkAndsyncData(callback) {
    if (hasCredentials()) {
        if (isDataUnSynced()) {
            forceSyncData(callback)
        } else {
            fetchData(function (result) {
                if (result == "true") {
                    forceSyncData(callback)
                } else {
                    callback(true);
                }

            }, KEY_URL_HAS_IN_LINKS);
        }
    } else {
        callback(false);
    }
}

function isDataUnSynced() {
    return isBlank(localStorage[KEY_URL_IN_LINKS]);
}

function forceSyncData(data_loaded) {
    var loadedFunc = function (result) {
        data_loaded(true);
    };

    fetchData(loadedFunc, KEY_URL_RECENT);
    fetchData(loadedFunc, KEY_URL_IN_LINKS);
    fetchData(loadedFunc, KEY_URL_OUT_LINKS);
    fetchData(loadedFunc, KEY_URL_FRIENDS);
    updateBadge();
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
            console.log(key_url + ": " + result);
            if (callback != null) {
                callback(result);
            }
        }
    };
}


function loadOutLinks(callback) {
    fetchData(callback, KEY_URL_OUT_LINKS);
}

function clearInLinks(callback) {
    fetchData(callback, KEY_URL_CLEAR_IN_LINKS);
    localStorage[KEY_URL_IN_LINKS_SIZE] = 0;
    setBadgeText(0);
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

function getFriends() {
    return localStorage[KEY_URL_FRIENDS];
}

function sendLink(toEmail, title, url, callback) {
    var xmlhttp = new XMLHttpRequest();
    var url = DOMAIN_URL + URL_SEND + "?to=" + toEmail + "&title=" + title + "&url=" + url;
    xmlhttp.open("POST", url, true);
    addCredentials(xmlhttp);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var result = xmlhttp.responseText;
            console.log(URL_SEND + ": " + result);
            if (callback != null) {
                callback(result);
            }
        }
    };
}

function isValidLinkResult(result) {
    if (!isBlank(result)) {
        var jsonData = JSON.parse(result);
        if (jsonData[JSON_KEY_TITLE] != MAIL_STATUS_INVALID) {
            return true;
        }
    }
    return false;
}

function isPromptMail(result) {
    if (!isBlank(result)) {
        var jsonData = JSON.parse(result);
        if (jsonData[JSON_KEY_TITLE] == MAIL_STATUS_PROMPT_MAIL) {
            return true;
        }
    }
    return false;
}

function isBlank(string) {
    return (!string || /^\s*$/.test(string));
}

function disableButton(button) {
    button.setAttribute('disabled', 'disabled');
}

function enableButton(button) {
    button.removeAttribute('disabled');
}

function showElement(element) {
    element.style.display = "inline";
}

function hideElement(element) {
    element.style.display = "none";
}