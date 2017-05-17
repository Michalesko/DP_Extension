(function(){

  chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
      return chrome.tabs.create({
        url: chrome.runtime.getURL('options.html'),
        active: true
      });
    }
    else if(details.reason === 'update') {
      return chrome.tabs.create({
        url: chrome.runtime.getURL('changes.html'),
        active: true
      });
    }
  });

}).call(this);