var AudioController = function()
{
    this.bpm = 360;

    this.isPlaying = false;
    this.currentBeat = 0;
    this.notesIndex = 0;
    this.stopIndex = 0;
    this.notes = [];
    this.parts = [];
    this.activatedParts = {};

    // A D3 dispatch that
    this.beatEventDispatch = d3.dispatch("beat");

    // Initialize the MIDI system
    MIDI.loadPlugin({
        soundfontUrl: "/static/soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress)
        {
            //console.log(state, progress);
        },
        onsuccess: function()
        {
            MIDI.setVolume(0, 127);
        }
    });

    /**
     * Calculate the number of seconds to play a set of beats.
     *
     * @param numBeats
     * @returns {number}
     */
    this.beatsToSeconds = function(numBeats)
    {
        var bps = 60 / this.bpm;
        return bps * numBeats;
    };

    /**
     * Play a note using the MIDI controller.
     *
     * @param pitch
     * @param velocity
     * @param duration
     */
    this.playNote = function(pitch, velocity, duration)
    {
        var delay = 0;
        MIDI.noteOn(0, pitch, velocity, delay);
        MIDI.noteOff(0, pitch, delay + duration);
    };

    /**
     * Load the notes of a piece into the AudioController.
     *
     * @param notes
     * @param parts
     */
    this.loadPiece = function(notes, parts)
    {
        this.notes = notes;
        this.stopIndex = notes.length;
        console.log(this.stopIndex);
        this.parts = parts;
        // Create the "part activated" array
        this.activatedParts = {};
        // Activate all parts
        var that = this;
        parts.map(function(part)
        {
            that.activatePart(part);
        });
    };

    /**
     * Activate a part.
     *
     * @param partName
     */
    this.activatePart = function(partName)
    {
        this.activatedParts[String(partName)] = true;
    };

    /**
     * Deactivate a part.
     *
     * @param partName
     */
    this.deactivatePart = function(partName)
    {
        this.activatedParts[String(partName)] = false;
    };

    /**
     * Check if a part has been activated.
     *
     * @param partName
     * @returns {boolean}
     */
    this.isPartActivated = function (partName)
    {
        return this.activatedParts[String(partName)] === true;
    };

    this.getNotesIndex = function ()
    {
        return this.notesIndex;
    }

    this.setNotesIndex = function (index)
    {
            this.notesIndex = index;
    }

    this.getStopIndex = function ()
    {
        return this.stopIndex;
    }

    this.setStopIndex = function (index)
    {
        this.stopIndex = index;
    }



    this.playPiece = function()
    {
        // Don't do anything if already playing
        if (this.isPlaying)
        {
            return;
        }
        var milisecondsPerBeat = this.beatsToSeconds(1) * 1000;
        this.isPlaying = true;
        var velocity = 87;
        var that = this;
        var playNoteIfReady = function()
        {
            console.log(that.notesIndex);
            console.log(that.stopIndex);
            console.log(that.isPlaying);
            if (that.isPlaying && that.notesIndex < that.stopIndex)
            {
                console.log("passed the if");
                // Play all the notes that are currently playable

                while (that.notesIndex < that.stopIndex && that.notes[that.notesIndex].starttime[0] < that.currentBeat)
                {
                    // Play the note if it's part is activated
                    if (that.isPartActivated(that.notes[that.notesIndex].partname))
                    {
                        var pitch = that.notes[that.notesIndex].pitch.b12;
                        var duration = that.beatsToSeconds(that.notes[that.notesIndex].duration[0]);
                        that.playNote(pitch, velocity, duration);
                    }
                    // Increment the noteindex whether or not we actually play the note
                    that.notesIndex++;
                }

                // Move onto the next beat
                that.currentBeat++;
                // Broadcast an event
                that.beatEventDispatch.beat(that.currentBeat);
                window.setTimeout(playNoteIfReady, milisecondsPerBeat, that.notesIndex);
            }
        };

        playNoteIfReady();
    };

    this.pausePiece = function()
    {
        this.isPlaying = false;
    };

    this.resetPiece = function()
    {
        this.isPlaying = false;
        this.currentBeat = 0;
        this.notesIndex = 0;
        this.stopIndex = this.notes.length;
        this.beatEventDispatch.beat(this.currentBeat);
    }
};
