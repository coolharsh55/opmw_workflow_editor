#!/usr/bin/env python
# -*- coding: utf-8 -*-

# workflow editor server
# using rdflib
# author: Harshvardhan Pandit

import json
import os

from flask import Flask, request
from flask import render_template, send_from_directory
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

from help_views import help_views

# set the project root directory as the static folder, you can set others.
app = Flask(
    __name__,
    template_folder='static'
)

app.register_blueprint(help_views)


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/export/<path:filename>')
def exported_rdf(filename):
    return send_from_directory('export', filename)


@app.route('/create/')
def create():
    return render_template('create/create.html')


@app.route('/execute-workflow/<label>/')
def execute(label):

    # FIXME
    label = 'experiment_A'
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
            'opmw:WorkflowTemplate': {
                'uri': str(template.uri),
                'label': str(template.label),
                'contributors': [str(c) for c in template.contributors],
                'modified': str(template.modified),
                'version': str(template.version),
                'documentation': str(template.documentation),
                'workflow_system': str(template.workflow_system),
                'native_system_template': str(template.native_system_template)
            },
            'opmw:DataVariable': [
                {
                    'uri': str(data_var.uri),
                    'label': str(data_var.label),
                    'dimensionality': str(data_var.dimensionality),
                    'generated_by': str(data_var.generated_by)
                } for data_var in data_vars
            ],
            'opmw:ParameterVariable': [
                {
                    'uri': str(parameter.uri),
                    'label': str(parameter.label),
                    'dimensionality': str(parameter.dimensionality),
                } for parameter in parameters
            ],
            'opmw:WorkflowTemplateProcess': [
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

    return render_template('execute/execute.html', template=data)


# NEW WORKFLOW


@app.route('/new_workflow/')
def new_workflow():
    return render_template('/workflow_template/new_workflow.html')


@app.route('/<path:path>/')
def send_js(path):
    return app.send_static_file(path)


@app.route('/publish/workflowtemplate/', methods=['POST'])
def publish_workflowtemplate():

    if not request.form:
        return 'data is not in JSON', 400
    data = json.loads(request.form.getlist('data')[0])

    experiment_label = data['template']['properties']['rdfs:label']
    filename = experiment_label + '.png'
    data['template']['image'] = filename
    file = request.files['image']
    file.save(os.path.join('./export/images', filename))
    print('./export/images/created {}'.format(filename))

    # workflow template
    template_graph = type_mappings['opmw:WorkflowTemplate'](data)
    append_graph(template_graph)
    serialize_graph(template_graph, experiment_label)

    # parameter variables
    for label, item in data['parameter_variables'].items():
        parameter = {}
        parameter['rdfs:label'] = label
        parameter['opmw:hasDimensionality'] = 0
        parameter['opmw:isParameterOfTemplate'] = experiment_label
        graph = type_mappings['opmw:ParameterVariable'](parameter)
        append_graph(graph)
        serialize_graph(graph, label)

    # data variables
    for label, item in data['data_variables'].items():
        properties = item['properties']
        data_variable = {}
        data_variable['rdfs:label'] = label
        data_variable['opmw:hasDimensionality'] =\
            properties['opmw:hasDimensionality']
        data_variable['opmw:isGeneratedBy'] =\
            properties['opmw:wasGeneratedBy']
        data_variable['opmw:isVariableOfTemplate'] = experiment_label
        graph = type_mappings['opmw:DataVariable'](data_variable)
        append_graph(graph)
        serialize_graph(graph, label)

    # steps
    for label, item in data['steps'].items():
        properties = item['properties']
        step = {}
        step['rdfs:label'] = label
        step['opmw:isStepOfTemplate'] = experiment_label
        step['opmw:uses'] = item['properties']['opmw:uses']
        # step['opmw:uses'] = []
        # for item_id in item['properties']['opmw:uses']:
        #     flag_found = False
        #     for data_variable in data['data_variables'].values():
        #         if item_id == data_variable['_id']:
        #             step['opmw:uses'].append(
        #                 data_variable['properties']['rdfs:label'])
        #             flag_found = True
        #             break
        #     if flag_found:
        #         continue
        #     for parameter in data['parameter_variables'].values():
        #         if item_id == parameter['_id']:
        #             step['opmw:uses'].append(
        #                 parameter['properties']['rdfs:label'])
        #             flag_found = True
        #             break
        #     if not flag_found:
        #         print('error: {} not found for opmw:uses'.format(item_id))
        graph = type_mappings['opmw:WorkflowTemplateProcess'](step)
        append_graph(graph)
        serialize_graph(graph, label)

    # for item in data['objects'].values():
    #     item_type = item['type']
    #     graph = type_mappings[item_type](item)
    #     append_graph(graph)
    #     serialize_graph(graph, item['rdfs:label'])

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
            'opmw:WorkflowTemplate': {
                'uri': str(template.uri),
                'label': str(template.label),
                'contributors': [str(c) for c in template.contributors],
                'modified': str(template.modified),
                'version': str(template.version),
                'documentation': str(template.documentation),
                'workflow_system': str(template.workflow_system),
                'native_system_template': str(template.native_system_template)
            },
            'opmw:DataVariable': [
                {
                    'uri': str(data_var.uri),
                    'label': str(data_var.label),
                    'dimensionality': str(data_var.dimensionality),
                    'generated_by': str(data_var.generated_by)
                } for data_var in data_vars
            ],
            'opmw:ParameterVariable': [
                {
                    'uri': str(parameter.uri),
                    'label': str(parameter.label),
                    'dimensionality': str(parameter.dimensionality),
                } for parameter in parameters
            ],
            'opmw:WorkflowTemplateProcess': [
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
        data_account = data['execution_account']
        account = opmw.WorkflowExecutionAccount()
        account.label = data_account["properties"]["rdfs:label"]
        account.uri = "lvh.me/execution-account/" + account.label
        account.template =\
            data_account["properties"]["opmw:correspondsToTemplate"]
        account.diagram =\
            "lvh.me:5000/export/images/%s.png" % account.label
        account.status = str(data_account["properties"]["opmw:hasStatus"])
        account.start_time =\
            data_account["properties"]["opmw:overallStartTime"]
        account.end_time = account.start_time
        account.workflow_system = "lvh.me/workflow-system/workflow-editor/"
        for extra_property in data_account["properties"]["extra"]:
            pass
        append_graph(account.graph)
        serialize_graph(account.graph, account.label)

        # store by id
        data_ids = {data_account["_id"]: account.uri}

        for data_artifact in data['artifacts']:
            artifact = opmw.WorkflowExecutionArtifact()
            artifact.label = data_artifact["properties"]["rdfs:label"]
            artifact.uri = "lvh.me/execution-artifact/" + artifact.label
            artifact.template_artifact =\
                data_artifact["properties"][
                    "opmw:correspondsToTemplateArtifact"]
            artifact.account = account.uri
            artifact.filename = data_artifact["properties"]["opmw:hasFileName"]
            artifact.location = data_artifact["properties"]["opmw:hasLocation"]
            artifact.size = data_artifact["properties"]["opmw:hasSize"]
            append_graph(artifact.graph)
            serialize_graph(artifact.graph, artifact.label)
            data_ids[data_artifact["_id"]] = artifact

        for data_process in data['processes']:
            process = opmw.WorkflowExecutionProcess()
            process.label = data_process["properties"]["rdfs:label"]
            process.uri = "lvh.me/execution-process/" + process.label
            process.account = account.uri
            process.template_process = \
                data_process["properties"]["opmw:correspondsToTemplateProcess"]
            process.used = [
                data_ids[x].uri
                for x in data_process["properties"]["opmw:used"]]
            if data_process["properties"]["opmw:hasExecutableComponents"]:
                process.component =\
                    data_process[
                        "properties"]["opmw:hasExecutableComponents"][0]
            append_graph(process.graph)
            serialize_graph(process.graph, process.label)
            data_ids[data_process["_id"]] = process

        for data_artifact in data['artifacts']:
            if "opmw:wasGeneratedBy" in data_artifact["properties"]:
                artifact = data_ids[data_artifact["_id"]]
                if data_artifact["properties"]["opmw:wasGeneratedBy"] is None:
                    continue
                artifact.generated_by =\
                    data_ids[data_artifact["properties"][
                        "opmw:wasGeneratedBy"]].uri
                append_graph(artifact.graph)
                serialize_graph(artifact.graph, artifact.label)
        filename = account.label + '.png'
        file = request.files['image']
        file.save(os.path.join('./export/images', filename))
        print('./export/images/created {}'.format(filename))
    else:
        return 'no data received', 400
    return 'received data', 200


# display published results
@app.route('/published/template/<label>/')
def published_template(label):
    graph = get_graph()
    template_uri = list(graph.query('''
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix opmw: <http://www.opmw.org/ontology/>

        SELECT ?s
        WHERE {
          ?s a opmw:WorkflowTemplate .
          ?s rdfs:label "%s"
        }''' % label))
    if not template_uri:
        return 'no template found', 400

    template_uri = template_uri[0][0]
    template = opmw.WorkflowTemplate.parse_from_graph(graph, template_uri)
    if not template:
        return 'no template found in graph', 400
    data_template = {
        'label': template.label,
        'contributors': [str(c) for c in template.contributors],
        'modified': template.modified,
        'version': template.version,
        'documentation': template.documentation,
        'workflow_system': template.workflow_system,
        'template_diagram': template.template_diagram,
        'native_system_template': template.native_system_template,
        'data_variables': template.data_variables,
        'parameter_variables': template.parameter_variables,
        'steps': template.steps,
        'execution_accounts': template.execution_accounts,
    }
    for key, value in data_template.items():
        if not value:
            data_template[key] = 'N/A'
    data_steps = []
    data_variables = []
    data_parameters = []
    data_accounts = []
    data_artifacts = []
    data_processes = []

    artifacts_uris = set()
    processes_uris = set()

    for step_uri in template.steps:
        step = opmw.WorkflowTemplateProcess.parse_from_graph(graph, step_uri)
        if not step:
            return 'error parsing step %s' % step_uri, 400
        data_step = {
            'label': step.label,
            'uses': step.uses,
            'generates': step.generates,
            'execution_processes': step.execution_processes
        }
        for uri in step.execution_processes:
            processes_uris.add(uri)
        data_steps.append(data_step)
    for data_var_uri in template.data_variables:
        data_var = opmw.DataVariable.parse_from_graph(graph, data_var_uri)
        if not data_var:
            return 'error parsing data variable %s' % data_var_uri, 400
        var = {
            'label': data_var.label,
            'dimensionality': data_var.dimensionality,
            'generated_by': data_var.generated_by,
            'used_by': data_var.used_by,
            'execution_artifacts': data_var.execution_artifacts
        }
        for uri in data_var.execution_artifacts:
            artifacts_uris.add(uri)
        data_variables.append(var)
    for param_var_uri in template.parameter_variables:
        param_var = opmw.ParameterVariable.parse_from_graph(
            graph, param_var_uri)
        if not param_var:
            return 'error parsing parameter variable %s' % param_var_uri, 400
        var = {
            'label': param_var.label,
            'dimensionality': param_var.dimensionality,
            'used_by': param_var.used_by,
            'execution_artifacts': param_var.execution_artifacts
        }
        for uri in param_var.execution_artifacts:
            artifacts_uris.add(uri)
        data_parameters.append(var)

    for account_uri in template.execution_accounts:
        account = opmw.WorkflowExecutionAccount.parse_from_graph(
            graph, account_uri)
        if not account:
            return 'error parsing account %s' % account_uri, 400
        acc = {
            'label': account.label,
            'workflow_system': account.workflow_system,
            'start_time': account.start_time,
            'end_time': account.end_time,
            'diagram': account.diagram,
            'status': account.status,
            'log_file': account.log_file,
            'is_account_of': account.is_account_of
        }
        data_accounts.append(acc)

    for artifact_uri in artifacts_uris:
        artifact = opmw.WorkflowExecutionArtifact.parse_from_graph(
            graph, artifact_uri)
        if not artifact:
            return 'error parsing artifact %s' % artifact_uri, 400
        var = {
            'label': artifact.label,
            'account': artifact.account,
            'generated_by': artifact.generated_by,
            'filename': artifact.filename,
            'location': artifact.location,
            'size': artifact.size,
            'used_by': artifact.used_by
        }
        data_artifacts.append(var)

    for process_uri in processes_uris:
        process = opmw.WorkflowExecutionProcess.parse_from_graph(
            graph, process_uri)
        if not process:
            return 'error parsing process %s' % process_uri, 400
        var = {
            'label': process.label,
            'account': process.account,
            'controller': process.controller,
            'component': process.component,
            'generated': process.generates,
            'used': process.used
        }
        data_processes.append(var)
    print(processes_uris)
    # data = {
    #     'template': data_template,
    #     'parameters': data_parameters,
    #     'variables': data_variables,
    #     'steps': data_steps,
    #     'accounts': data_accounts,
    #     'artifacts': data_artifacts,
    #     'processes': data_processes
    # }

    return render_template(
        '/published_template.html',
        template=data_template,
        parameters=data_parameters,
        variables=data_variables,
        steps=data_steps,
        accounts=data_accounts,
        artifacts=data_artifacts,
        processes=data_processes)
    # return jsonify(data)


# display parameter information
@app.route('/published/parameter/<label>/')
def published_parameter(label):
    graph = get_graph()
    parameter_uri = list(graph.query('''
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix opmw: <http://www.opmw.org/ontology/>

        SELECT ?s
        WHERE {
          ?s a opmw:ParameterVariable .
          ?s rdfs:label "%s"
        }''' % label))
    if not parameter_uri:
        return 'no parameter found', 400

    parameter_uri = parameter_uri[0][0]
    parameter = opmw.ParameterVariable.parse_from_graph(graph, parameter_uri)
    if not parameter:
        return 'no parameter found in graph', 400

    data_parameter = {
        'label': parameter.label,
        'dimensionality': parameter.dimensionality,
        'template': parameter.template,
        'used_by': parameter.used_by,
        'execution_artifacts': parameter.execution_artifacts
    }
    data_steps = []
    data_artifacts = []
    # artifact_uris = set()
    # processes_uris = set()

    for key, value in data_parameter.items():
        if not value:
            data_parameter[key] = 'N/A'

    for step_uri in parameter.used_by:
        step = opmw.WorkflowTemplateProcess.parse_from_graph(graph, step_uri)
        if not step:
            return 'error parsing step %s' % step_uri, 400
        var = {
            'label': step.label,
            'uses': step.uses,
            'generates': step.generates,
            'execution_processes': step.execution_processes
        }
        data_steps.append(var)

    for artifact_uri in parameter.execution_artifacts:
        artifact = opmw.WorkflowExecutionArtifact.parse_from_graph(
            graph, artifact_uri)
        if not artifact:
            return 'error parsing artifact %s' % artifact_uri, 400
        var = {
            'label': artifact.label,
            'account': artifact.account,
            'filename': artifact.filename,
            'location': artifact.location,
            'size': artifact.size,
            'used_by': artifact.used_by,
        }
        data_artifacts.append(var)

    return render_template(
        '/published_parameter.html',
        parameter=data_parameter,
        steps=data_steps,
        artifacts=data_artifacts,)


@app.route('/published/data-variable/<label>/')
def published_data_variable(label):
    graph = get_graph()
    data_variable_uri = list(graph.query('''
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix opmw: <http://www.opmw.org/ontology/>

        SELECT ?s
        WHERE {
          ?s a opmw:DataVariable .
          ?s rdfs:label "%s"
        }''' % label))
    if not data_variable_uri:
        return 'no data variable found', 400

    data_variable_uri = data_variable_uri[0][0]
    data_variable = opmw.DataVariable.parse_from_graph(
        graph, data_variable_uri)
    if not data_variable:
        return 'no parameter found in graph', 400

    data_parameter = {
        'label': data_variable.label,
        'dimensionality': data_variable.dimensionality,
        'template': data_variable.template,
        'used_by': data_variable.used_by,
        'execution_artifacts': data_variable.execution_artifacts
    }
    data_steps = []
    data_artifacts = []
    # artifact_uris = set()
    # processes_uris = set()

    for key, value in data_parameter.items():
        if not value:
            data_parameter[key] = 'N/A'

    for step_uri in data_variable.used_by:
        step = opmw.WorkflowTemplateProcess.parse_from_graph(graph, step_uri)
        if not step:
            return 'error parsing step %s' % step_uri, 400
        var = {
            'label': step.label,
            'uses': step.uses,
            'generates': step.generates,
            'execution_processes': step.execution_processes
        }
        data_steps.append(var)

    for artifact_uri in data_variable.execution_artifacts:
        artifact = opmw.WorkflowExecutionArtifact.parse_from_graph(
            graph, artifact_uri)
        if not artifact:
            return 'error parsing artifact %s' % artifact_uri, 400
        var = {
            'label': artifact.label,
            'account': artifact.account,
            'filename': artifact.filename,
            'location': artifact.location,
            'size': artifact.size,
            'used_by': artifact.used_by,
        }
        data_artifacts.append(var)

    return render_template(
        '/published_data_variable.html',
        data_variable=data_parameter,
        steps=data_steps,
        artifacts=data_artifacts,)


@app.route('/published/step/<label>/')
def published_step(label):
    graph = get_graph()
    step_uri = list(graph.query('''
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix opmw: <http://www.opmw.org/ontology/>

        SELECT ?s
        WHERE {
          ?s a opmw:WorkflowTemplateProcess .
          ?s rdfs:label "%s"
        }''' % label))
    if not step_uri:
        return 'no step found', 400

    step_uri = step_uri[0][0]
    step = opmw.WorkflowTemplateProcess.parse_from_graph(graph, step_uri)
    if not step:
        return 'no step found in graph', 400

    data_step = {
        'label': step.label,
        'template': step.template,
        'generates': step.generates,
        'execution_processes': step.execution_processes,
        'uses': step.uses
    }
    processes_uris = set(uri for uri in step.execution_processes)
    processes = []
    for process_uri in processes_uris:
        process = opmw.WorkflowExecutionProcess.parse_from_graph(
            graph, process_uri)
        if not process:
            return 'execution process retrieval error', 400
        data_process = {
            'label': process.label,
            'account': process.account,
            'controller': process.controller,
            'component': process.component,
            'generates': process.generates,
            'used': process.used
        }
        processes.append(data_process)

    return render_template(
        '/published_step.html',
        step=data_step,
        processes=processes,)


@app.route('/published/execution-account/<label>/')
def published_execution_account(label):
    graph = get_graph()
    account_uri = list(graph.query('''
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix opmw: <http://www.opmw.org/ontology/>

        SELECT ?s
        WHERE {
          ?s a opmw:WorkflowExecutionAccount .
          ?s rdfs:label "%s"
        }''' % label))
    if not account_uri:
        return 'no template found', 400

    account_uri = account_uri[0][0]
    # FIXME
    account_uri = 'lvh.me/execution-account/E_LABEL'
    account = opmw.WorkflowExecutionAccount.parse_from_graph(
        graph, account_uri)
    if not account:
        return 'no template found in graph', 400

    processes = list(graph.query('''
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX opmw: <http://www.opmw.org/ontology/>
        PREFIX opmo: <http://openprovenance.org/model/opmo#>
        SELECT ?x
        WHERE {
          ?x opmo:account <%s> .
          ?x a opmw:WorkflowExecutionProcess
        }''' % account_uri))
    if not processes:
        processes = []
    else:
        processes = [
            opmw.WorkflowExecutionProcess.parse_from_graph(
                graph, process_uri[0])
            for process_uri in processes]
        processes = [
            {
                'label': process.label,
                'controller': process.controller,
                'component': process.component,
                'generates': process.generates,
                'used': process.used,
                'template_process': process.template_process
            } for process in processes]

    artifacts = list(graph.query('''
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX opmw: <http://www.opmw.org/ontology/>
        PREFIX opmo: <http://openprovenance.org/model/opmo#>
        SELECT ?x
        WHERE {
          ?x opmo:account <%s> .
          ?x a opmw:WorkflowExecutionArtifact
        }''' % account_uri))
    if not artifacts:
        artifacts = []
    else:
        artifacts = [
            opmw.WorkflowExecutionArtifact.parse_from_graph(
                graph, artifact_uri[0])
            for artifact_uri in artifacts]
        artifacts = [
            {
                'label': artifact.label,
                'generated_by': artifact.generated_by,
                'filename': artifact.filename,
                'location': artifact.location,
                'size': artifact.size,
                'template_artifact': artifact.template_artifact
            } for artifact in artifacts]

    data_account = {
        'label': account.label,
        'template': account.template,
        'workflow_system': account.workflow_system,
        'diagram': account.diagram,
        'start_time': account.start_time,
        'end_time': account.end_time,
        'status': account.status,
        'log_file': account.log_file,
        'processes': processes,
        'artifacts': artifacts
    }

    return render_template(
        '/published_execution_account.html',
        account=data_account)


@app.route('/published/execution-artifact/<label>/')
def published_execution_artifact(label):
    graph = get_graph()
    artifact_uri = list(graph.query('''
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix opmw: <http://www.opmw.org/ontology/>

        SELECT ?s
        WHERE {
          ?s a opmw:WorkflowExecutionArtifact .
          ?s rdfs:label "%s"
        }''' % label))
    if not artifact_uri:
        return 'no artifact found', 400

    artifact_uri = artifact_uri[0][0]
    artifact = opmw.WorkflowExecutionArtifact.parse_from_graph(
        graph, artifact_uri)
    if not artifact:
        return 'no artifact found in graph', 400

    data_artifact = {
        'label': artifact.label,
        'account': artifact.account,
        'filename': artifact.filename,
        'location': artifact.location,
        'size': artifact.size,
        'used_by': artifact.used_by,
        'template_artifact': artifact.template_artifact
    }

    return render_template(
        '/published_execution_artifact.html',
        artifact=data_artifact,)


@app.route('/published/execution-process/<label>/')
def published_execution_process(label):
    graph = get_graph()
    process_uri = list(graph.query('''
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix opmw: <http://www.opmw.org/ontology/>

        SELECT ?s
        WHERE {
          ?s a opmw:WorkflowExecutionProcess .
          ?s rdfs:label "%s"
        }''' % label))
    if not process_uri:
        return 'no process found', 400

    process_uri = process_uri[0][0]
    process = opmw.WorkflowExecutionProcess.parse_from_graph(
        graph, process_uri)
    if not process:
        return 'no process found in graph', 400

    process = {
        'label': process.label,
        'account': process.account,
        'controller': process.controller,
        'component': process.component,
        'generates': process.generates,
        'used': process.used,
        'template_process': process.template_process
    }

    return render_template(
        '/published_execution_process.html',
        process=process,)


@app.route('/published/<item>/')
def published_list(item):
    if item == 'template':
        return render_template('/published_list_template.html')
    elif item == 'data-variable':
        return render_template('/published_list_data_variable.html')
    elif item == 'parameter':
        return render_template('/published_list_parameter.html')
    elif item == 'step':
        return render_template('/published_list_step.html')
    elif item == 'execution-account':
        return render_template('/published_list_execution_account.html')
    elif item == 'execution-artifact':
        return render_template('/published_list_execution_artifact.html')
    elif item == 'execution-process':
        return render_template('/published_list_execution_process.html')

    return 'item not supported', 400


@app.route('/search/template/')
def search():
    graph = get_graph()
    contributors = [
        c[0] for c in
        graph.query('''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX opmw: <http://www.opmw.org/ontology/>
            PREFIX opmo: <http://openprovenance.org/model/opmo#>
            SELECT ?z
            WHERE {
              ?x a opmw:WorkflowTemplate .
              ?x <http://purl.org/dc/terms/contributor> ?z
            }''')]
    parameters = [
        p[0] for p in
        graph.query('''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX opmw: <http://www.opmw.org/ontology/>
            PREFIX opmo: <http://openprovenance.org/model/opmo#>
            SELECT ?z
            WHERE {
              ?x a opmw:WorkflowTemplate .
              ?z opmw:isParameterOfTemplate ?x
            }''')]
    data_variables = [
        d[0] for d in
        graph.query('''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX opmw: <http://www.opmw.org/ontology/>
            PREFIX opmo: <http://openprovenance.org/model/opmo#>
            SELECT ?z
            WHERE {
              ?x a opmw:WorkflowTemplate .
              ?z opmw:isVariableOfTemplate ?x
            }''')]
    steps = [
        s[0] for s in
        graph.query('''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX opmw: <http://www.opmw.org/ontology/>
            PREFIX opmo: <http://openprovenance.org/model/opmo#>
            SELECT ?z
            WHERE {
              ?x a opmw:WorkflowTemplate .
              ?z opmw:isStepOfTemplate ?x
            }''')]
    accounts = [
        a[0] for a in
        graph.query('''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX opmw: <http://www.opmw.org/ontology/>
            PREFIX opmo: <http://openprovenance.org/model/opmo#>
            SELECT ?z
            WHERE {
              ?x a opmw:WorkflowTemplate .
              ?z opmw:correspondsToTemplate ?x
            }''')]
    return render_template(
        '/search_template.html',
        contributors=contributors, parameters=parameters,
        data_variables=data_variables, steps=steps, accounts=accounts)

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
