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

domain_url = "https://one-click-share-link-dev.herokuapp.com/"
//domain_url = "https://one-click-share-link.herokuapp.com/"

document.addEventListener('DOMContentLoaded', function() {

	var token = getParam("code");
	if (token != null) {
        document.getElementById("login-link").textContent = "Logged-In";
		updateInfo(token);
	}


	function getParam(name) {
		if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)'))
				.exec(location.search))
			return decodeURIComponent(name[1]);
	}

	function updateInfo(token) {
		var xmlhttp = new XMLHttpRequest();
        var reqUrl = domain_url + "info" + "?code=" + token;
		xmlhttp.open("GET", domain_url + "info" + "?code=" + token, true);
		xmlhttp.send();

		//show success status by reverting button style.
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
				console.log(xmlhttp.responseText);
				var newParagraph = document.createElement('p');
				newParagraph.textContent = xmlhttp.responseText;
				document.body.appendChild(newParagraph);
			}
		};

	}

});