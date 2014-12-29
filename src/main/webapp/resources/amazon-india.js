TAG = "&tag=1clishalin-21";
DIV_MAIN_LINK = "main-link-div";
DIV_REC_LINK = "rec-link-div";
DIV_TREND_LINK = "trend-link-div";

USER_ID = "amazon-india";
DOMAIN_URL = "https://one-click-share-link-dev.herokuapp.com/";
URL_REC_LINKS = "rec-links";
URL_TREND_LINKS = "trend-links"

JSON_KEY_TITLE = "title";
JSON_KEY_URL = "url";

//DOMAIN_URL = "https://one-click-share-link-dev.herokuapp.com/";
DOMAIN_URL = "https://one-click-share-link.herokuapp.com/";

document.addEventListener('DOMContentLoaded', initUI);

function initUI() {
    appendMainLink();
    addLinks(DIV_REC_LINK, URL_REC_LINKS);
    addLinks(DIV_TREND_LINK, URL_TREND_LINKS);
}

function appendMainLink() {
    var linkElem = document.createElement('a');
    var link = get("link");
    var title = get("title");
    if (link == null) {
        link = encodeURI("https://www.amazon.in?");
        title = "Visit Amazon";
    }
    linkElem.href = link + TAG;
    linkElem.innerHTML = title;
    document.getElementById(DIV_MAIN_LINK).appendChild(linkElem);
}

function addLinks(divId, key_url) {
    var addLinks = function (jsonData) {
        var linksArr = JSON.parse(jsonData);
        for (i in linksArr) {
            var itemIndex = parseInt(i) + 1;
            var curLink = linksArr[i];
            var title = curLink[JSON_KEY_TITLE];
            var link = curLink[JSON_KEY_URL];

            var linkElem = document.createElement('a');
            linkElem.href = link + TAG;
            linkElem.innerHTML = title;

            var linkDivElem = document.createElement('div');
            linkDivElem.setAttribute('class', 'links-div');
            linkDivElem.appendChild(linkElem);
            document.getElementById(divId).appendChild(linkDivElem);
        }
    };
    fetchData(addLinks, key_url);
}




function get(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}


function fetchData(callback, key_url) {
    var xmlhttp = new XMLHttpRequest();
    var url = DOMAIN_URL + key_url + "?id=" + USER_ID;
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
            var result = xmlhttp.responseText;
            console.log(key_url + ": " + result);
            if (callback != null) {
                callback(result);
            }
        }
    };
}