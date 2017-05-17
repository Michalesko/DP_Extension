(function(){

  var user = new User();

  user.add(function(userId, sessionId, goalType, dbId){
       var value = [];
       var observer;
       var logger = new UsageLogger(dbId, sessionId);
       logger.start();
       if(goalType != ''){
         	observer = new Observer(dbId, goalType);
         	observer.start();
       }
       return chrome.storage.onChanged.addListener(function(changes, area){
    		    if(area == "sync" && "goalType" in changes){
    	          value = changes.goalType.newValue;
    	    	    // delete observer;
    	    	    observer = new Observer(dbId, value);
    	    	    observer.start();
    	      }
       });
  });

}).call(this);