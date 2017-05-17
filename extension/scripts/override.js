$(function(){
    var timeUnits = "minutes";
    var goalTime = 0;
    var nonGoalTime = 0;
    var isTesting = Config.getTestingMode();

    chrome.storage.local.get('trackTime', function(data){
        if($.isEmptyObject(data)){
            var $container = $('.container');
            $container.empty();
            $container.append('<div class="message"><h1>No URLs are tracked yet!</h1></div>');
            return;
        }

        var chartData = [];
        var options = {
            animation: false,
            responsive: true,
            segmentShowStroke: false,
            legendTemplate: '<table class=\"u-full-width <%=name.toLowerCase()%>-legend\"><thead><tr><th>Color</th><th>WebSites</th><th>Time (' + timeUnits + ')</th></tr></thead><% for (var i=0; i<segments.length; i++){%><tr><td><span class=\"color-box\" style=\"background-color:<%=segments[i].fillColor%>\"></span></td><td class=\"label\"><%if(segments[i].label){%><%=segments[i].label%><%}%></td><td class=\"value\"><%if(segments[i].value >= 0){%><%=segments[i].value%><%}%></td></tr><%}%></table>'
        };
        var ctx = $('#chart').get(0).getContext('2d');

        $.each(data.trackTime, function(idx, val){
            if(val.time !== 0){
                var value = (val.time * 2) / 60;
                if (value === 0) return;

                if(isTesting){
                    console.log(val.flag + typeof val.flag);
                }
                
                if(parseInt(val.flag) == 1){
                    goalTime = goalTime + value;
                }else{
                    nonGoalTime = nonGoalTime + value;
                }
            }
        });
        goalTime = parseFloat(parseFloat(Math.round(goalTime * 100) / 100).toFixed(2));
        nonGoalTime = parseFloat(parseFloat(Math.round(nonGoalTime * 100) / 100).toFixed(2));
        if(isTesting){
            console.log(goalTime);
            console.log(nonGoalTime);
        }

        chartData.push({
            value: goalTime,
            color: '#f2eeb3',
            highlight: '#cbc457',
            label: 'MATCHED your browsing goal'
        },{
            value: nonGoalTime,
            color: '#443b44',
            highlight: '#260126',
            label: 'DON\'T MATCHED your browsing goal'
        });

        var chart = new Chart(ctx).Pie(chartData, options);
        var legend = chart.generateLegend();

        $('.legend').html(legend);
    });
});