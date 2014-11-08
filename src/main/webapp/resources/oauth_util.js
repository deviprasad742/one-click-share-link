



function loadScript(url, callback)
{
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
    
    loadScript("resources/oauth.js",function() {        
        OAuth.initialize("SlyxjLA5JM_UJ2V1YcY-chCSWNM");
        console.log("OAuth initialized##############")
    });
    
	var bt = document.createElement("BUTTON");
	var text = document.createTextNode("Login");
	bt.appendChild(text);
	document.getElementById("send-button-div").appendChild(bt);
	bt.style.background='white';
	bt.style.color='black';

	document.body.appendChild(document.createElement("br"));
	bt.addEventListener("click",function(){
        OAuth.popup("google")
        .done(function(result) {
            bt.textContent = "Logged-In";
        })
        .fail(function (err) {
            console.log(err);
        });
    });

});