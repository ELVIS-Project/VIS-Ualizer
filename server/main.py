import random
import sys

from flask import render_template, url_for, abort
from flask.ext.api import FlaskAPI
from flask.ext.api.decorators import set_renderers
from flask.ext.api.renderers import HTMLRenderer
from helpers.parsers import CoOccurrenceMatrixParser, JsonParser
# Data from external modules
from data import dendrogram
from examples import example_types


app = FlaskAPI(__name__)

@app.route("/data/piano-roll/")
def data_piano_roll():
    return JsonParser("../data/json/Domine_non_secundum_peccata.json").parse()


@app.route("/data/dendrogram/")
def data_dendrogram():
    return dendrogram.matrix


@app.route("/data/arbitrary-matrix/<max>/")
def data_arbitrary_matrix(max):
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


@app.route("/example/<id>/")
@set_renderers(HTMLRenderer)
def example(id):
    js_files = [
        url_for("static", filename="js/libs/d3.js"),
        url_for("static", filename="js/utils.js")
    ]
    if example_types.has_key(id):
        example = example_types[id]
        js_files.append(url_for("static", filename=example["js"]))
        return render_template(example["template"], js_files=js_files)
    else:
        # Invalid ID
        abort(404)


@app.route("/")
@set_renderers(HTMLRenderer)
def hello():
    example_links = []
    for id in example_types.keys():
        example_links.append({
            "name": example_types[id]["name"],
            "url": "/example/{0}/".format(id)
        })
    return render_template('example-list.html',
                           js_files=[],
                           example_links=example_links)


if __name__ == "__main__":
    app.debug = True
    app.run(host=sys.argv[1], port=int(sys.argv[2]))
