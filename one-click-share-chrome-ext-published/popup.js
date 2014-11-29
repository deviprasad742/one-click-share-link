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

document.addEventListener('DOMContentLoaded', function () {
    titleField = document.getElementById("link-title");
    urlField = document.getElementById("link-url");
    fillLinkInfo();

    $(function () {
        $("#tabs").tabs({
            event: "mouseover"
        });
    });

    var sendButton = document.getElementById(SEND_BUTTON_ID);

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
        var sendButton = document.getElementById(SEND_BUTTON_ID);
        //temporarily show the sending status by color change.
        var oldStyleBg = sendButton.style.background;
        var oldStyleColor = sendButton.style.color;

        sendButton.style.background = "green";
        sendButton.style.color = "white";


        var title = titleField.value;
        var url = urlField.value;
        if (!isBlank(title)) {
            sendLink(email, title, url, function (result) {
                sendButton.style.background = oldStyleBg;
                sendButton.style.color = oldStyleColor;
                forceSyncData(loadUI);
            });
        }
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
    }
}

function addLinks(divId, linksJson) {
    if (isBlank(linksJson)) {
        return;
    }

    var linksArr = JSON.parse(linksJson);
    document.getElementById(divId).innerHTML = "";
    for (i in linksArr) {
        var link = document.createElement('a');
        var itemIndex = parseInt(i) + 1;
        var curLink = linksArr[i];
        var title = itemIndex + ". " + curLink[JSON_KEY_TITLE];
        link.textContent = trimTitle(title) + "-[" + curLink[JSON_KEY_NAME] + "]";
        link.href = curLink[JSON_KEY_URL];
        link.onclick = function (loopIndex) {
            return function () {
                var location = linksArr[loopIndex][JSON_KEY_URL];
                chrome.tabs.create({
                    active: true,
                    url: location
                });
                console.log(location + " link clicked");
            }
        }(i);

        document.getElementById(divId).appendChild(link);
        document.getElementById(divId).appendChild(document.createElement("br"));
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