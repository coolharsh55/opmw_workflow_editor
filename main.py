#!/usr/bin/env python
# -*- coding: utf-8 -*-

# workflow editor server
# using rdflib
# author: Harshvardhan Pandit

import json
import os

from flask import Flask, request
from flask import render_template
from flask.json import jsonify

from libOPMW.export_rdf import append_graph
from libOPMW.export_rdf import type_mappings
from libOPMW.export_rdf import sparql_query
# from libOPMW.export_rdf import serialize_entire_graph
from libOPMW.export_rdf import serialize_graph
from libOPMW.export_rdf import list_workflows
from libOPMW.export_rdf import check_template_exists
from libOPMW.export_rdf import get_template, get_graph

from libOPMW import classes as opmw

# set the project root directory as the static folder, you can set others.
app = Flask(
    __name__,
    template_folder='static'
)


@app.route('/')
def root():
    return render_template('index.html')


# NEW WORKFLOW


@app.route('/new_workflow/')
def new_workflow():
    return render_template('/workflow_template/new_workflow.html')


@app.route('/<path:path>/')
def send_js(path):
    return app.send_static_file(path)


@app.route('/publish/workflowtemplate/', methods=['POST'])
def publish_workflowtemplate():

    if request.form:
        data = json.loads(request.form.getlist('data')[0])
        experiment_label = data['workflow_template']
        filename = experiment_label + '.png'
        data['objects'][experiment_label]['image'] = filename
        file = request.files['image']
        file.save(os.path.join('./export/images', filename))
        print('./export/images/created {}'.format(filename))

        for item in data['objects'].values():
            item_type = item['type']
            graph = type_mappings[item_type](item)
            append_graph(graph)
            serialize_graph(graph, item['rdfs:label'])
    else:
        return 'data is not in JSON', 400
    return 'received data', 200


@app.route('/workflow_processes/')
def workflow_processes():

    workflows = list_workflows()
    return jsonify({'workflows': workflows})


# EXECUTE WORKFLOW


@app.route('/execute_workflow/<label>/')
def execute_workflow(label):
    # load the execution json from opmw
    # with open('./static/opmw.json', 'r') as f:
    #     data = json.load(f)
    #     execution = data['execution']

    # get template from graph
    if not check_template_exists(label):
        return 'label does not exist', 404
    return_val = get_template(label)
    if return_val is None:
        return 'error', 400
    template_uri, data_vars, parameters, steps = return_val
    try:
        graph = get_graph()
        template = opmw.WorkflowTemplate.parse_from_graph(graph, template_uri)
        data_vars = [
            opmw.DataVariable.parse_from_graph(graph, data_var_uri)
            for data_var_uri, data_var_label in data_vars]
        parameters = [
            opmw.ParameterVariable.parse_from_graph(graph, param_uri)
            for param_uri, param_label in parameters]
        steps = [
            opmw.WorkflowTemplateProcess.parse_from_graph(graph, step_uri)
            for step_uri, step_label in steps]
        data = {
            'template': {
                'uri': str(template.uri),
                'label': str(template.label),
                'contributors': [str(c) for c in template.contributors],
                'modified': str(template.modified),
                'version': str(template.version),
                'documentation': str(template.documentation),
                'workflow_system': str(template.workflow_system),
                'native_system_template': str(template.native_system_template)
            },
            'data_variables': [
                {
                    'uri': str(data_var.uri),
                    'label': str(data_var.label),
                    'dimensionality': str(data_var.dimensionality),
                    'generated_by': str(data_var.generated_by)
                } for data_var in data_vars
            ],
            'parameters': [
                {
                    'uri': str(parameter.uri),
                    'label': str(parameter.label),
                    'dimensionality': str(parameter.dimensionality),
                } for parameter in parameters
            ],
            'steps': [
                {
                    'uri': str(step.uri),
                    'label': str(step.label),
                    'uses': [str(c) for c in step.uses]
                } for step in steps
            ]
        }
        with open('/tmp/temp.json', 'w') as fp:
            json.dump(data, fp)
    except Exception:
        raise
    finally:
        graph.close()

    # return 'OK', 200

    # create json representation of template for execution
    # send json to template
    return render_template(
        '/workflow_execution/execute_workflow.html', data=data)


@app.route('/publish/workflowexecution/', methods=['POST'])
def publish_workflowexecution():

    if request.form:
        data = json.loads(request.form.getlist('data')[0])
        template = data['account']
        account = data['objects'][template]
        filename = account['rdfs:label'] + '.png'
        file = request.files['image']
        file.save(os.path.join('./export/images', filename))
        print('./export/images/created {}'.format(filename))

        for item in data['objects'].values():
            item_type = item['type']
            graph = type_mappings[item_type](item)
            append_graph(graph)
            serialize_graph(graph, item['rdfs:label'])
    else:
        return 'no data received', 400
    return 'received data', 200

# SPARQL


@app.route('/sparql/query/')
def sparql_query_template():
    return render_template('/sparql/sparql_query.html')


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
