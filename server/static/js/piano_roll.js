var AudioController = function() {
    this.bpm = 360;

    this.isPlaying = false;
    this.currentBeat = 0;
    this.notesIndex = 0;
    this.notes = [];

    // A D3 dispatch that
    this.beatEventDispatch = d3.dispatch("beat");

    // Initialize the MIDI system
    MIDI.loadPlugin({
        soundfontUrl: "/static/soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress) {
            console.log(state, progress);
        },
        onsuccess: function() {
            MIDI.setVolume(0, 127);
        }
    });

    this.beatsToSeconds = function(numBeats) {
        var bps = 60 / this.bpm;
        return bps * numBeats;
    };

    this.playNote = function(pitch, velocity, duration) {
        var delay = 0;
        MIDI.noteOn(0, pitch, velocity, delay);
        MIDI.noteOff(0, pitch, delay + duration);
    };

    this.loadPiece = function(notes) {
        this.notes = notes;
    };

    this.playPiece = function() {
        // Don't do anything if already playing
        if (this.isPlaying)
            return;

        var milisecondsPerBeat = this.beatsToSeconds(1) * 1000;
        this.isPlaying = true;
        var velocity = 87;
        var that = this;
        var playNoteIfReady = function(noteIndex) {
            if (that.isPlaying && noteIndex < that.notes.length) {
                // Play all the notes that are currently playable
                while (
                    noteIndex < that.notes.length
                    && that.notes[noteIndex].starttime[0] < that.currentBeat
                ) {
                    var pitch = that.notes[noteIndex].pitch.b12;
                    var duration = that.beatsToSeconds(that.notes[noteIndex].duration[0]);
                    that.playNote(pitch, velocity, duration);
                    noteIndex++;
                }

                // Move onto the next beat
                that.currentBeat++;
                // Broadcast an event
                that.beatEventDispatch.beat(that.currentBeat);
                window.setTimeout(playNoteIfReady, milisecondsPerBeat, noteIndex);
            }
        };

        playNoteIfReady(this.notesIndex);
    };

    this.pausePiece = function() {
        this.isPlaying = false;
    };

    this.resetPiece = function() {
        this.isPlaying = false;
        this.currentBeat = 0;
        this.notesIndex = 0;
        this.beatEventDispatch.beat(this.currentBeat);
    }
};


var PianoRoll = function(selector, width, height) {
    var margins = {
        top: 10,
        left: 40,
        right: 120,
        bottom: 30,
        piano: 25
    };

    // Construct the audio controller
    var audioController = new AudioController();

    chart.svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style(cssStyling.global);

    chart.g = chart.svg
        .append("g")
        .attr("shape-rendering", "crispEdges");

    chart.contentArea = chart.g.append("g")
        .attr("name", "content-area")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .append("svg")
        .attr({
            width: width - margins.left - margins.right,
            height: height - margins.top - margins.bottom,
            overflow: "hidden"
        })
        .style("fill", "none");


    /**
     * Draw the piano in the foreground.
     *
     * @param pitches Array of pitch integers.
     */
    var drawPianoForeground = function(pitches) {
        var pianoForeground = chart.g.append("g").attr("name", "piano-foreground");
        // Draw the piano lines
        pianoForeground.selectAll("g").data(pitches).enter()
            .append("rect")
            .attr("width", margins.piano)
            .attr("height", chart.pitch.rangeBand())
            .attr("x", margins.left)
            .attr("y", function(pitch) {
                return chart.pitch(pitch) + chart.pitch.rangeBand() - 1;
            })
            .attr("fill", function(pitch) {
                if (isKeyBlack(pitch, 72)) {
                    return d3.rgb("black");
                } else {
                    return d3.rgb("white");
                }
            })
            .style({
                "stroke": "rgb(0,0,0)",
                "stroke-width": 1
            })
            .on("click", function(pitch) {
                var duration = 1;
                var velocity = 127;
                audioController.playNote(pitch, velocity, duration);
            });
    };

    /**
     * Draw the horizontal piano lines in the background.
     *
      * @param pitches
     */
    var drawPianoBackground = function(pitches) {
        // Insert the piano background before the content area
        var pianoBackground = chart.g.insert("g", ":first-child").attr("name", "piano-background");
        // Draw the piano lines
        pianoBackground.selectAll("g").data(pitches).enter()
            .append("rect")
            .attr("width", width - margins.left - margins.right)
            .attr("height", chart.pitch.rangeBand())
            .attr("x", margins.left + 1)
            .attr("y", function(pitch) {
                return chart.pitch(pitch) + chart.pitch.rangeBand();
            })
            .attr("fill", function(pitch) {
                if (isKeyBlack(pitch, 72)) {
                    return d3.rgb("#EFEFEF");
                } else {
                    return d3.rgb("white");
                }
            });
    };

    /**
     * Draw the vertical barlines
     *
     * @param barlines
     */
    var drawBarLines = function(barlines) {
        chart.contentArea
            .append("g")
            .attr("name", "barlines")
            .selectAll(selector).data(barlines).enter().append('line')
            .attr("x1", function(note) {
                return note.time[0];
            })
            .attr("y1", 0)
            .attr("x2", function() {
                return this.getAttribute("x1");
            })
            .attr("y2", height)
            .attr("class", "barline")
            .style({
                "stroke": "rgb(192,192,192)",
                "stroke-width": 1
            });
    };

    /**
     * Draw the hover titles when you hover over a note.
     */
    var drawHoverTitles = function() {
        // Hover titles
        chart.g.selectAll(".note").append("title")
            .text(function(note) {
                return note.pitch.name;
            });
    };

    /**
     * Draw the part notes
     *
     * @param parts
     * @param partNames
     * @param colours
     */
    var drawParts = function(parts, partNames, colours) {
        parts.forEach(function(part) {
            var colour = colours(part.partindex);
            var partContainer =  chart.contentArea
                .append("g")
                .attr({
                    name: partNames[part.partindex],
                    class: "part"
                })
                .selectAll(selector);
            partContainer.data(part.notedata)
                .enter().append('rect')
                .attr("width", function(note) {
                    return note.duration[0];
                })
                .attr("height", function(note) {
                    return chart.pitch.rangeBand();
                })
                //.attr("x", function(note) {
                //    return note.starttime[0];
                //})
                .attr("y", function(note) {
                    return chart.pitch(note.pitch.b12);
                })
                .attr("class", "note")
                .style({
                    "fill": colour,
                    "stroke": d3.rgb(colour).darker(),
                    "stroke-width": 1
                })
                .on("click", function(note) {
                    var duration = audioController.beatsToSeconds(note.duration[0]);
                    var pitch = note.pitch.b12;
                    var velocity = 127;
                    audioController.playNote(pitch, velocity, duration);
                });
        });
    };

    var drawNoteHead = function(audioController, xScale, zoom) {
        var noteHead = chart.contentArea
            .append("line")
            .attr("name", "noteHead")
            .attr("x1", function(note) {
                return 0;
            })
            .attr("y1", 0)
            .attr("x2", function() {
                return this.getAttribute("x1");
            })
            .attr("y2", height)
            .attr("class", "noteHead")
            .style({
                "stroke": "rgb(255,0,0)",
                "stroke-width": 1
            });

        audioController.beatEventDispatch.on("beat", function(beat) {
            noteHead.transition()
                .attr({
                    "x1": xScale(beat),
                    "x2": xScale(beat)
                });
        });

        zoom.on("zoom.nh", function() {
            var x = xScale(audioController.currentBeat);
            noteHead.attr({
                    "x1": x,
                    "x2": x
                });
        })
    };

    /**
     * Build an array of pitches from minimum to maximum.
     *
     * @param minPitch
     * @param maxPitch
     * @returns {*|Array.<int>}
     */
    var buildPitchArray = function(minPitch, maxPitch) {
        return d3.range(parseInt(minPitch), parseInt(maxPitch) + 1).reverse();
    };

    /**
     * Given parts, construct a function that maps midi numbers onto labels.
     *
     * @param parts
     * @returns {Function} midiNumber -> label
     */
    var buildMidiPitchLabeller = function(parts) {
        // Construct a mapping between midi numbers and pitches
        var midiNumberToPitch = {};
        parts.forEach(function(part) {
            part.notedata.forEach(function(note) {
                var pitch = note.pitch;
                midiNumberToPitch[pitch.b12] = pitch.name;
            });
        });
        // This is the formatting function we will pass to the y-axis
        return function(midiNumber) {
            return midiNumberToPitch[midiNumber];
        }
    };

    /**
     * The callback that is executed when zooming happens.
     */
    function zoomTick() {
        // Scale the axes
        chart.svg.select(".x-axis").call(chart.xAxis);

        // Move the bar lines
        chart.g.selectAll(".barline")
            .attr({
                "x1": function (note) {
                    return chart.x(note.time[0]);
                },
                "x2": function () {
                    return this.getAttribute("x1");
                }
            });

        // Move and scale the notes
        chart.g.selectAll(".note")
            .attr({
                "x": function(note){
                    return chart.x(note.starttime[0]);
                },
                "width": function(note) {
                    var startPoint = note.starttime[0];
                    return chart.x(startPoint + note.duration[0]) - this.getAttribute("x");
                }
            });

        // Set the sliders to the updated values
    }

    /**
     * Attach the zoom and location pickers and rig them up.
     */
    var attachZoomAndLocationPicker = function() {
        var xZoomPicker = d3.select(selector).append("p")
            .append("label")
            .text("X-Zoom")
            .append("input")
            .attr({
                name: "x_zoom",
                type: "range",
                min: 1,
                max: 10,
                value: 1
            }).on("input", onPickerChange);
        var xLocationPicker = d3.select(selector).append("p")
            .append("label")
            .text("X-Location")
            .append("input")
            .attr({
                name: "x_location",
                type: "range",
                min: 0,
                max: 99,
                value: 0
            }).on("input", onPickerChange);

        /**
         * Handle the zoom and location picker input.
         */
        function onPickerChange() {
            var xZoom = xZoomPicker[0][0].value;
            var xLocation = xLocationPicker[0][0].value;
            zoomTick(xZoom, 1, xLocation);
        }
    };

    var attachPlayAndStopButtons = function(parentSelector, audioController) {
        var parent = d3.select(selector).append("p");
        parent.append("button").text("Play")
            .on("click", function() {
                audioController.playPiece();
            });
        parent.append("button").text("Pause")
            .on("click", function() {
                audioController.pausePiece();
            });
        parent.append("button").text("Stop")
            .on("click", function() {
                audioController.resetPiece();
            });

    };

    var renderSelectedParts = function(isPartEnabled) {
        var parts = d3.select(selector).selectAll(".part")[0];
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var name = part.getAttribute("name");
            if (isPartEnabled[name]) {
                part.setAttribute("visibility", null)
            } else {
                part.setAttribute("visibility", "hidden");
            }
        }
    };

    var attachPartSelector = function(parentSelector, partNames) {
        var form = d3.select(parentSelector).append("p")
            .text("Parts:")
            .append("ul");

        var isPartEnabled = {};
        // Construct part booleans and checkboxes
        for (var i = 0; i < partNames.length; i++) {
            isPartEnabled[partNames[i]] = true;

            form.append("li")
                .text(partNames[i])
                .append("input")
                .attr({
                    "name": partNames[i],
                    "type": "checkbox",
                    "checked": true
                })
                .on("change", function() {
                    // Record the change
                    isPartEnabled[this.name] = this.checked;
                    // Do a render update
                    renderSelectedParts(isPartEnabled);
                });
        }
    };

    /**
     * Given data, construct the chart.
     *
      * @param data
     */
    function chart(data) {
        // The function that labels the midi pitches
        var midiPitchLabeller = buildMidiPitchLabeller(data.partdata);

        // Build scales
        var pitchDomain = buildPitchArray(data.minpitch.b12, data.maxpitch.b12);
        chart.x = d3.scale.linear().range([0, data.scorelength[0]]);
        chart.pitch = d3.scale.ordinal()
            .domain(pitchDomain)
            .rangeRoundBands([0, height - margins.bottom - margins.top], 0, 0);

        var minZoom = 0.0001,
            defaultZoom = 0.001,
            maxZoom = 0.01;
        var zoom = d3.behavior.zoom()
            .x(chart.x)
            .translate([margins.piano, 0])
            //.xExtent()
            .scaleExtent([minZoom, maxZoom])
            .scale(defaultZoom)
            .on("zoom", zoomTick);

        // Invoke zoom on the svg
        chart.svg.call(zoom);

        // Build the axes
        chart.xAxis = d3.svg.axis()
            .scale(chart.x)
            .orient("bottom");
        chart.yAxis = d3.svg.axis()
            .scale(chart.pitch)
            .tickFormat(midiPitchLabeller)
            .orient("left");

        // Draw the axis lines
        drawAxisLines(chart.g, chart.xAxis, chart.yAxis, height, margins.top, margins.left, margins.bottom);
        // Draw the piano foreground
        drawPianoForeground(pitchDomain);
        var colours = d3.scale.category20().domain(data.partcount);
        // Draw the barlines
        drawBarLines(data.barlines);
        // Draw the parts
        drawParts(data.partdata, data.partnames, colours);
        // Draw the hover titles
        drawHoverTitles();
        // Draw the piano background
        drawPianoBackground(pitchDomain);
        // Build the legend
        buildLegend(chart.g,
            data.partnames,
            colours,
            margins.right,
            margins.top,
            width);
        // Attach the notehead
        drawNoteHead(audioController, chart.x, zoom);

        // Get every note in the piece ordered by start time
        var allNotes = [].concat.apply([],
            data.partdata.map(function(part) {
                return part.notedata;
            }))
            .sort(function(a, b) {
                return a.starttime[0] - b.starttime[0];
            });
        //// Load the notes into the audio player
        audioController.loadPiece(allNotes);

        // Draw part selector
        attachPartSelector(selector, data.partnames);

        // Invoke zoomtick so that the initial note positions are set
        zoomTick();
    }

    // GUI components
    //attachZoomAndLocationPicker();
    attachPlayAndStopButtons(selector, audioController);
    attachPrintButton(selector, d3.select(selector).select("svg")[0][0]);

    return chart;
};

d3.json("/data/piano-roll/", function(error, data) {
    if (error) throw error;
    var pianoRoll = new PianoRoll(".piano-roll", 1024, 400);
    pianoRoll(data);
});