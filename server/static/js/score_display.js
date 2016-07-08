

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

    chart.svg = d3.select(selector)



    chart.g = chart.svg
        .append("g")
        .attr("shape-rendering", "crispEdges")
        .style(cssStyling.global);

    chart.contentArea = chart.g.append("g")
        .attr("name", "content-area")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    MIDI.loadPlugin({
        soundfontUrl: "/static/soundfont/",
        instrument: "acoustic_grand_piano",})

    var player = MIDI.Player

    var ids = []

    var counter = 0

    player.addListener(function(data) {
        console.log(data.now)
        var vrvTime = Math.max(0, 2 * data.now + 200);
        var elementsattime = JSON.parse(vrvToolkit.getElementsAtTime(vrvTime))
        //console.log(vrvToolkit.getTimeForElement("p1cdd4n0v1b2s1"))
        if(elementsattime.notes != []){
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
        }

    })


    var attachPlayAndStopButtons = function(parentSelector)
    {

        var parent = d3.select(parentSelector).append("p");
        parent.append("button").text("Play")
            .on("click", function()
            {
                if(player.currentTime == 0 && !player.playing ){
                    player.start()
                }
                if(player.currentTime != 0 && !player.playing){
                    player.resume()
                }
            })
        parent.append("button").text("Pause")
            .on("click", function()
            {
                player.pause(true)
            })
        parent.append("button").text("Stop")
            .on("click", function()
            {
                player.stop()
                ids.forEach(function(noteid) {
                    $("#" + noteid ).attr("fill", "#000");
                    $("#" + noteid ).attr("stroke", "#000");
                });
            })

    };

    var attachSectionSelector = function(parentSelector)
    {
        var selection = d3.select(parentSelector).append("form");

        selection.append("label")
            .text("Select:  ");

        selection.append("label")
            .text("From ")
            .append("input")
            .attr({
                "name": "from",
                "id":"from",
                "type":"number",
                "min":"0",
                "step":"0.5",
                "value":"0.5"
            });
        selection.append("label")
            .text("Until ")
            .append("input")
            .attr({
                "name": "until",
                "id":"until",
                "type":"number",
                "min":"0",
                "step":"0.5",
                "value":"0.5"
            });

        selection.append("input")
            .attr({
                "name": "selectbtn",
                "id":"selectbtn",
                "type": "submit",
                "value": "Select"
            });

        selection.on("submit", function()
        {
            d3.event.preventDefault();
            var fromValue = parseInt(document.getElementById("from").value, 10)
            var untilValue = parseInt(document.getElementById("until").value, 10)+1;
            if (fromValue < untilValue){
                    player.currentTime = fromValue;
                    player.endTime = untilValue;
            }
            else {
                //if the selection doesn't make sense
                window.alert("Please select appropriate values (starting point must be smaller than ending point).");
            }
        });
    };

    var attachBPMSelector = function(parentSelector)
    {
        var bpmSelect = d3.select(parentSelector)
            .append("p")
            .append("form");

        bpmSelect.append("label")
            .text("BPM:  ");

        bpmSelect.append("label")
            .append("input")
            .attr({
                "name":"bpm",
                "id":"bpm",
                "type":"number",
                "max":"360",
                "min":"30",
                "step":"1",
                "value":player.BPM
            });

        bpmSelect.append("label")
            .append("input")
            .attr({
                "name":"bpmbutton",
                "id":"bpmbutton",
                "type":"submit",
                "value":"Change BPM"
            });

        bpmSelect.on("submit", function(){
            d3.event.preventDefault();
            var newBPM = parseInt(document.getElementById("bpm").value, 10);
            player.BPM = newBPM;
        });
    };




    function chart(data)
    {

        vrvToolkit.loadData(data)
        var rendered = vrvToolkit.renderPage(1)
        //document.getElementById("score-display").innerHTML = rendered
        chart.contentArea.html(rendered)
        var midiVersion = 'data:audio/midi;base64,' + vrvToolkit.renderToMidi()
        player.BPM = null
        player.loadFile(midiVersion, player.pause)

    }




    

    // GUI components
    attachEmptyControlPanel(selector)
    attachPlayAndStopButtons(".control-panel")
    attachSectionSelector(".control-panel")
    //attachBPMSelector(".control-panel")

    return chart

};



d3.text("/data/score-display/", function(error, data)
{
    if (error) throw error;
    var scoreDisplay = ScoreDisplay(".score-display", 1024, 400);
    scoreDisplay(data)
});

