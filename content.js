
//for (var i = 0; i < document.forms.length; i++) {
//	console.log(document.forms[i]);
//}
/*
chrome.webRequest.onBeforeRequest(function() {
	console.log("uwu");
});
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "hello") {
    	//sendResponse({email: false, name: false, credit_card: false, address: false, birthday: false});
    	sendResponse({farewell: "goodbye"});
    }
  });