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
        xmlhttp.open("GET", reqUrl, true);
        xmlhttp.setRequestHeader(KEY_EMAIL_ID,  localStorage[KEY_EMAIL_ID]);
        xmlhttp.setRequestHeader(KEY_ACCESS_TOKEN,  localStorage[KEY_ACCESS_TOKEN])
        xmlhttp.send();
        
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                var data = xmlhttp.responseText;

                if (data.equals("true")) {
                    localStorage.remove[KEY_NAME];
                    localStorage.remove[KEY_EMAIL_ID];
                    localStorage.remove[KEY_IMAGE];
                    localStorage.remove[KEY_ACCESS_TOKEN];
                    document.body.getElementsByTagName("p").innerHTML = "";
                    updateInfoFromLocal();
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
                localStorage[KEY_NAME] = jsonData.name;
                localStorage[KEY_EMAIL_ID] = jsonData.emailId;
                localStorage[KEY_IMAGE] = jsonData.image;
                localStorage[KEY_ACCESS_TOKEN] = jsonData.accessToken;

                updateInfoFromLocal();
            }
        };
    }

    function updateInfoFromLocal() {
        updateLoginStatus(localStorage[KEY_NAME], localStorage[KEY_IMAGE]);
    }

    function updateLoginStatus(name, imageUrl) {
        if (name != null) {
            var newParagraph = document.createElement('p');
            newParagraph.textContent = name;
            document.body.appendChild(newParagraph);
            var image = document.createElement('img');
            image.src = imageUrl;
            image.style.width = "32px";
            image.style.height = "32px";
            document.body.appendChild(image);
            document.getElementById("login-link").style.visibility = "hidden";
            document.getElementById("logout-btn").style.visibility = "visible";
        } else {
            document.getElementById("login-link").style.visibility = "visible";
            document.getElementById("logout-btn").style.visibility = "hidden";
        }
    }

});