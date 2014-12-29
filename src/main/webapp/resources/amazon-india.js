document.addEventListener('DOMContentLoaded', initUI);
TAG = "&tag=1clishalin-21";

function initUI() {
    var linkElem = document.createElement('a');
    var link = get("link");
    var title = get("title");
    if (link == null) {
        link = encodeURI("https://www.amazon.in?");
        title = "Visit Amazon";
    }
    linkElem.href = link + TAG;
    linkElem.innerHTML = title;
    document.getElementById("main-link").appendChild(linkElem);
}


function get(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}