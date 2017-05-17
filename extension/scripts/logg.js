(function(){

  this.UsageLogger = (function(){

    var tabCreated, tabMoved, tabDeleted, tabUpdated, tabActivated, tabAttached, tabDetached;
    var cacheLogs, sendLogs, getTime;

    var parser = document.createElement('a');
    var connection = new Connection();
    var sha1 = new Hashes.SHA1();
    var userId = null, sessId = null;
    var isTesting;


    function UsageLogger(userID, sessionID){
      userId = userID;
      sessId = sessionID;
      isTesting = Config.getTestingMode();
    }

    UsageLogger.prototype.start = function(){
      if(isTesting){
          console.log("User logger starting");
      }
  
      chrome.tabs.onCreated.addListener(tabCreated);
      chrome.tabs.onRemoved.addListener(tabDeleted);
      chrome.tabs.onActivated.addListener(tabActivated);
      chrome.tabs.onMoved.addListener(tabMoved);
      chrome.tabs.onAttached.addListener(tabAttached);
      chrome.tabs.onDetached.addListener(tabDetached);
      return chrome.tabs.onUpdated.addListener(tabUpdated);
    };

    getTime = function(){
      return new Date().getTime();
    };


    tabCreated = function(tab){
      parser.href = tab.url;
      return connection.sendLogs({
          user_id: userId,
          session_id: sessId,
          timestamp: getTime(),
          event: 'TAB_CREATED',
          window_id: tab.windowId,
          tab_id: tab.id,
          url: sha1.hex(parser.href),
          domain: sha1.hex(parser.hostname),
          path: sha1.hex(parser.pathname)
      });
    };

    tabDeleted = function(tabId, removeInfo){
      return connection.sendLogs({
          user_id: userId,
          session_id: sessId,
          timestamp: getTime(),
          event: 'TAB_REMOVED',
          window_id: removeInfo.windowId,
          tab_id: tabId
      });
    };

    tabActivated = function(activeInfo){
      chrome.tabs.get(activeInfo.tabId, function(tab){
          if(chrome.runtime.lastError){
              return;
          }else{
              return connection.sendLogs({
                  user_id: userId,
                  session_id: sessId,
                  timestamp: getTime(),
                  event: 'TAB_ACTIVATED',
                  window_id: activeInfo.windowId,
                  tab_id: activeInfo.tabId
              });
          }
      });
    };

    tabMoved = function(tabId, moveInfo){
      return connection.sendLogs({
          user_id: userId,
          session_id: sessId,
          timestamp: getTime(),
          event: 'TAB_MOVED',
          window_id: moveInfo.windowId,
          tab_id: tabId,
          index_from: moveInfo.fromIndex,
          index_to: moveInfo.toIndex
      });
    };

    tabAttached = function(tabId, attachInfo){
      return connection.sendLogs({
          user_id: userId,
          session_id: sessId,
          timestamp: getTime(),
          event: 'TAB_ATTACHED',
          window_id: attachInfo.newWindowId,
          tab_id: tabId,
          index_to: attachInfo.newPosition
      });
    };

    tabDetached = function(tabId, detachInfo){
      return connection.sendLogs({
          user_id: userId,
          session_id: sessId,
          timestamp: getTime(),
          event: 'TAB_DETACHED',
          window_id: detachInfo.oldWindowId,
          tab_id: tabId,
          index_from: detachInfo.oldPosition
      });
    };

    tabUpdated = function(tabId, changeInfo, tab){
      if (changeInfo.status === 'complete'){
        parser.href = tab.url;
 
        return connection.sendLogs({
            user_id: userId,
            session_id: sessId,
            timestamp: getTime(),
            event: 'TAB_UPDATED',
            window_id: tab.windowId,
            tab_id: tab.id,
            url: sha1.hex(parser.href),
            domain: sha1.hex(parser.hostname),
            path: sha1.hex(parser.pathname)
        });
      }
    };

    return UsageLogger;
  })();

}).call(this);