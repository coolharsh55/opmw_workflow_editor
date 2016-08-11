from flask import Flask, request
from flask import render_template
import pprint

# set the project root directory as the static folder, you can set others.
app = Flask(
    __name__,
    template_folder='static'
)


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/<path:path>')
def send_js(path):
    return app.send_static_file(path)


@app.route('/publish/workflowtemplate', methods=['GET', 'POST'])
def publish_workflowtemplate():
    if request.is_json:
        data = request.get_json()
        print(data.keys())
    else:
        print('not JSON')
    return 'OK'


if __name__ == "__main__":
    app.run(debug=True)
