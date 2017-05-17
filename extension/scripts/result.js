(function(){

    var getParamValue, updateEvals;
    var rating = getParamValue('param1');
    var ratingID = getParamValue('param2');
    $('#recom_rate').text(String(rating));

    updateEvals = function(){

          var runtimeEvalWebsite = document.getElementsByName('runtimeEval')[0].value;
          if(runtimeEvalWebsite != 0){
              chrome.runtime.sendMessage({extMessage: "updateRating", changed: 1, data: runtimeEvalWebsite});
          }else{
              chrome.runtime.sendMessage({extMessage: "nonRatingRecom", changed: 0, data: ratingID});
          }
    };

    $('#ratingACK').click(function(e){
        e.preventDefault()
        return updateEvals();
    });

    function getParamValue(paramName){
        var url = window.location.search.substring(1);
        var qArray = url.split('&');
        for (var i = 0; i < qArray.length; i++){
            var pArr = qArray[i].split('=');
            if (pArr[0] == paramName) 
                return pArr[1];
        }
    }

}).call(this);


