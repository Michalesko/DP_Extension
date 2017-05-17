(function(){

  this.Config = (function(){

    function Config(){};

    var restrictedURLs = ['chrome://newtab/', 'chrome://extensions/', 'chrome://downloads/', 'chrome://settings/', 'chrome://help/'];
    var updateTime = 2000;
    var blank = 'http://michalkorbel.mofa.sk/blank.ico';
    var timeSettings = {
                    "blacklist": ['newtab', 'devtools', 'extensions'],
                    "timeUnits": "minutes"
                   };
    var categories = ['Informations', 'Work', 'Chat', 'Entertainment', 'Shopping/Finance'];
    var testingMode = false;

    Config.getApiURL = function(){
      if(testingMode){
        return 'http://localhost';
      }
      return 'http://163.172.179.17';
    };

    Config.getRestrictedURLs = function(){
      return restrictedURLs;
    };

    Config.getUpdateTime = function(){
      return updateTime;
    };

    Config.getBlank = function(){
      return blank;
    };

    Config.getTimeTrackSettings = function(){
      return timeSettings;
    };

    Config.getCategories = function(){
      return categories;
    };

    Config.getTestingMode = function(){
      return testingMode;
    };

    return Config;
  })();

}).call(this);