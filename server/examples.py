example_types = {
    "bar-graph": {
        "name": "Bar Graph",
        "js": ["js/bargraph.js"],
        "template": "example/bar-graph.html"
    },
    "bar-graph-clustered": {
        "name": "Bar Graph - Clustered",
        "js": ["js/bargraph_grouped.js"],
        "template": "example/bar-graph-grouped.html"
    },
    "force-directed-graph": {
        "name": "Force-Directed Graph",
        "js": ["js/force_directed_graph.js"],
        "template": "example/force-directed-graph.html"
    },
    "heat-map": {
        "name": "Heat Map",
        "js": ["js/heat_map.js"],
        "template": "example/heat-map.html"
    },
    # "co-occurrence-matrix": {
    #     "name": "Co-Occurrence Matrix",
    #     "js": "js/co_occurrence_matrix.js",
    #     "template": "example/co-occurrence-matrix.html"
    # },
    "piano-roll": {
        "name": "Piano Roll",
        "js": ["js/libs/MIDI/shim/Base64binary.js", "js/libs/MIDI/MIDI.js", "js/audio_controller.js", "js/piano_roll.js"],
        "template": "example/piano-roll.html"
    },
    "pie-chart": {
        "name": "Pie Chart",
        "js": ["js/pie_chart.js"],
        "template": "example/pie-chart.html"
    },
    "score-display": {
        "name": "Score Display",
        "js": ["js/libs/jquery.js", "js/libs/MIDI/shim/Base64.js", "js/libs/MIDI/shim/Base64binary.js", "js/libs/verovio-toolkit.js",
               "js/libs/MIDI/MIDI.js",
               "js/libs/MIDI/player.js", "js/libs/MIDI/jasmid/stream.js", "js/libs/MIDI/jasmid/midifile.js",
               "js/libs/MIDI/jasmid/replayer.js", "js/audio_controller.js",
                "js/score_display.js"],
        "template": "example/score-display.html"
    }
}
