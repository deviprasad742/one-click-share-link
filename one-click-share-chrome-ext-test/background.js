PARAM_ACCESS_TOKEN = "access-token";
PARAM_EMAIL_ID = "email-id";
KEY_NAME = "name";
KEY_IMAGE = "image";
URL_SEND = "send";
URL_DELETE_LINK = "delete-link";
URL_DELETE_IN_LINK = "delete-in-link";

KEY_URL_RECENT = "last-contact";
KEY_URL_FRIENDS = "friends";
KEY_URL_IN_LINKS = "in-links";
KEY_URL_IN_LINKS_SIZE = "in-links-size";
KEY_URL_OUT_LINKS = "out-links";
KEY_URL_HAS_IN_LINKS = "has-in-links";
KEY_URL_CLEAR_IN_LINKS = "clear-in-links";
KEY_URL_BADGE = "badge";

KEY_URL_HAS_IN_UNREAD_UPDATE = "has-in-unread-update";
KEY_URL_HAS_OUT_UNREAD_UPDATE = "has-out-unread-update";
KEY_URL_HAS_UPDATES = "has-updates";
URL_MARK_READ = "mark-read";


JSON_KEY_NAME = "name";
JSON_KEY_TITLE = "title";
JSON_KEY_URL = "url";
JSON_KEY_EMAIL_ID = "emailId";
JSON_KEY_IMAGE = "image";
JSON_LINK_KEY_UNREAD = "unread";


MAIL_STATUS_INVALID = "invalid";
MAIL_STATUS_PROMPT_MAIL = "prompt_mail";
EXTENSION_URL = "https://chrome.google.com/webstore/detail/1-click-share-link/ahphcmppigmmngfoehcncdfpafapijmj";
EXTENSION_NAME = "1-Click Share Link";


function startRequest() {
    setBadgeText(localStorage[KEY_URL_BADGE]);
    updateInBackGround();
    window.setTimeout(startRequest, POLL_INTERVAL);
}


function updateInBackGround() {
    if (hasCredentials()) {
        fetchData(function (result) {
            if (result == "true") {
                checkAndUpdateInLinks();
                checkUnreadAndUpdateOutLinks();
            }
        }, KEY_URL_HAS_UPDATES);
    } else {
        setBadgeText("");
    }
}

function checkAndUpdateInLinks(callback) {
    fetchData(function (result) {
        if (result == "true") {
            updateInLinks(callback, true);
            fetchData(null, KEY_URL_RECENT);
        } else {
            checkUnreadAndUpdateInLinks(callback);
        }
    }, KEY_URL_HAS_IN_LINKS);
}

function updateInLinks(callback, notify) {
    console.log("Updating in links information");
    fetchData(callback, KEY_URL_IN_LINKS);
    readAndUpdateBadge();
    fetchData(function (result) {
        if (notify) {
            notifyIncomingLinks(result);
        }
    }, KEY_URL_IN_LINKS_SIZE);
}

function readAndUpdateBadge() {
    fetchData(function (result) {
        setBadgeText(result);
    }, KEY_URL_BADGE);
}

function setBadgeText(textVal) {
    if (textVal == null) {
        textVal = "";
    }

    var textColor = "#000000";
    if (textVal.indexOf("/") != -1) {
        if (textVal.charAt(0) == "0") {
            textVal = textVal.substring(2);
            textColor = "#0000FF"
        } else {
            textColor = "#00B000"
        }
    } else {
        textColor = "#FF0000"
    }

    chrome.browserAction.setBadgeBackgroundColor({
        color: textColor
    });
    chrome.browserAction.setBadgeText({
        text: textVal
    });
}


function checkUnreadAndUpdateInLinks(callback) {
    fetchData(function (result) {
        if (result == "true") {
            updateInLinks(callback, false);
        }
    }, KEY_URL_HAS_IN_UNREAD_UPDATE);
}

function checkUnreadAndUpdateOutLinks(callback) {
    fetchData(function (result) {
        if (result == "true") {
            updateOutLinks(callback);
        }
    }, KEY_URL_HAS_OUT_UNREAD_UPDATE);
}

function updateOutLinks(callback) {
    console.log("Updating out links information");
    readAndUpdateBadge();
    fetchData(callback, KEY_URL_OUT_LINKS);
}


function notifyIncomingLinks(size) {
    if (size == 0) {
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    var message = "You have " + size + " incoming link(s). Click to view them";
    var notification = new Notification(EXTENSION_NAME, {
        icon: 'icon16.png',
        body: message,
    });

    notification.onclick = function () {
        chrome.tabs.create({
            url: "inbox.html"
        });
    };

    setTimeout(function () {
        notification.close();
    }, 10000);
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
                    checkAndUpdateNotifications(callback);
                }

            }, KEY_URL_HAS_IN_LINKS);
        }
    } else {
        callback(false);
    }
}

function checkAndUpdateNotifications(data_loaded) {
    var loadedFunc = getLoadedFunc(data_loaded);
    checkUnreadAndUpdateInLinks(loadedFunc);
    checkUnreadAndUpdateOutLinks(loadedFunc);
}

function isDataUnSynced() {
    return isBlank(localStorage[KEY_URL_IN_LINKS]);
}

function forceSyncData(data_loaded) {
    var loadedFunc = getLoadedFunc(data_loaded);
    fetchData(loadedFunc, KEY_URL_RECENT);
    fetchData(loadedFunc, KEY_URL_FRIENDS);
    fetchData(loadedFunc, KEY_URL_IN_LINKS);
    fetchData(loadedFunc, KEY_URL_OUT_LINKS);
    setBadgeText("");
}

function getLoadedFunc(data_loaded) {
    return function (result) {
        data_loaded(true);
    };
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

function clearInLinks() {
    var callback = function (result) {
        readAndUpdateBadge();
    };
    fetchData(callback, KEY_URL_CLEAR_IN_LINKS);
}

function getInLinks() {
    clearInLinks();
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
    title = encodeURIComponent(title);
    url = encodeURIComponent(url);
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

function deleteLink(toEmail, title, url, callback) {
    var xmlhttp = new XMLHttpRequest();
    title = encodeURIComponent(title);
    url = encodeURIComponent(url);
    var url = DOMAIN_URL + URL_DELETE_LINK + "?to=" + toEmail + "&title=" + title + "&url=" + url;
    xmlhttp.open("POST", url, true);
    addCredentials(xmlhttp);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var result = xmlhttp.responseText;
            console.log(URL_DELETE_LINK + ": " + result);
            if (callback != null) {
                callback(result);
            }
        }
    };
}

function deleteInLink(fromEmail, title, url, callback) {
    var xmlhttp = new XMLHttpRequest();
    title = encodeURIComponent(title);
    url = encodeURIComponent(url);
    var url = DOMAIN_URL + URL_DELETE_IN_LINK + "?from=" + fromEmail + "&title=" + title + "&url=" + url;
    xmlhttp.open("POST", url, true);
    addCredentials(xmlhttp);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var result = xmlhttp.responseText;
            console.log(URL_DELETE_IN_LINK + ": " + result);
            if (callback != null) {
                callback(result);
            }
        }
    };
}


function markLinkRead(link) {
    var fromEmail = link[JSON_KEY_EMAIL_ID];
    var title = link[JSON_KEY_TITLE];
    var url = link[JSON_KEY_URL];

    title = encodeURIComponent(title);
    url = encodeURIComponent(url);

    var xmlhttp = new XMLHttpRequest();
    var url = DOMAIN_URL + URL_MARK_READ + "?from=" + fromEmail + "&title=" + title + "&url=" + url;
    xmlhttp.open("POST", url, true);
    addCredentials(xmlhttp);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var result = xmlhttp.responseText;
            console.log(URL_MARK_READ + ": " + result);
            // force and update of links to update read status
            updateInBackGround();
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