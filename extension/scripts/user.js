(function(){

  this.User = (function(){
    var createNewUser, generateUUID;
    var connection = null;
    var isTesting;

    function User(){
      connection = new Connection();
      isTesting = Config.getTestingMode();
    }

    User.prototype.add = function(handleData){

      return chrome.storage.sync.get(['userId', 'goalType', 'dbId'], function(res){

        var newId, sessionId;
        var userName;
        var goalType = [];
        sessionId = generateUUID();
 
        if(res.userId  && res.goalType && res.dbId){
            if(isTesting){
                console.log('1 vetva: User is already created');
            }
            connection.getUser(res.dbId, function(user){
                if(!user){
                  return createNewUser(res.userId);
                }
            });
            handleData(res.userId, sessionId, res.goalType, res.dbId);
        }else{
            if(isTesting){
                console.log('2 vetva: User is not created');
            }
            newId = generateUUID();
            return createNewUser(newId, function(input){
                    chrome.storage.sync.set({
                       'userId': newId,
                       'dbId': input,
                       'goalType': goalType,
                       'sessionId': sessionId
                    }, function(){
                        handleData(newId, sessionId, goalType, input);
                    });
            });

        }
      });
    };

    createNewUser = function(id, handleData){
        connection.createUser({
            extId: id,
            name: 'defaultUser',
            }, function(output){
                var userDB_ID = output.responseJSON['0'].id;
                handleData(userDB_ID);
        });
    };


    generateUUID = function(){
      var d = new Date().getTime();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         var r = (d + Math.random()*16)%16 | 0;
         d = Math.floor(d/16);
         return (c=='x' ? r : (r&0x3|0x8)).toString(16);
     });
    };

    return User;
  })();

}).call(this);
