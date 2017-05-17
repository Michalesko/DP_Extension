(function(){

    var updateEvals;

    updateEvals = function(param){

        if(param == 1){
            var runtimeEvalWebsite = document.getElementsByName('runtimeEval')[0].value;
            if (!runtimeEvalWebsite){
                swal('Select please one option!');
            }else{
                return chrome.runtime.sendMessage({extMessage: "rating", changed: 0, data: runtimeEvalWebsite});
            }
        }else{
            return chrome.runtime.sendMessage({extMessage: "nonRating"});
        }
    };

    $('#rating').click(function(e){
        e.preventDefault()
        return updateEvals(1);
    });
    $('#no-rating').click(function(e){
        e.preventDefault()
        return updateEvals(2);
    });

}).call(this);


