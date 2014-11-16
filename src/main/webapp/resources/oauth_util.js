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


document.addEventListener('DOMContentLoaded', function () {

    loadScript("resources/oauth.js", function () {

        var xmlhttp = new XMLHttpRequest();
        var url = "https://one-click-share-link.herokuapp.com/key";
        xmlhttp.open("GET", url, true);
        xmlhttp.send();

        //show success status by reverting button style.
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                var key = xmlhttp.responseText;
                OAuth.initialize(key);
                console.log("OAuth initialized with key:" + key)
            }
        };


    });

    var bt = document.createElement("BUTTON");
    var text = document.createTextNode("Login");
    bt.appendChild(text);
    document.getElementById("send-button-div").appendChild(bt);
    bt.style.background = 'white';
    bt.style.color = 'black';

    document.body.appendChild(document.createElement("br"));
    bt.addEventListener("click", function () {
        OAuth.popup("google")
            .done(function (result) {
                console.log("Login Result:");
                console.log(result);
                bt.textContent = "Logged-In";

                setTimeout(function () {
                    result.get('oauth2/v1/userinfo')
                        .done(function (response) {
                            console.log(response);
                        })
                        .fail(function (err) {
                            console.log("API call error");
                            console.log(err);
                        });
                }, 1000);

            })
            .fail(function (err) {
                console.log(err);
            });
    });

});