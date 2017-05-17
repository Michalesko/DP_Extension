(function(){

  var categories = Config.getCategories();
  var isTesting = Config.getTestingMode();
  var currentBrowserTabs = [];
  var connection = new Connection();

  $(document).ready(function(){
      return chrome.storage.sync.get(['goalType'], function(res){

      if(res.goalType){
	        var outCategGoal = [];
	        for (var i=0, n=res.goalType.length; i<n ;i++){
	            outCategGoal.push(categories[res.goalType[i]-1]);        
	        }
	        return $('#actual_goal').text(outCategGoal.toString());
      }else{
        	return $('#actual_goal').text('You haven\'t set any goal yet.');
      }
    });
  });

  $(function(){
    return $('#settings').on('click', function(){
      return chrome.tabs.create({
          url: chrome.runtime.getURL('optionsRuntime.html'),
          active: true
      });
    });
  });

  // after user press button to update goals...
  function updateGoals(){
      var userGoals = [];
      var checkgoals = document.getElementsByName('goalCheck');

      for (var i=0; i<checkgoals.length; i++){
          if(checkgoals[i].checked){
              userGoals.push(parseInt(checkgoals[i].value));
          }
      }

      actualTabs();

      chrome.storage.sync.get(['userTabs'], function(res){
          if(isTesting){
              for(key in res.userTabs){
                  console.log(res.userTabs[key]);
              }
          }
          
          for(var i = 0; i<currentBrowserTabs.length; i++){
              var val = lookup(res.userTabs, currentBrowserTabs[i]);
              
              if(val != 0 && userGoals.indexOf(parseInt(val[0][0])) == -1){
                    chrome.tabs.sendMessage(parseInt(val[1]), {message: "changeTab", title: val[0][2], titleChange: 1});
              }
              else if(val != 0 && userGoals.indexOf(parseInt(val[0][0])) != -1){
                    chrome.tabs.sendMessage(parseInt(val[1]), {message: "changeTab", title: val[0][2], titleChange: 0, data: val[0][1]});
              }
          }
        });

      return chrome.storage.sync.set({
          'goalType': userGoals
      }, function(){
          return chrome.storage.sync.get(['dbId', 'sessionId'], function(res){
              updateUserGoals(res.dbId, res.sessionId, userGoals);
              swal({ title: "Success!",   
                text: "Your browsing goals were successfully changed.",
                type: "success",   
                timer: 900,
                showConfirmButton: false
              });
              return setTimeout(function(){
                              window.close();
                          }, 1000);
          });
      });
  };

  // collect all tabs in all users windows
  function actualTabs(){
      chrome.windows.getAll({populate:true},function(windows){
        windows.forEach(function(window){
          window.tabs.forEach(function(tab){
            currentBrowserTabs.push(parseInt(tab.id));
          });
        });
      });
  };

  // check if tab.id locate in users saved tabs (storage) 
  function lookup(hash, tabKey){
      var resp = [];
      for(key in hash){
          if(key == parseInt(tabKey)){       
              resp.push(hash[key]);
              resp.push(key);
              return resp;
          }
      }
      return 0;
  }

  // update users goals in DB
  function updateUserGoals(id, sessId, usrGoals){
      return connection.updateUserGoals(id, sessId, usrGoals);
  };

  $('#updateGoal').click(function(e){
      e.preventDefault()
      return updateGoals();
  });

  $('#checkTime').click(function(e){
      e.preventDefault()
      var newURL = chrome.runtime.getURL('override.html');
      return chrome.tabs.create({ url: newURL });
  });

}).call(this);