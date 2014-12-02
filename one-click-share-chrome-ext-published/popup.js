var controller = chrome.extension.getBackgroundPage();

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var MAX_CHAR_LENGTH = 45;

function trimTitle(string) {

    if (string.length > MAX_CHAR_LENGTH) {
        return string.substring(0, MAX_CHAR_LENGTH - 3) + "...";
    }
    return string;

}

DIV_IN_LINKS_ID = "in-links-content-div";
DIV_OUT_LINKS_ID = "out-links-content-div";
DIV_LAST_CONTACT_ID = "last-contact-div";
TEXT_EMAIL_ID = "email-id"
SEND_BUTTON_ID = "send-button";

var titleField, urlField;
var linkStatusField, sendButton;
var avblFrenz;

document.addEventListener('DOMContentLoaded', function () {
    titleField = document.getElementById("link-title");
    urlField = document.getElementById("link-url");
    linkStatusField = document.getElementById("link-status");
    sendButton = document.getElementById(SEND_BUTTON_ID);

    hideElement(linkStatusField);
    fillLinkInfo();

    $(function () {
        $("#tabs").tabs({
            event: "mouseover"
        });
    });

    $(function () {
        $("button")
            .button()
            .click(function (event) {
                event.preventDefault();
            });
    });

    sendButton.addEventListener("click", function () {
        var emailField = document.getElementById(TEXT_EMAIL_ID);
        var emailId = emailField.value;
        sendLinkTo(emailId);
    });

    // first load ui with stored values
    loadUI(true);
    // load ui later after syncing data
    checkAndsyncData(loadUI);
});


function sendLinkTo(email) {
    if (!isBlank(email)) {
        //temporarily show the sending status by color change.
        var oldStyleBg = sendButton.style.background;
        var oldStyleColor = sendButton.style.color;

        sendButton.style.background = "green";
        sendButton.style.color = "white";
        linkStatusField.textContent = "Sending Link...";
        linkStatusField.style.color = "blue";
        showElement(linkStatusField);

        var title = titleField.value;
        var url = urlField.value;
        if (!isBlank(title)) {
            sendLink(email, title, url, function (result) {
                sendButton.style.background = oldStyleBg;
                sendButton.style.color = oldStyleColor;
                updateLinkStatus(result);
                forceSyncData(loadUI);
            });
        }
    }
}

function updateLinkStatus(result) {
    if (isValidLinkResult(result)) {
        linkStatusField.textContent = "Link sent successfully.";
        linkStatusField.style.color = "green";
    } else {
        linkStatusField.textContent = "Failed to send link.";
        linkStatusField.style.color = "red";
    }
}

function fillLinkInfo() {
    chrome.tabs.getSelected(null, function (tab) {
        titleField.value = tab.title;
        urlField.value = tab.url;
    });
}



function loadUI(loaded) {
    console.log("Received callback data updated: " + loaded);
    if (loaded) {
        addLinks(DIV_IN_LINKS_ID, getInLinks());
        addLinks(DIV_OUT_LINKS_ID, getOutLinks());
        addRecentContacts(DIV_LAST_CONTACT_ID, getRecentContacts());

        avblFrenz = getAvblFrenz();

        $(function () {
            $(".auto-frnd").autocomplete({
                source: avblFrenz
            });
        });

    }
}

function getAvblFrenz() {
    var avblFrenz = [];
    var jsonText = getFriends();
    if (!isBlank(jsonText)) {
        var jsonArr = JSON.parse(jsonText);
        for (i in jsonArr) {
            var emailId = jsonArr[i][JSON_KEY_EMAIL_ID];
            avblFrenz.push(emailId);
        }
        console.log("Freinds List: " + avblFrenz);
    }
    return avblFrenz;
}

function addLinks(divId, linksJson) {
    if (isBlank(linksJson)) {
        return;
    }

    var linksArr = JSON.parse(linksJson);
    document.getElementById(divId).innerHTML = "";
    for (i in linksArr) {

        var itemIndex = parseInt(i) + 1;
        var curLink = linksArr[i];
        var title = itemIndex + ". " + curLink[JSON_KEY_TITLE];
        var senderName = curLink[JSON_KEY_NAME];

        /*
        linkDivElem.in-links-div(
            linkElem.a
            senderDivElem.in-sender-div(
                a
            )
        )
        */
        var linkDivElem = document.createElement('div');
        linkDivElem.setAttribute('class', 'in-links-div');

        var linkElem = document.createElement('a');
        linkElem.setAttribute('class', 'in-links-text-class');
        linkElem.href = curLink[JSON_KEY_URL];
        linkElem.innerHTML = trimTitle(title);
        linkElem.title = curLink[JSON_KEY_URL];

        var senderDivElem = document.createElement('div');
        senderDivElem.setAttribute('class', 'in-sender-div');
        senderDivElem.innerHTML = senderName;
        senderDivElem.title = curLink[JSON_KEY_EMAIL_ID];

        linkDivElem.appendChild(linkElem);
        linkDivElem.appendChild(senderDivElem);


        linkElem.onclick = function (loopIndex) {
            return function () {
                var location = linksArr[loopIndex][JSON_KEY_URL];
                chrome.tabs.create({
                    active: true,
                    url: location
                });
                console.log(location + " link clicked");
            }
        }(i);

        document.getElementById(divId).appendChild(linkDivElem);
        //document.getElementById(divId).appendChild(senderDivElem);
    }
}


function addRecentContacts(divId, contactsJson) {
    if (isBlank(contactsJson)) {
        return;
    }
    var linksArr = JSON.parse(contactsJson);
    document.getElementById(divId).innerHTML = "";
    var container = document.createElement("p");
    document.getElementById(divId).appendChild(container);

    for (i in linksArr) {
        var link = document.createElement('a');
        var itemIndex = parseInt(i) + 1;
        var curLink = linksArr[i];
        link.class = "contact";
        link.textContent = curLink[JSON_KEY_NAME];
        link.title = curLink[JSON_KEY_EMAIL_ID];
        link.href = "https://www.google.co.in";
        link.onclick = function (loopIndex) {
            return function () {
                var emailId = linksArr[loopIndex][JSON_KEY_EMAIL_ID];
                sendLinkTo(emailId);
            }
        }(i);

        var image = document.createElement('img');
        var imageUrl = curLink[JSON_KEY_IMAGE];
        if (isBlank(imageUrl)) {
            imageUrl = "icon.png";
        }
        image.src = imageUrl;
        image.style.width = "16px";
        image.style.height = "16px";
        image.align = "left";
        container.appendChild(image);
        container.appendChild(link);
        container.appendChild(document.createElement("p"));

    }
}