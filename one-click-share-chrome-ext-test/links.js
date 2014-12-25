CSS_LINKS_UNREAD_CLASS = 'links-unread-class';
CSS_LINKS_READ_CLASS = 'links-class';


var MAX_CHAR_LENGTH = 45;

function trimTitle(string) {

    if (string.length > MAX_CHAR_LENGTH) {
        return string.substring(0, MAX_CHAR_LENGTH - 3) + "...";
    }
    return string;

}

function addLinks(divId, linksJson, isInlink) {
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

        var linkDivElem = document.createElement('div');
        linkDivElem.setAttribute('class', 'in-links-div');
        var linkElem = document.createElement('a');

        var unread = curLink[JSON_LINK_KEY_UNREAD];
        if (unread) {
            linkElem.setAttribute('class', CSS_LINKS_UNREAD_CLASS);
        } else {
            linkElem.setAttribute('class', CSS_LINKS_READ_CLASS);
        }
        //commenting the below line allows customization of style for links
        //linkElem.href = curLink[JSON_KEY_URL];
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
                var inCurLink = linksArr[loopIndex];
                var urlStr = inCurLink[JSON_KEY_URL];
                chrome.tabs.create({
                    active: true,
                    url: urlStr
                });

                if (isInlink) {
                    var unread = inCurLink[JSON_LINK_KEY_UNREAD];
                    if (unread) {
                        markLinkRead(inCurLink);
                        location.reload();
                    }
                }
            }
        }(i);

        document.getElementById(divId).appendChild(linkDivElem);
        //document.getElementById(divId).appendChild(senderDivElem);
    }
}