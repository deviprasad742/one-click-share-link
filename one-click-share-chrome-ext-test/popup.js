var controller = chrome.extension.getBackgroundPage();

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var MAX_CHAR_LENGTH = 45;

function trimTitle(string) {

    if (string.length > MAX_CHAR_LENGTH) {
        return string.substring(0, MAX_CHAR_LENGTH - 3) + "...";
    }
    return string;

}

var linksGenerator = {

    requestLinks: function () {
        var xmlhttp = new XMLHttpRequest();
        var url = "https://one-click-share-link.herokuapp.com/links";

        xmlhttp.open("GET", url, true);
        xmlhttp.send();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                var linksArr = JSON.parse(xmlhttp.responseText);
                for (i in linksArr) {
                    var link = document.createElement('a');
                    //link.textContent = capitaliseFirstLetter(linksArr[i]["title"]);
                    var itemIndex = parseInt(i) + 1;
                    var title = itemIndex + ". " + linksArr[i]["title"];
                    link.textContent = trimTitle(title);
                    link.href = linksArr[i]["link"];
                    link.onclick = function (loopIndex) {
                        return function () {
                            var location = linksArr[loopIndex]["link"];
                            chrome.tabs.create({
                                active: true,
                                url: location
                            });
                            console.log(location + " link clicked");
                        }
                    }(i);

                    document.getElementById("links-content-div").appendChild(link);
                    document.getElementById("links-content-div").appendChild(document.createElement("br"));
                }
            }
        };
    },
};



document.addEventListener('DOMContentLoaded', function () {

    $(function () {
        $("#tabs").tabs({
            event: "mouseover"
        });
    });

    var sendButton = document.getElementById("send-button-id");
    var text = document.createTextNode(">> Send Link");
    sendButton.appendChild(text);
    document.getElementById("send-button-div").appendChild(sendButton);
    sendButton.style.background = 'white';
    sendButton.style.color = 'black';

    $(function () {
        $("button")
            .button()
            .click(function (event) {
                event.preventDefault();
            });
    });

    document.body.appendChild(document.createElement("br"));
    sendButton.addEventListener("click", function () {

        //temporarily show the sending status by color change.
        sendButton.style.background = "green";
        sendButton.style.color = 'white';

        chrome.tabs.getSelected(null, function (tab) {
            console.log(tab.url);
            console.log(tab.title);

            var xmlhttp = new XMLHttpRequest();
            var url = "https://one-click-share-link.herokuapp.com/add" + "?title=" + tab.title + "&link=" + tab.url;
            console.log(url);

            xmlhttp.open("POST", url, true);
            xmlhttp.send();

            //show success status by reverting button style.
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    sendButton.style.background = 'white';
                    sendButton.style.color = 'black';

                    updateBadge();
                }
            };
        });

    });

    linksGenerator.requestLinks();
    syncData(loadUI);
});


function loadUI(loaded) {
    if (loaded) {
        console.log("Data is updated");
    } else {
        console.log("Data is not updated");
    }
}