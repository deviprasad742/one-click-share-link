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

document.addEventListener('DOMContentLoaded', function () {

    $(function () {
        $("#tabs").tabs({
            event: "mouseover"
        });
    });

    var sendButton = document.getElementById("send-button-id");
    var text = document.createTextNode(">> Send Link");
    sendButton.appendChild(text);
    document.getElementById("send-button-div").appendChild(sendButton);
    sendButton.style.background = 'white';
    sendButton.style.color = 'black';

    $(function () {
        $("button")
            .button()
            .click(function (event) {
                event.preventDefault();
            });
    });

    document.body.appendChild(document.createElement("br"));
    sendButton.addEventListener("click", function () {

        chrome.tabs.getSelected(null, function (tab) {
            var emailField = document.getElementById(TEXT_EMAIL_ID);
            var emailId = emailField.value;
            if (emailId != null) {
                //temporarily show the sending status by color change.
                sendButton.style.background = "green";
                sendButton.style.color = 'white';
                sendLink(emailId, tab.title, tab.url, function (result) {
                    sendButton.style.background = 'white';
                    sendButton.style.color = 'black';
                    loadOutLinks(loadUI);
                });
            }
        });

    });

    checkAndsyncData(loadUI);
});


function loadUI(loaded) {
    console.log("Received callback data updated: " + loaded);
    addLinks(DIV_IN_LINKS_ID, getInLinks());
    addLinks(DIV_OUT_LINKS_ID, getOutLinks());
}

function addLinks(divId, linksJson) {
    var linksArr = JSON.parse(linksJson);
    document.getElementById(divId).innerHTML = "";
    for (i in linksArr) {
        var link = document.createElement('a');
        var itemIndex = parseInt(i) + 1;
        var curLink = linksArr[i];
        var title = itemIndex + ". " + curLink[JSON_KEY_TITLE];
        link.textContent = trimTitle(title) + "-" + curLink[JSON_KEY_NAME];
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