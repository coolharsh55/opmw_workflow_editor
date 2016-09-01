# create workflow execution from template
#
# author: Harshvardhan Pandit
# email: me@harshp.com
#
# Workflow Execution instance for a Template
#
# will generate a JSON representation of execution process
# to be filled and associated with the execution workflow template


from graph import GraphWrapper
from graph import opmw


def _get_template_items(template, graph):

    query = '''
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?item ?type ?label
        WHERE {
            ?exp rdfs:label "experiment_A" .
            ?exp a  <http://www.opmw.org/ontology/WorkflowTemplate> .
            ?item ?x ?exp .
            ?item rdfs:label ?label
        }'''
    items = list(graph.query(query=query))
    return items


def _make_execution_for_template(template):

    execution = None
    return execution


def _make_execution_artifact_for_parameter(parameter):

    artifact = None
    return artifact


def _make_execution_artifact_for_data_variable(datavar):

    artifact = None
    return artifact


def _make_execution_process(step):

    process = None
    return process


def _make_execution_from_template(template, graph):

        template_items = _get_template_items(template, graph)
        item_handler = {
            'isParameterOfTemplate': _make_execution_artifact_for_parameter,
            'isVariableOfTemplate': _make_execution_artifact_for_data_variable,
            'isStepOfTemplate': _make_execution_process
        }
        for item_uri, item_type, item_label in template_items:
            if opmw not in item_type:
                continue
            item_type = item_type.split(opmw)[1]


            handler = item_handler.get(item['type'])
            handler(item)

        execution = None
        return execution


def make_execution_from_template(template):

    with GraphWrapper() as graph:
        return _make_execution_from_template(template, graph)
