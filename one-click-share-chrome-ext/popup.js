function capitaliseFirstLetter(string)
{
	return string.charAt(0).toUpperCase() + string.slice(1);
}


function trimTitle(string)
{

	if (string.length > 15) {
		return string.substring(0,12) + "...";
	}
	return string;

}

var linksGenerator = {

  	requestLinks: function() {
		var xmlhttp = new XMLHttpRequest();
		var url = "http://one-click-share-link.herokuapp.com/links";

		xmlhttp.open("GET", url, true);
		xmlhttp.send();

		xmlhttp.onreadystatechange = function() {
	  	if (xmlhttp.readyState == 4)
	        var linksArr = JSON.parse(xmlhttp.responseText);
			for(i in linksArr){
	    		console.log(link);
				var link = document.createElement('a');
				//link.textContent = capitaliseFirstLetter(linksArr[i]["title"]);
				link.textContent = trimTitle(linksArr[i]["title"]);
				link.href = linksArr[i]["link"];
				link.onclick = function (loopIndex) {
					return function () {
						var location = linksArr[loopIndex]["link"];
				     chrome.tabs.create({active: true, url: location});
				     console.log(location+" link clicked");
				} }(i);
				
				document.body.appendChild(link);
				document.body.appendChild(document.createElement("br"));
			}
		};
	},
};



document.addEventListener('DOMContentLoaded', function () {
	var bt = document.createElement("BUTTON");
	var text = document.createTextNode("Send");
	bt.appendChild(text);
	bt.appendChild(document.createElement("br"));
	document.body.appendChild(bt);
	bt.addEventListener("click",function(){
		//tab=chrome.tabs.query({active: true, currentWindow: true},function(tab){});
		chrome.tabs.getSelected(null,function(tab){
			console.log(tab.url);
			console.log(tab.title);

			var xmlhttp = new XMLHttpRequest();
			var url = "http://one-click-share-link.herokuapp.com/add"+"?title="+tab.title+"&link="+tab.url;
			console.log(url);

			xmlhttp.open("POST", url, true);
			xmlhttp.send();

		});

	});

	linksGenerator.requestLinks();
});

