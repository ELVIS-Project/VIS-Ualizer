function iqr(k){
    return function(d, i) {
        var q1 = d.quartiles[0],
            q3 = d.quartiles[2],
            iqr = (q3 - q1) * k,
            i = -1,
            j = d.length;
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j];
    };
}

var Boxplot = function(selector, width, height, title, xAxisLabel, yAxisLabel)
{
    var labels = true
    var margin = {top: 30, right: 50, bottom: 70, left: 50};
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;



    function chart(data)
    {
        var arrayData = []
        var keys = d3.keys(data).sort(function(a, b){
            return parseInt(a.slice(1)) - parseInt(b.slice(1))
        })

        var max = -Infinity
        var min = Infinity

        for (var i=0;i<keys.length;i++){
            arrayData[i] = []
            arrayData[i][0] = keys[i]
            arrayData[i][1] = []
            arrayData[i][1].push(data[keys[i]])
            for(var j=0;j<arrayData[i][1][0].length;j++){
                arrayData[i][1][0][j] = parseInt(arrayData[i][1][0][j])
                if(arrayData[i][1][0][j]>max){
                    max = arrayData[i][1][0][j]
                }
                if(arrayData[i][1][0][j]<min){
                    min = arrayData[i][1][0][j]
                }
            }

    }
        

        var chart = d3.box()
            .whiskers(iqr(1.5))
            .height(height)
            .domain([min, max])
            .showLabels(labels);

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "box")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // the x-axis
        var x = d3.scale.ordinal()
            .domain( arrayData.map(function(d) { return d[0] } ) )
            .rangeRoundBands([0 , width], 0.7, 0.3);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        // the y-axis
        var y = d3.scale.linear()
            .domain([min, max])
            .range([height + margin.top, 0 + margin.top]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        // draw the boxplots
        svg.selectAll(".box")
            .data(arrayData)
            .enter().append("g")
            .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
            .call(chart.width(x.rangeBand()));


        // add a title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 + (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            //.style("text-decoration", "underline")
            .text("Revenue 2012");

        // draw y axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text") // and text1
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("font-size", "16px")
            .text("Revenue in €");

        // draw x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
            .call(xAxis)
            .append("text")             // text label for the x axis
            .attr("x", (width / 2) )
            .attr("y",  10 )
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Quarter");

            console.log(max)
            console.log(min)

    }

    return chart


};


d3.json("/data/boxplot/", function(error, data) {
    if (error) throw error;
    var boxPlot = new Boxplot(".boxplot", 800, 400, "test");
    boxPlot(data);
});
