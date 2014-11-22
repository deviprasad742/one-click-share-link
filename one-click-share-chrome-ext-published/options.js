DOMAIN_URL = "https://one-click-share-link-dev.herokuapp.com/";
KEY_ACCESS_TOKEN = "access-token";
KEY_EMAIL_ID = "email-id";
KEY_NAME = "name";
KEY_IMAGE = "image";
LOGOUT_BTN = "logout"
LOGIN_BTN = "login"

//DOMAIN_URL = "https://one-click-share-link.herokuapp.com/"

document.addEventListener('DOMContentLoaded', function () {


    updateInfoFromLocal();


    var logoutBtn = document.getElementById(LOGOUT_BTN);
    logoutBtn.addEventListener("click", function () {
        var reqUrl = DOMAIN_URL + "logout";
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", reqUrl, true);
        addCredentials(xmlhttp);
        xmlhttp.send();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                var data = xmlhttp.responseText;
                if (data == "true") {
                    clearLocalStorage();
                    location.reload();
                }

            }
        };
    });

    var loginBtn = document.getElementById(LOGIN_BTN);


    loginBtn.addEventListener("click", function () {
        logIn();
    });



});


function logIn() {
    chrome.identity.getAuthToken({
        'interactive': true
    }, function (token) {
        updateInfo(token);
    });
};


function getParam(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)'))
        .exec(location.search))
        return decodeURIComponent(name[1]);
}

function updateInfo(accessToken) {
    showLogoutCtrls();

    var xmlhttp = new XMLHttpRequest();
    var reqUrl = DOMAIN_URL + "register-token" + "?token=" + accessToken;
    xmlhttp.open("POST", reqUrl, true);
    xmlhttp.send();

    //show success status by reverting button style.
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            var data = xmlhttp.responseText;
            console.log(data);
            var jsonData = JSON.parse(data);
            createLocalStorage(jsonData);
            location.reload();
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
    document.getElementById(LOGIN_BTN).style.display = "inline";
    document.getElementById(LOGOUT_BTN).style.display = "none";
}

function showLogoutCtrls() {
    document.getElementById(LOGIN_BTN).style.display = "none";
    document.getElementById(LOGOUT_BTN).style.display = "inline";
}

function addCredentials(xmlhttp) {
    xmlhttp.setRequestHeader(KEY_EMAIL_ID, localStorage[KEY_EMAIL_ID]);
    xmlhttp.setRequestHeader(KEY_ACCESS_TOKEN, localStorage[KEY_ACCESS_TOKEN]);
}