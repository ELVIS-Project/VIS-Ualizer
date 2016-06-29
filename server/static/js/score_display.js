

var ScoreDisplay = function(selector, width, height)
{
    var vrvToolkit = new verovio.toolkit()
    var options = JSON.stringify({
        pageHeight: 2100,
        pageWidth: 4200,
        ignoreLayout: 1,
        border: 100,
        scale: 50
    })
    vrvToolkit.setOptions(options)

    var margins = {
        top: 10,
        left: 40,
        right: 120,
        bottom: 30,
        piano: 25
    };

    MIDI.loadPlugin({
        soundfontUrl: "/static/soundfont/",
        instrument: "acoustic_grand_piano",})

    var player = MIDI.Player

    var ids = []

    player.addListener(function(data) {
        var vrvTime = Math.max(0, 2 * data.now - 800);
        var elementsattime = JSON.parse(vrvToolkit.getElementsAtTime(vrvTime))
            if ((elementsattime.notes.length > 0) && (ids != elementsattime.notes)) {
                ids.forEach(function(noteid) {
                    if ($.inArray(noteid, elementsattime.notes) == -1) {
                        $("#" + noteid ).attr("fill", "#000");
                        $("#" + noteid ).attr("stroke", "#000");
                    }
                });
                ids = elementsattime.notes;
                ids.forEach(function(noteid) {
                    if ($.inArray(noteid, elementsattime.notes) != -1) {
                        $("#" + noteid ).attr("fill", "#00F");
                        $("#" + noteid ).attr("stroke", "#00F");
                    }
                });
            }

    })





    var attachPlayAndStopButtons = function(parentSelector, audioController)
    {


        var parent = d3.select(parentSelector).append("p")
            .style({"display":"table",
            "width":"100%"});
        parent.append("button").text("Play")
            .on("click", function()
            {
                if(player.currentTime == 0 && !player.playing ){
                    player.start()
                }
                else if(player.currentTime != 0){
                    player.resume()
                }
            })
            .style("display","table-header-group");
        parent.append("button").text("Pause")
            .on("click", function()
            {
                player.pause(true)
            })
            .style("display","table-header-group");
        parent.append("button").text("Stop")
            .on("click", function()
            {
                player.stop()
                ids.forEach(function(noteid) {
                    $("#" + noteid ).attr("fill", "#000");
                    $("#" + noteid ).attr("stroke", "#000");
                });
            })
            .style({"position":"absolute",
                    "z-index":"1"});

    };

    chart.svg = d3.select(selector)



    chart.g = chart.svg
        .append("g")
        .attr("shape-rendering", "crispEdges")
        .style(cssStyling.global);

    chart.contentArea = chart.g.append("g")
        .attr("name", "content-area")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");


    function chart(data)
    {

        vrvToolkit.loadData(data)
        var rendered = vrvToolkit.renderPage(1)
        //document.getElementById("score-display").innerHTML = rendered
        chart.contentArea.html(rendered)
        var midiVersion = 'data:audio/midi;base64,' + vrvToolkit.renderToMidi()
        player.loadFile(midiVersion, player.pause)

    }




    

    // GUI components
    //attachZoomAndLocationPicker();
    attachPlayAndStopButtons(selector)

    return chart

};



d3.text("/data/score-display/", function(error, data)
{
    if (error) throw error;
    var scoreDisplay = ScoreDisplay(".score-display", 1024, 400);
    scoreDisplay(data)
});

