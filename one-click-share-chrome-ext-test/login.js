LOGOUT_BTN = "logout"
LOGIN_BTN = "login"
MAIN_UI = "main-ui";
LOGIN_UI = "login-ui";
DIV_OPTIONS_PAGE = "options-page";

var STATE_START = 1;
var STATE_ACQUIRING_AUTHTOKEN = 2;
var STATE_AUTHTOKEN_ACQUIRED = 3;

var state = STATE_START;

var login_btn, logout_btn, main_ui;

function disableButton(button) {
    button.setAttribute('disabled', 'disabled');
}

function enableButton(button) {
    button.removeAttribute('disabled');
}

function showElement(element) {
    element.style.display = "inline";
}

function hideElement(element) {
    element.style.display = "none";
}

function changeState(newState) {
    state = newState;
    switch (state) {
    case STATE_START:
        showElement(login_btn);
        enableButton(login_btn);
        hideElement(main_ui);
        hideElement(logout_btn);
        break;
    case STATE_ACQUIRING_AUTHTOKEN:
        showElement(login_btn);
        disableButton(login_btn);
        if (!isOptionsPage()) {
            login_btn.textContent = "Loading User Information..."
        }
        hideElement(main_ui);
        hideElement(logout_btn);
        break;
    case STATE_AUTHTOKEN_ACQUIRED:
        hideElement(login_btn);
        showElement(main_ui);
        showElement(logout_btn);
        break;
    }
}



document.addEventListener('DOMContentLoaded', function () {
    login_btn = document.getElementById(LOGIN_BTN);
    logout_btn = document.getElementById(LOGOUT_BTN);
    main_ui = document.getElementById(MAIN_UI);

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
    if (loginBtn != null) {
        loginBtn.addEventListener("click", function () {
            changeState(STATE_ACQUIRING_AUTHTOKEN);
            logIn();
        });
    }

});


function logIn() {
    if (isOptionsPage()) {
        chrome.identity.getAuthToken({
            'interactive': true
        }, function (token) {
            updateInfo(token);
        });
    } else {
        window.open(chrome.extension.getURL("options.html"));
    }
};

function isOptionsPage() {
    return document.getElementById(DIV_OPTIONS_PAGE) != null;
}


function getParam(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)'))
        .exec(location.search))
        return decodeURIComponent(name[1]);
}

function updateInfo(accessToken) {

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
        changeState(STATE_ACQUIRING_AUTHTOKEN);
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
                    changeState(STATE_START);
                }
            }
        };
    } else {
        changeState(STATE_START);
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

    changeState(STATE_AUTHTOKEN_ACQUIRED);
}