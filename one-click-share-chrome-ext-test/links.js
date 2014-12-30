CSS_LINKS_UNREAD_CLASS = 'links-unread-class';
CSS_LINKS_READ_CLASS = 'links-class';


var MAX_CHAR_LENGTH = 45;

function trimTitle(string) {

    if (string.length > MAX_CHAR_LENGTH) {
        return string.substring(0, MAX_CHAR_LENGTH - 3) + "...";
    }
    return string;

}

function addLinks(divId, linksJson, isInlink, newTab) {
    if (isBlank(linksJson)) {
        return;
    }

    var linksArr = JSON.parse(linksJson);
    document.getElementById(divId).innerHTML = "";
    for (i in linksArr) {

        var itemIndex = parseInt(i) + 1;
        var curLink = linksArr[i];

        var title = curLink[JSON_KEY_TITLE];
        var senderName = curLink[JSON_KEY_NAME];
        var unread = curLink[JSON_LINK_KEY_UNREAD];
        var urlStr = curLink[JSON_KEY_URL];

        var specChar = " ";
        if (!isInlink && !unread) {
            specChar = "\u2714";
        }
        title = itemIndex + "." + specChar + title;

        var linkDivElem = document.createElement('div');
        linkDivElem.setAttribute('class', 'in-links-div');
        var linkElem = document.createElement('a');

        if (isInlink && unread) {
            linkElem.setAttribute('class', CSS_LINKS_UNREAD_CLASS);
        } else {
            linkElem.setAttribute('class', CSS_LINKS_READ_CLASS);
        }
        //commenting the below line allows customization of style for links
        //        linkElem.href = urlStr;
        linkElem.innerHTML = trimTitle(title);
        linkElem.title = urlStr;

        var senderDivElem = document.createElement('div');
        senderDivElem.setAttribute('class', 'in-sender-div');
        senderDivElem.innerHTML = senderName;
        senderDivElem.title = curLink[JSON_KEY_EMAIL_ID];

        linkDivElem.appendChild(linkElem);
        
        var delButtonElem =  document.createElement('button');
        delButtonElem.setAttribute('class','del-button-class');
        delButtonElem.innerHTML='x';
        
        linkDivElem.appendChild(delButtonElem);
        linkDivElem.appendChild(senderDivElem);

        linkElem.onclick = function (loopIndex) {
            return function () {
                var inCurLink = linksArr[loopIndex];
                var urlStr = inCurLink[JSON_KEY_URL];
                newTab = true;
                if (newTab) {
                    chrome.tabs.create({
                        active: true,
                        url: urlStr
                    });
                }

                if (isInlink) {
                    var unread = inCurLink[JSON_LINK_KEY_UNREAD];
                    if (unread) {
                        markLinkRead(inCurLink);
                        location.reload();
                    }
                }
            }
        }(i);

        delButtonElem.onclick = function (v_button,v_curLink,v_isInlink) {
            return function () {
                v_email = v_curLink[JSON_KEY_EMAIL_ID]
                v_title = v_curLink[JSON_KEY_TITLE];
                v_url = v_curLink[JSON_KEY_URL];

                var oldStyleBg = v_button.style.background;
                var oldStyleColor = v_button.style.color;

                v_button.style.background = "crimson";
                v_button.style.color = "white";
                var fn = deleteLink;
                if (v_isInlink){
                    fn=deleteInLink;
                }
                fn(v_email, v_title, v_url, function (result) {
                    v_button.style.background = oldStyleBg;
                    v_button.style.color = oldStyleColor;
                    forceSyncData(loadUI);
                });
                
            }
        }(delButtonElem,curLink,isInlink);

        document.getElementById(divId).appendChild(linkDivElem);
        //document.getElementById(divId).appendChild(senderDivElem);
    }
}