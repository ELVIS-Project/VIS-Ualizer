from flask import Flask, render_template, url_for
from flask.ext.api import FlaskAPI
from flask.ext.api.decorators import set_renderers
from flask.ext.api.renderers import HTMLRenderer

app = FlaskAPI(__name__)


@app.route("/graph/")
def bar_graph():
    return [
        {
            "label": "Label One",
            "value": 10
        },
        {
            "label": "two",
            "value": 30
        },
        {
            "label": "three",
            "value": 60
        },
        {
            "label": "four",
            "value": 100
        },
        {
            "label": "five",
            "value": 25
        },
        {
            "label": "six",
            "value": 100
        },
        {
            "label": "seven",
            "value": 25
        }
    ]


@app.route("/")
@set_renderers(HTMLRenderer)
def hello():
    js_files = [
        url_for("static", filename="js/d3.js"),
        url_for("static", filename="js/bargraph.js")
    ]
    return render_template('index.html', js_files=js_files)


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=8000)
