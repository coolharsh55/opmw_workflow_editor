// data holder for workflow execution

var base_template = null;

var template = {
    _id: null,
    _type: 'WorkflowTemplate',
    _status: {
        diagram: null,
        validated: false
    },
    properties: {
        "rdfs:label": null,
        "dcterms:contributors": [],
        "opmw:versionNumber": null,
        "extra": []
    },
};

var template_data_variable = {
    _id: null,
    _type: 'DataVariable',
    _status: {
        diagram: null,
        validated: false
    },
    properties: {
        "rdfs:label": null,
        "opmw:wasGeneratedBy": null,
        "extra": []
    },
    "opmw:uses": [
    ]
};

var template_parameter_variable = {
    _id: null,
    _type: 'ParameterVariable',
    _status: {
        diagram: null,
        validated: false
    },
    properties: {
        "rdfs:label": null,
        "extra": []
    },
    "opmw:uses": [
    ]
};

var template_step = {
    _id: null,
    _type: 'WorkflowTemplateProcess',
    _status: {
        diagram: null,
        validated: false
    },
    properties: {
        "rdfs:label": null,
        "opmw:uses": [],
        "extra": []
    },
    "opmw:wasGeneratedBy": []
};

var experiment_data_by_id = {};
var experiment_data_by_diagram = {};
var experiment_data_by_label = {};
var experiment_data_by_type = {
    'template': null,
    'data_variable': {},
    'parameter_variable': {},
    'step': {}
};