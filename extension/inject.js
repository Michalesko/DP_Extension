(function(){
	var iframe = document.createElement('iframe');

	iframe.src = chrome.extension.getURL('rate.html');
	iframe.id = 'effective';
	iframe.style.zIndex = '9999999'; 
	iframe.style.width = '395px';
	iframe.style.height = '230px';
	iframe.style.top = '20px';
	iframe.style.right = '30px';
	iframe.style.position = 'fixed';
	iframe.style.border = '3px solid black';

	document.body.appendChild(iframe);
})();