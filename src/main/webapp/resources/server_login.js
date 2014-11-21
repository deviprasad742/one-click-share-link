function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

DOMAIN_URL = "https://one-click-share-link-dev.herokuapp.com/";
KEY_ACCESS_TOKEN = "access-token";
KEY_EMAIL_ID = "email-id";
KEY_NAME = "name";
KEY_IMAGE = "image";


//DOMAIN_URL = "https://one-click-share-link.herokuapp.com/"

document.addEventListener('DOMContentLoaded', function () {

    var authCode = getParam("code");
    if (authCode != null) {
        updateInfo(authCode);
    } else {
        updateInfoFromLocal();
    }

    var bt = document.getElementById("logout-btn");
    bt.addEventListener("click", function () {
        var reqUrl = DOMAIN_URL + "logout";
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", reqUrl, true);
        addCredentials(xmlhttp);
        xmlhttp.send();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                var data = xmlhttp.responseText;
                if (data.valueOf() == "true".valueOf()) {
                    clearLocalStorage();
                    location.reload();
                }

            }
        };
    });


    function getParam(name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)'))
            .exec(location.search))
            return decodeURIComponent(name[1]);
    }

    function updateInfo(authCode) {
        showLogoutCtrls();

        var xmlhttp = new XMLHttpRequest();
        var reqUrl = DOMAIN_URL + "register" + "?code=" + authCode;
        xmlhttp.open("POST", reqUrl, true);
        xmlhttp.send();

        //show success status by reverting button style.
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                var data = xmlhttp.responseText;
                console.log(data);
                var jsonData = JSON.parse(data);
                createLocalStorage(jsonData);
                location.assign(DOMAIN_URL);
            }
        };
    }

    function updateInfoFromLocal() {
        updateLoginStatus(localStorage[KEY_NAME]);
    }

    function updateLoginStatus(name) {
        if (name != null) {
            var reqUrl = DOMAIN_URL + "is-valid";
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", reqUrl, true);
            addCredentials(xmlhttp);
            xmlhttp.send();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    var data = xmlhttp.responseText;
                    if (data.valueOf() == "true".valueOf()) {
                        createUserInfoCtrls();
                    } else {
                        clearLocalStorage();
                        showLoginCtrls();
                    }
                }
            };
        } else {
            showLoginCtrls();
        }
    }

    function createLocalStorage(jsonData) {
        localStorage[KEY_NAME] = jsonData.name;
        localStorage[KEY_EMAIL_ID] = jsonData.emailId;
        localStorage[KEY_IMAGE] = jsonData.image;
        localStorage[KEY_ACCESS_TOKEN] = jsonData.accessToken;
    }

    function clearLocalStorage() {
        //        localStorage.removeItem[KEY_NAME];
        //        localStorage.removeItem[KEY_EMAIL_ID];
        //        localStorage.removeItem[KEY_IMAGE];
        //        localStorage.removeItem[KEY_ACCESS_TOKEN];
        localStorage.clear();
    }

    function createUserInfoCtrls() {
        var newParagraph = document.createElement('p');
        newParagraph.textContent = localStorage[KEY_NAME];
        document.body.appendChild(newParagraph);
        var image = document.createElement('img');
        image.src = localStorage[KEY_IMAGE];
        image.style.width = "32px";
        image.style.height = "32px";
        document.body.appendChild(image);
        showLogoutCtrls();
    }

    function showLoginCtrls() {
        document.getElementById("login-link").style.display = "inline";
        document.getElementById("logout-btn").style.display = "none";
    }

    function showLogoutCtrls() {
        document.getElementById("login-link").style.display = "none";
        document.getElementById("logout-btn").style.display = "inline";
    }

    function addCredentials(xmlhttp) {
        xmlhttp.setRequestHeader(KEY_EMAIL_ID, localStorage[KEY_EMAIL_ID]);
        xmlhttp.setRequestHeader(KEY_ACCESS_TOKEN, localStorage[KEY_ACCESS_TOKEN]);
    }

});