(function(){

  this.Connection = (function(){

    var apiURL = null;
    var isTesting;

    function Connection(){
      apiURL = Config.getApiURL();
      isTesting = Config.getTestingMode();
    }

    // vytvorenie zaznamov (logov) v DB
    Connection.prototype.sendLogs = function(data){
        return $.ajax(apiURL + "/api/v1/logs", {
          type: 'POST',
          dataType: 'json',
          data: {
            'user_id': data.user_id,
            'event': data.event,
            'url': data.url,
            'domain': data.domain,
            'path': data.path,
            'timestamp': data.timestamp,
            'tab_id': data.tab_id,
            'session_id': data.session_id,
            'window_id': data.window_id,
            'index_from': data.index_from,
            'index_to': data.index_to
          },
          success: function(data, textStatus, jqXHR){
              if(isTesting){
                  console.log("Status: " + textStatus);
              }
          }
        });
    };

    // vytvorenie usera v DB
    Connection.prototype.createUser = function(data, handledata){
      return $.ajax(apiURL + "/api/v1/users", {
        type: 'POST',
        dataType: 'json',
        data: {
          'extId': data['extId'],
          'name': data['name']
        },
        success: function(data, textStatus, jqXHR){
            if(isTesting){
                console.log("Status: " + textStatus);
            }
            handledata(jqXHR);
        }
      });
    };

    // update usera v DB
    Connection.prototype.updateUser = function(id, skills, name){
      return $.ajax(apiURL + "/api/v1/users/" + id,{
        type: 'PUT',
        dataType: 'json',
        data: {
          'skills': skills,
          'name': name
        },
        success: function(data, textStatus, jqXHR){
            if(isTesting){
                console.log("Status: " + textStatus);
            }
        }
      });
    };

    // getnutie usera z DB
    Connection.prototype.getUser = function(id, handledata){
      return $.ajax(apiURL + "/api/v1/users/" + id, {
        type: 'GET',
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown){
          //return callback(null);
        },
        success: function(data, textStatus, jqXHR){
            if(isTesting){
                console.log("Status: " + textStatus);
            }
            handledata(data);
        }
      });
    };

    // website rating during user browsing
    Connection.prototype.rateWebsite = function(id, data, handledata){
      return $.ajax(apiURL + "/api/v1/users/" + id + "/runeval", {
        type: 'POST',
        dataType: 'json',
        data: {
          'rating_type': data.rating_type,
          'rating_flag': data.rating_flag,
          'created': data.created,
          'updated': data.updated,
          'url': data.url,
          'category_type': data.rating,
          'tab': data.tab,
          'changed': data.changed,
          'rateFrom': data.rateFrom
        },
        error: function(jqXHR, textStatus, errorThrown){
          //return callback(null);
        },
        success: function(data, textStatus, jqXHR){
            if(isTesting){
                console.log("Status: " + textStatus);
            }
            handledata(data);
        }
      });
    };

    Connection.prototype.getUserRating = function(id, webpage, tab_id, handledata){
      return $.ajax(apiURL + "/api/v1/users/" + id + "/recom?url=" + webpage + "&tab=" + tab_id, {
        type: 'GET',
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown){
          //return callback(null);
        },
        success: function(data, textStatus, jqXHR){
            if(isTesting){
                console.log("Status: " + textStatus);
            }
            handledata(data);
        }
      });
    };

    Connection.prototype.updateUserGoals = function(id, sessId, goals){
      return $.ajax(apiURL + "/api/v1/users/" + id + "/goal", {
        type: 'POST',
        dataType: 'application/json',
        data: {
            goals: goals.toString(),
            session: sessId
        },
        success: function(data, textStatus, jqXHR){
            if(isTesting){
                console.log("Update user goals status: " + textStatus);
            }
        }
      });
    };

    Connection.prototype.initialRate = function(id, initData, time){
      for (var i=0; i<initData.length; i++){

          var value = initData[i].value;
          var key = initData[i].key;

          $.ajax(apiURL + "/api/v1/users/" + id + "/runeval",{
            type: 'POST',
            dataType: 'json',
            data: {
              'rating_type': 1,  // user
              'rating_flag': 1,  // initial
              'created': time,
              'updated': time,
              'url': key,
              'category_type': value,
              'tab': 0,
              'changed': 0,
              'rateFrom': 0
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log("ErrorStatus: " + textStatus);
            },
            success: function(data, textStatus, jqXHR){
                if(isTesting){
                    console.log("Status: " + textStatus);
                }
            }
          });
      }
    };

    // update user time
    Connection.prototype.updateTime = function(id, goalTime, nonGoalTime, handledata){
      return $.ajax(apiURL + "/api/v1/users/" + id + "/time", {
        type: 'POST',
        dataType: 'json',
        data: {
          'goalTime': goalTime,
          'nonGoalTime': nonGoalTime
        },
        error: function(jqXHR, textStatus, errorThrown){
          //return callback(null);
        },
        success: function(data, textStatus, jqXHR){
            if(isTesting){
                console.log("Status: " + textStatus);
            }
        }
      });
    };


    return Connection;
  })();

}).call(this);