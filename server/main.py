from flask import Flask, render_template, url_for
from flask.ext.api import FlaskAPI
from flask.ext.api.decorators import set_renderers
from flask.ext.api.renderers import HTMLRenderer
import sys

app = FlaskAPI(__name__)


@app.route("/graph/grouped/")
def grouped_bar_graph():
    return [
        {
            "group_label": "first group",
            "group_members":
                [
                    {
                        "label": "one",
                        "value": 10
                    },
                    {
                        "label": "two",
                        "value": 30
                    },
                    {
                        "label": "three",
                        "value": 25
                    },
                    {
                        "label": "four",
                        "value": 10
                    },
                    {
                        "label": "five",
                        "value": 45
                    },
                    {
                        "label": "six",
                        "value": 25
                    }
                ]
        },
        {
            "group_label": "second group",
            "group_members":
                [
                    {
                        "label": "one",
                        "value": 25
                    },
                    {
                        "label": "two",
                        "value": 15
                    },
                    {
                        "label": "three",
                        "value": 45
                    },
                    {
                        "label": "four",
                        "value": 35
                    },
                    {
                        "label": "five",
                        "value": 45
                    },
                    {
                        "label": "six",
                        "value": 20
                    }
                ]
        },
        {
            "group_label": "third group",
            "group_members":
                [
                    {
                        "label": "one",
                        "value": 50
                    },
                    {
                        "label": "two",
                        "value": 30
                    },
                    {
                        "label": "three",
                        "value": 40
                    },
                    {
                        "label": "four",
                        "value": 20
                    },
                    {
                        "label": "five",
                        "value": 45
                    },
                    {
                        "label": "six",
                        "value": 25
                    }
                ]
        },
    ]


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
            "value": 75
        },
        {
            "label": "five",
            "value": 25
        },
        {
            "label": "six",
            "value": 95
        },
        {
            "label": "seven",
            "value": 25
        },
        {
            "label": "eight",
            "value": 50
        }
    ]


@app.route("/")
@set_renderers(HTMLRenderer)
def hello():
    js_files = [
        url_for("static", filename="js/libs/d3.js"),
        url_for("static", filename="js/bargraph.js"),
        url_for("static", filename="js/bargraph_grouped.js")
    ]
    return render_template('index.html', js_files=js_files)


if __name__ == "__main__":
    app.debug = True
    app.run(host=sys.argv[1], port=int(sys.argv[2]))
