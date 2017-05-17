(function(){

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

  function saveUserOptions(){
      var userName, userSkills;
      var userGoals = [];
      var checkgoals = document.getElementsByName('goalCheck');
      var userInitEval = [];
      var initURLs = []; 
      var initEvalSelectBoxes = document.getElementsByName('initEval');
      var initialEval = [];

      userSkills = $('#user_skills').val();
      userName = $('#user_name').val();

      // user goals
      for(var i=0; i<checkgoals.length; i++){
          if(checkgoals[i].checked){
              userGoals.push(parseInt(checkgoals[i].value));
          }
      }

      // initial evaluation
      for(var i=0; i<initEvalSelectBoxes.length; i++){
          userInitEval.push(initEvalSelectBoxes[i].value);
          initURLs.push(initEvalSelectBoxes[i].id);
          initialEval.push({
              key: initEvalSelectBoxes[i].id,
              value: initEvalSelectBoxes[i].value
          });
      }

      // default new tab
      cntRatedPages = 20;
      for(var i=0; i<initialEval.length; i++){
        if (initialEval[i].value == ''){
            cntRatedPages --;
            initialEval[i].value = 6;
        }
      }

      // added google.com
      initialEval.push({
        key: 'google.com',
        value: parseInt(initialEval[0].value)
      });

      chrome.storage.sync.set({
        'userSkills': userSkills,
        'userName': userName,
        'goalType': userGoals
      });
          
      return chrome.storage.sync.get(['dbId', 'sessionId'], function(res){

            if(userSkills && userGoals != ''){
                  if(isTesting){
                    console.log("pocet hodnoteni urliek: " + cntRatedPages);
                  }
                  if(cntRatedPages < 20){
                      return swal({
                          title: "Are you sure?",
                          text: "You did not evaluate all initial webpages, do you want to continue?",
                          type: "warning",
                          showCancelButton: true,
                          confirmButtonClass: 'btn-danger',
                          confirmButtonText: 'Yes, proceed anyway.',
                          cancelButtonText: "I rate them...",
                          closeOnConfirm: false,
                          closeOnCancel: true
                      },
                       function(isConfirm){
                          if(isConfirm){
                              swal({ title: "Success!",   
                                text: "Your initial webpage ratings were sent to DB!",
                                type: "success",   
                                timer: 950,
                                showConfirmButton: false
                              });

                              updateUserGoals(res.dbId, res.sessionId, userGoals);
                              initialRate(res.dbId, initialEval);
                              updateUserOptions(res.dbId, userName, userSkills);

                              return setTimeout(function(){
                                                    window.close();
                                                }, 980);
                          }
                      });
                  }
                  else{
                      updateUserGoals(res.dbId, res.sessionId, userGoals);
                      initialRate(res.dbId, initialEval);
                      if(isTesting){
                          console.log(userSkills + typeof userSkills);
                          console.log(userName + typeof userName);
                      }
                      updateUserOptions(res.dbId, userName, userSkills);

                      swal({title: "Success!",   
                            text: "All changes will take effect after browser restart.",
                            type: "success",   
                            timer: 950,
                            showConfirmButton: false
                      });
                      return setTimeout(function(){
                                          window.close();
                                        }, 980);
                  }

            }else{
                 return swal('Oops..', 'You did not choose a browsing goal or set your skills?', 'error');
            }
      });
  };

  function getTime(){
      return new Date().getTime();
  };

  function updateUserOptions(id, name, skills){
      return connection.updateUser(id, skills, name);
  };

  function updateUserGoals(id, sessId, usrGoals){
      return connection.updateUserGoals(id, sessId, usrGoals);
  };

  function initialRate(id, data){
      var time = getTime();
      return connection.initialRate(id, data, time);
  };

  $('#save').click(function(e){
      e.preventDefault()
      return saveUserOptions();
  });

}).call(this);
