(function(){

	var iframe = document.createElement('iframe');

	iframe.id = 'effective';
	iframe.style.zIndex = '9999999';
	iframe.style.width = '395px';
	iframe.style.height = '255px';
	iframe.style.top = '20px';
	iframe.style.right = '30px';
	iframe.style.position = 'fixed';
	iframe.style.border = '3px solid black';

	chrome.runtime.onMessage.addListener(doStuff2);
	function doStuff2(message){
    	var param = message.param;
    	var param2 = message.param2;
	    iframe.src = chrome.extension.getURL('result.html') + '?' + 'param1=' + param + '&param2=' + param2;
		document.body.appendChild(iframe);
		chrome.runtime.onMessage.removeListener(doStuff2);
	};
})();