#!/usr/bin/env python
# -*- coding: utf-8 -*-

# workflow editor server
# using rdflib
# author: Harshvardhan Pandit

from flask import Flask, request
from flask import render_template
from flask.json import jsonify

from libOPMW.export_rdf import append_graph
from libOPMW.export_rdf import type_mappings
from libOPMW.export_rdf import sparql_query

# set the project root directory as the static folder, you can set others.
app = Flask(
    __name__,
    template_folder='static'
)


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/<path:path>/')
def send_js(path):
    return app.send_static_file(path)


@app.route('/publish/workflowtemplate/', methods=['POST'])
def publish_workflowtemplate():

    if request.is_json:
        data = request.get_json()
        for item in data['objects'].values():
            item_type = item['type']
            graph = type_mappings[item_type](item)
            append_graph(graph)
    else:
        return 'data is not in JSON', 400
    return 'received data', 200


@app.route('/sparql/query/')
def sparql_query_template():
    return render_template('sparql_query.html')


@app.route('/sparql/query/run/', methods=['POST'])
def sparql_query_run():

    if not request.is_json:
        return 'query not in JSON', 400

    data = request.get_json()
    results, error_msg = sparql_query(data['query'])
    if error_msg:
        return jsonify({
            'error': True,
            'error_message': error_msg})

    if not results or len(results) == 0:
        no_colummns = 0
    else:
        no_colummns = len(results[0])

    return jsonify({
        'error': False,
        'columns': no_colummns,
        'results': results})


if __name__ == "__main__":
    app.run(debug=True)
