import json
from random import choice
from string import ascii_lowercase


def _make_id():
    '''Returns a random 9 letter id prefixed with lowercase.'''
    return '_' + ''.join(choice(ascii_lowercase) for i in range(9))


def template(template):
    '''Serializes template into the import/export format used by the tool.
    Accepts a template object (libOPMW.WorkflowTemplate) as input.
    The serialized json is of the following format:
    template: {
        _id: string,
        _type: string,
        _status: {
            diagram: null,
            validated: true
        },
        properties: {
            rdfs:label: string,
            dcterms:contributors: [string],
            opmw:versionNumber: string,
            opmw:createdInWorkflowSystem: string,
            opmw:hasNativeSystemTemplate: null
        }
    }
    '''
    data = {
        '_id': _make_id(),
        '_type': 'WorkflowTemplate',
        '_status': {
            'diagram': None,
            'validated': True
        },
        'properties': {
            'rdfs:label': None,
            'dcterms:contributors': template.contributors,
            'opmw:versionNumber': template.version,
            'extra': [],
            'opmw:hasDocumentation': template.documentation,
            'opmw:createdInWorkflowSystem': template.workflow_system,
            'opmw:hasNativeSystemTemplate': template.native_system_template
        }
    }
    # DEBUG
    print(json.dumps(data))
    return data


def step(step):
    '''Serializes step/process with import/export format.
    Accepts a step object (libOPMW.WorkflowTemplateProcess) as input.
    The serialized json is of the following format:
    step: {
        _id: string,
        _type: WorkflowTemplateProcess,
        _status: {
            diagram: null,
            validated: true
        },
        properties: {
            rdfs:label: string,
            opmw:uses: [],
            extra: []
        },
        opmw:wasGeneratedBy: []
    }
    '''
    data = {
        '_id': _make_id(),
        '_type': 'WorkflowTemplateProcess',
        '_status': {
            'diagram': None,
            'validated': True
        },
        'properties': {
            'rdfs:label': step.label,
            'opmw:uses': step.uses,
            'extra': []
        },
        'opmw:wasGeneratedBy': step.generates
    }
    # DEBUG
    print(json.dumps(data))
    return data


def variable(variable):
    '''Serializes data variable into import/export format.
    Accepts a data variable object (libOPMW.DataVariable) as input.
    The serialized json is of the following format:
    variable: {
        _id: string,
        _type: DataVariable,
        _status: {
            diagram: null,
            validated: true
        },
        properties: {
            rdfs:label: string,
            opmw:wasGeneratedBy: null || _id of step,
            opmw:hasDimensionality: string,
            extra: []
        },
        opmw:uses: []
    }
    '''
    data = {
        '_id': _make_id(),
        '_type': 'DataVariable',
        '_status': {
            'diagram': None,
            'validated': True
        },
        'properties': {
            'rdfs:label': variable.label,
            'opmw:wasGeneratedBy': variable.generated_by,
            'opmw:hasDimensionality': variable.dimensionality
        },
        'opmw:uses': variable.used_by
    }
    # DEBUG
    print(json.dumps(data))
    return data


def parameter(parameter):
    '''Serializes parameter into import/export format.
    Accepts a parameter object (libOPMW.ParameterVariable) as input.
    The serialized json is of the following format:
    parameter: {
        _id: string,
        _type: Parameter,
        _status: {
            diagram: null,
            validated: true
        },
        properties: {
            rdfs:label: string,
            opmw:hasDimensionality: string,
            extra: []
        },
        opmw:uses: []
    }
    '''
    data = {
        '_id': _make_id(),
        '_type': 'Parameter',
        '_status': {
            'diagram': None,
            'validated': True
        },
        'properties': {
            'rdfs:label': parameter.label,
            'opmw:hasDimensionality': parameter.dimensionality
        },
        'opmw:uses': parameter.used_by
    }
    # DEBUG
    print(json.dumps(data))
    return data


def resolve_links(data):
    '''Resolves cross-links between OPMW components in supplied data object.
    The input data is a dictionary of attributes in import/export format.
    '''
    # redundant step to make consistency with next block of code
    # since the existing items contain uris, replace them with empty lists
    for item in data['data_variables'].values():
        item['opmw:uses'] = []
    for item in data['parameter_variables'].values():
        item['opmw:uses'] = []
    for item in data['steps'].values():
        item['opmw:wasGeneratedBy'] = []

    print(
        "json_serializer->resolve_links->data['steps']", data['steps'].keys())

    # resolve variable.properties.opmw:wasGeneratedBy
    # maps to a step
    # attach to step.opmw:wasGeneratedBy
    for item in data['data_variables'].values():
        # redundant step to make consistency with next block of code
        item['opmw:uses'] = []
        print("data variable", item)
        step_uri = item['properties']['opmw:wasGeneratedBy']
        if step_uri is None:
            continue
        step_label = step_uri.split('/')[-1]
        print("step", step_uri, step_label)
        step = data['steps'][step_label]
        step['opmw:wasGeneratedBy'].append(item['_id'])
        item['properties']['opmw:wasGeneratedBy'] = step['_id']

    # resolve step.properties.opmw:uses
    # maps to variables and parameters
    # attach to opmw:uses
    for item in data['steps'].values():
        if len(item['properties']['opmw:uses']) == 0:
            continue
        uses = []
        for var_uri in item['properties']['opmw:uses']:
            var_label = var_uri.split('/')[-1]
            if var_label in data['data_variables']:
                var_item = data['data_variables'][var_label]
            else:
                var_item = data['parameter_variables'][var_label]
            var_item['opmw:uses'].append(item['_id'])
            uses.append(var_item['_id'])
        item['properties']['opmw:uses'] = uses

    return data
