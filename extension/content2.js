(function(){

	var changeFavicon, strikeThroughText;
	var timeoutID;

	chrome.runtime.onMessage.addListener(function(request){
		if(request.message == "extClosing"){
	      	var doc13 = document.getElementById('effective');
	      	doc13.parentNode.removeChild(doc13);
		}
		else if(request.message == "changeTab"){
			var title;
			if(parseInt(request.titleChange) == 1){
				title = strikeThroughText(request.title);
			}else{
				title = request.title;
			}
			document.title = title;
			
			changeFavicon(request.data);
		}
  	});

    changeFavicon = function(param){
    	var el = document.querySelectorAll('head link[rel*="icon"]');
            
        // Remove existing favicons
        Array.prototype.forEach.call(el, function (node){
            node.parentNode.removeChild(node);
        });

        // setting new icon
		var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
		link.type = 'image/x-icon';
		link.rel = 'icon';
    	if(typeof param !== "undefined"){
			link.href = param + '?query='+Date.now();
    	}else{
			link.href = chrome.runtime.getURL('images/favicon.ico');
    	}
    	return document.getElementsByTagName('head')[0].appendChild(link);
    };

    strikeThroughText = function(text) {
	    var result = '';
	    $.each(text.split(''), function() {
	      result += this + '\u0336';
	    });
	    return result;
  	}

  	function setup(){
	    this.addEventListener('mousemove', resetTimer, false);
	    this.addEventListener('mousedown', resetTimer, false);
	    this.addEventListener('keypress', resetTimer, false);
	    this.addEventListener('scroll', resetTimer, false);
	    this.addEventListener('wheel', resetTimer, false);
	    this.addEventListener('touchmove', resetTimer, false);
	    this.addEventListener('pointermove', resetTimer, false);
	    startTimer();
	}
	setup();

	function startTimer(){
	    timeoutID = window.setTimeout(goInactive, 5000);
	}

	function resetTimer(e){
	    window.clearTimeout(timeoutID);
	    goActive();
	}

	function goInactive(){
	    chrome.runtime.sendMessage({userActive: false});
	}

	function goActive(){
	    chrome.runtime.sendMessage({userActive: true});
	    startTimer();
	}
  
}).call(this);




