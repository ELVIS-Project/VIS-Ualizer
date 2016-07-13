import random
import sys
import uuid

from flask import render_template, url_for, abort, send_file
from flask.ext.api import FlaskAPI
from flask.ext.api.decorators import set_renderers
from flask.ext.api.renderers import HTMLRenderer
from helpers.parsers import CoOccurrenceMatrixParser, JsonParser
# Data from external modules
from data import dendrogram
from examples import example_types



app = FlaskAPI(__name__)

<<<<<<< HEAD
@app.route("/data/score-display/")
def data_score_display():
    return send_file("../data/scores/Absalon-fili-mi_Josquin-Des-Prez_file5.mei")

=======
>>>>>>> origin/develop
@app.route("/data/pie-chart/")
def data_pie_chart():
    return [
        {
            "label": "a",
            "value": 2704659
        },
        {
            "label": "b",
            "value": 4499890
        },
        {
            "label": "c",
            "value": 2159981
        },
        {
            "label": "d",
            "value": 3853788
        },
        {
            "label": "e",
            "value": 14106543
        },
        {
            "label": "f",
            "value": 8819342
        },
        {
            "label": "g",
            "value": 612463
        }
    ]


@app.route("/data/piano-roll/")
def data_piano_roll():
    return JsonParser("../data/json/Domine_non_secundum_peccata.json").parse()


@app.route("/data/piano-roll/qui-habitat/")
def data_piano_roll_qui_habitat():
    return JsonParser("../data/json/qui_habitat.json").parse()


@app.route("/data/dendrogram/")
def data_dendrogram():
    return dendrogram.matrix


@app.route("/data/arbitrary-matrix/<data_max>/")
def data_arbitrary_matrix(data_max):
    data_max = int(data_max)
    output = dict()
    for i in range(data_max):
        output[i] = dict()
        for j in range(data_max):
            output[i][j] = (i * j) / float(data_max * data_max)
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
def data_grouped_bar_graph():
    data_min = 0.0
    data_max = 100.0
    data = [list(), list(), list()]
    for i in range(3):
        print(i)
        for j in range(64):
            data[i].append(dict(label=j, value=random.uniform(data_min, data_max)))
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


@app.route("/graph/<num>/")
@app.route("/graph/")
def data_bar_graph(num=32):
    data_min = 0.0
    data_max = 100.0
    output = []
    for i in range(int(num)):
        output.append(dict(label=str(uuid.uuid4())[:2], value=random.uniform(data_min, data_max)))
    return output


@app.route("/example/<example_id>/")
@set_renderers(HTMLRenderer)
def example(example_id):
    js_files = [
        url_for("static", filename="js/libs/d3.js"),
        url_for("static", filename="js/utils.js")
    ]
    if example_id in example_types:
        example_item = example_types[example_id]
        for js_file in example_item["js"]:
            js_files.append(url_for("static", filename=js_file))
        print(js_files)
        return render_template(example_item["template"], js_files=js_files)
    else:
        # Invalid ID
        abort(404)


@app.route("/")
@set_renderers(HTMLRenderer)
def hello():
    example_links = []
    for example_id in list(example_types.keys()):
        example_links.append({
            "name": example_types[example_id]["name"],
            "url": "/example/{0}/".format(example_id)
        })
    return render_template('example-list.html',
                           js_files=[],
                           example_links=example_links)


if __name__ == "__main__":
    app.debug = True
    app.run(host=sys.argv[1], port=int(sys.argv[2]))
    #app.run(host='127.0.0.1', port=5000)
