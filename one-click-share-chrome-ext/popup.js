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
                    console.log(link);
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
    var bt = document.createElement("BUTTON");
    var text = document.createTextNode("Send Link");
    bt.appendChild(text);
    document.getElementById("send-button-div").appendChild(bt);
    bt.style.background = 'white';
    bt.style.color = 'black';

    document.body.appendChild(document.createElement("br"));
    bt.addEventListener("click", function () {

        //temporarily show the sending status by color change.
        bt.style.background = "green";
        bt.style.color = 'white';

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
                    bt.style.background = 'white';
                    bt.style.color = 'black';
                }
            };
        });

    });

    linksGenerator.requestLinks();
});