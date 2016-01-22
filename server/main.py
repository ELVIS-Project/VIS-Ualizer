from flask import Flask, render_template, url_for, abort
from flask.ext.api import FlaskAPI
from flask.ext.api.decorators import set_renderers
from flask.ext.api.renderers import HTMLRenderer
from helpers.CoOccurrenceMatrixParser import CoOccurrenceMatrixParser
import sys
import random

app = FlaskAPI(__name__)


@app.route("/arbitrary-matrix/<max>/")
def big_ass_data(max):
    max = int(max)
    output = dict()
    for i in range(max):
        output[i] = dict()
        for j in range(max):
            output[i][j] = (i * j) / float(max * max)
    return output


@app.route("/data/duet/heat/")
def data_heatmap_duet():
    file_path = "../data/non-truncated/Heatmap-vis36duet_int_corrs.csv"
    return CoOccurrenceMatrixParser(file_path).parse()


@app.route("/data/ave-maria/", defaults={'voice': None})
@app.route("/data/ave-maria/<voice>/")
def data_ave_maria(voice):
    # Build the string
    file_path = "../data/truncated/Josquin-Des-Prez_Ave-Maria...-virgo-serena"
    if voice == "alto":
        file_path += "_Alto"
    elif voice == "bass":
        file_path += "_Bass"
    elif voice == "soprano":
        file_path += "_Soprano"
    elif voice == "tenor":
        file_path += "_Tenor"
    file_path += ".csv"
    # Load the correct file and process it
    return CoOccurrenceMatrixParser(file_path).parse()


@app.route("/graph/grouped/")
def grouped_bar_graph():
    min = 0.0
    max = 100.0
    data = [[], [], []]
    for i in range(3):
        print i
        for j in range(64):
            data[i].append(dict(label=j, value=random.uniform(min, max)))
    return [
        {
            "group_label": "first group",
            "group_members": data[0]
        },
        {
            "group_label": "second group",
            "group_members": data[1]
        },
        {
            "group_label": "third group",
            "group_members": data[2]
        },
    ]


@app.route("/graph/")
def bar_graph():
    min = 0.0
    max = 100.0
    output = []
    for i in range(32):
        output.append(dict(label=i, value=random.uniform(min,max)))
    return output


@app.route("/example/<name>/")
@set_renderers(HTMLRenderer)
def example(name):
    js_files = [
        url_for("static", filename="js/libs/d3.js"),
        url_for("static", filename="js/utils.js")
    ]
    if name == "bar-graph":
        js_files.append(url_for("static", filename="js/bargraph.js"))
        return render_template('example/bar-graph.html', js_files=js_files)
    elif name == "bar-graph-grouped":
        js_files.append(url_for("static", filename="js/bargraph_grouped.js"))
        return render_template('example/bar-graph-grouped.html', js_files=js_files)
    elif name == "force-directed-graph":
        js_files.append(url_for("static", filename="js/force_directed_graph.js"))
        return render_template('example/force-directed-graph.html', js_files=js_files)
    elif name == "heat-map":
        js_files.append(url_for("static", filename="js/heat_map.js"))
        return render_template('example/heat-map.html', js_files=js_files)
    elif name == "co-occurrence-matrix":
        js_files.append((url_for("static", filename="js/co_occurrence_matrix.js")))
        return render_template("example/co-occurrence-matrix.html")
    else:
        abort(404)


@app.route("/")
@set_renderers(HTMLRenderer)
def hello():
    js_files = [
        # url_for("static", filename="js/libs/d3.js"),
        # url_for("static", filename="js/utils.js"),
        # url_for("static", filename="js/bargraph.js"),
        # url_for("static", filename="js/bargraph_grouped.js"),
        # url_for("static", filename="js/force_directed_graph.js"),
        # url_for("static", filename="js/heat_map.js"),
        # # url_for("static", filename="js/co_occurrence_matrix.js")
    ]
    example_links = [
        {"name": "Bar Graph", "url": "/example/bar-graph/"},
        {"name": "Bar Graph Grouped", "url": "/example/bar-graph-grouped/"},
        {"name": "Force-Directed Graph", "url": "/example/force-directed-graph/"},
        {"name": "Heat Map", "url": "/example/heat-map/"},
        {"name": "Co-Occurrence Matrix", "url": "/example/co-occurrence-matrix/"}
    ]
    return render_template('example-list.html',
                           js_files=js_files,
                           example_links=example_links)


if __name__ == "__main__":
    app.debug = True
    app.run(host=sys.argv[1], port=int(sys.argv[2]))
