LOGOUT_BTN = "logout"
LOGIN_BTN = "login"
MAIN_UI = "main-ui";
LOGIN_UI = "login-ui";




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
                    updateBadge();
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
            updateBadge();
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

function createUserInfoCtrls() {
    var loginBtn = document.getElementById(LOGIN_BTN);
    var nameNode = document.createTextNode(localStorage[KEY_NAME]);
    document.getElementById(LOGIN_UI).insertBefore(nameNode, loginBtn);
    var image = document.createElement('img');
    image.src = localStorage[KEY_IMAGE];
    image.style.width = "24px";
    image.style.height = "24px";
    image.align = "left";
    document.getElementById(LOGIN_UI).insertBefore(image, nameNode);

    showLogoutCtrls();
}

function showLoginCtrls() {
    document.getElementById(LOGIN_BTN).style.display = "inline";
    document.getElementById(LOGOUT_BTN).style.display = "none";
    document.getElementById(MAIN_UI).style.display = "none";

}

function showLogoutCtrls() {
    document.getElementById(LOGIN_BTN).style.display = "none";
    document.getElementById(LOGOUT_BTN).style.display = "inline";
    document.getElementById(MAIN_UI).style.display = "inline";
}