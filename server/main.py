from flask import Flask, render_template, url_for
from flask.ext.api import FlaskAPI
from flask.ext.api.decorators import set_renderers
from flask.ext.api.renderers import HTMLRenderer
#app = Flask(__name__)
app = FlaskAPI(__name__)

@app.route("/graph/")
def bar_graph():
    return {
        "bar1": 10,
        "bar2": 30,
        "bar3": 60
    }

@app.route("/")
@set_renderers(HTMLRenderer)
def hello():
    js_files = [
        url_for("static", filename="js/d3.js")
    ]
    return render_template('index.html', js_files=js_files)

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=8000)
