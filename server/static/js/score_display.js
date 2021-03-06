

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

    var initialEnd = 0;

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

    //listener to color the note(s) being played
    player.addListener(function(data) {
        var vrvTime = Math.max(0, (2 * data.now + 200) * (player.BPM/120));
        var elementsattime = JSON.parse(vrvToolkit.getElementsAtTime(vrvTime))
        //if there are notes at that particular time
        if(elementsattime.notes != []){
            if ((elementsattime.notes.length > 0) && (ids != elementsattime.notes)) {
                ids.forEach(function(noteid) {
                    //notes that aren't being played are colored in black
                    if ($.inArray(noteid, elementsattime.notes) == -1) {
                        $("#" + noteid ).attr("fill", "#000");
                        $("#" + noteid ).attr("stroke", "#000");
                    }
                });
                ids = elementsattime.notes;
                ids.forEach(function(noteid) {
                    if ($.inArray(noteid, elementsattime.notes) != -1) {
                        //color in blue the current playing note(s)
                        $("#" + noteid ).attr("fill", "#00F");
                        $("#" + noteid ).attr("stroke", "#00F");
                    }
                });
            }
        }

    })

    //add play, pause, stop buttons
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

    //attach from-until selection of a chunk of time (in milliseconds)
    var attachSectionSelector = function(parentSelector)
    {
        var selection = d3.select(parentSelector).append("form");

        selection.append("label")
            .text("Select (in ms):  ");

        selection.append("label")
            .text("From ")
            .append("input")
            .attr({
                "name": "from",
                "id":"from",
                "type":"number",
                "max":player.endTime,
                "min":"0",
                "step":"0.1",
                "value":"0.5"
            });
        selection.append("label")
            .text("Until ")
            .append("input")
            .attr({
                "name": "until",
                "id":"until",
                "type":"number",
                "max": player.endTime,
                "min":"0",
                "step":"0.1",
                "value":"1.5"
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

    //attach BPM selection.
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
            player.BPM = newBPM
            //the player needs to be "reloaded" with the new BPM for it to take effect
            player.replayer = new Replayer(MidiFile(player.currentData), 1, null, player.BPM)
            /* adjust the maximum possible ending time according to bpm (it stays the same if less than 120 because
            there are no notes beyond the end of the file so the ending time can't get any longer, it reduces if more
            than 120 because the ending comes sooner). Note that the maximum time corresponds to the time of the last
            playable note.
            */
            player.endTime = initialEnd * 120/player.BPM
            d3.select("#from").attr("max", player.getEnd())
            d3.select("#until").attr("max", player.getEnd())
            d3.select("#until").attr("value", player.getEnd())
        });
    };


    function chart(data)
    {
        //load verovio toolkit instance with the data and render the first page
        vrvToolkit.loadData(data)
        var rendered = vrvToolkit.renderPage(1)
        chart.contentArea.html(rendered)
        //convert file to midi and load into the player
        var midiVersion = 'data:audio/midi;base64,' + vrvToolkit.renderToMidi()
        player.loadFile(midiVersion, player.pause)
        //set the maximum times and the original ending according to the file
        d3.select("#from").attr("max", player.getEnd())
        d3.select("#until").attr("max", player.getEnd())
        d3.select("#until").attr("value", player.getEnd())
        initialEnd = player.endTime

    }




    

    // GUI components
    attachEmptyControlPanel(selector)
    attachPlayAndStopButtons(".control-panel")
    attachSectionSelector(".control-panel")
    attachBPMSelector(".control-panel")

    return chart

};



d3.text("/data/score-display/", function(error, data)
{
    if (error) throw error;
    var scoreDisplay = ScoreDisplay(".score-display", 1024, 400);
    scoreDisplay(data)
});

