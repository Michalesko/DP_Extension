(function(){

    var currentBrowserTabs = [];
    var categories = Config.getCategories();
    var isTesting = Config.getTestingMode();
    var connection = new Connection();

    $(document).ready(function(){

      return chrome.storage.sync.get(['userId', 'userSkills', 'userName', 'goalType', 'dbId'], function(res){

        if(res.userId && res.dbId && res.userSkills && res.goalType){
            var outCategGoal = [];
            for(var i=0; i<res.goalType.length; i++){
                outCategGoal.push(categories[res.goalType[i]-1]);
            }
            $('#uid').text(res.userId);
            $('#dbid').text(res.dbId);
            $('#user_skills').val(res.userSkills);
            $('#actual_goal').text(outCategGoal.toString());
        }else{
            $('#uid').text('Not generated');
            $('#dbid').text('Not generated');
            $('#actual_goal').text('You haven\'t set any goal yet.');
        }

        if(res.userName){
            $('#uname').text(res.userName);
            return $('#user_name').val(res.userName);
        }else{
            return $('#uname').text('Not set');
        }
      });
    });

    // after user press button to update goals...
    function updateBrwsrTabs(){
          var userGoals = [];
          var checkgoals = document.getElementsByName('goalCheck');

          for(var i=0; i<checkgoals.length; i++){
              if(checkgoals[i].checked){
                  userGoals.push(parseInt(checkgoals[i].value));
              }
          }

          actualTabs();

          return chrome.storage.sync.get(['userTabs'], function(res){
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

    function saveUserOptions(){
        var userName, userSkills;
        var userGoals = [];
        var checkgoals = document.getElementsByName('goalCheck');

        userSkills = $('#user_skills').val();
        userName = $('#user_name').val();

        for(var i=0; i<checkgoals.length; i++){
            if(checkgoals[i].checked){
                userGoals.push(parseInt(checkgoals[i].value));
            }
        }

        chrome.storage.sync.set({
          'userSkills': userSkills,
          'userName': userName,
          'goalType': userGoals
        });
            
        return chrome.storage.sync.get(['dbId', 'sessionId'], function(res){

                updateBrwsrTabs();
                updateUserGoals(res.dbId, res.sessionId, userGoals);
                updateUserOptions(res.dbId, userName, userSkills);

                swal({title: "Success!",
                      text: "All changes have been saved.",
                      type: "success",   
                      timer: 940,
                      showConfirmButton: false
                });

                return setTimeout(function(){
                                      window.close();
                                  }, 950); 
              });
    };

    // update user 
    function updateUserOptions(id, name, skills){
        return connection.updateUser(id, skills, name);
    };

    // update goals
    function updateUserGoals(id, sessId, usrGoals){
        return connection.updateUserGoals(id, sessId, usrGoals);
    };

    $('#save').click(function(e){
        e.preventDefault()
        return saveUserOptions();
    });


}).call(this);