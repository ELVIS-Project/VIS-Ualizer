from flask import Flask, render_template, url_for
from flask.ext.api import FlaskAPI
from flask.ext.api.decorators import set_renderers
from flask.ext.api.renderers import HTMLRenderer
from helpers.CoOccurrenceMatrixParser import CoOccurrenceMatrixParser
import sys
import random

app = FlaskAPI(__name__)


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


@app.route("/")
@set_renderers(HTMLRenderer)
def hello():
    js_files = [
        url_for("static", filename="js/libs/d3.js"),
        url_for("static", filename="js/utils.js"),
        url_for("static", filename="js/bargraph.js"),
        url_for("static", filename="js/bargraph_grouped.js"),
        url_for("static", filename="js/force_directed_graph.js"),
        url_for("static", filename="js/co_occurrence_matrix.js")
    ]
    return render_template('index.html', js_files=js_files)


if __name__ == "__main__":
    app.debug = True
    app.run(host=sys.argv[1], port=int(sys.argv[2]))
