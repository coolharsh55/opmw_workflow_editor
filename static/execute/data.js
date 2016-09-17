// data holder for workflow execution

var execution_account = {
    _id: null,
    _type: 'ExecutionAccount',
    _status: {
        diagram: null,
        validated: false
    },
    properties: {
        "rdfs:label": null,
        "opmw:correspondsToTemplate": null,
        "opmw:hasStatus": null,
        "opmw:overallStartTime": null,
        "opmw:overallEndTime": null,
        "extra": []
    },
    "opmw:account": []
};

var template_execution_artifact = {
    _id: null,
    _type: 'ExecutionArtifact',
    _status: {
        diagram: null,
        validated: false
    },
    properties: {
        "rdfs:label": null,
        "opmw:correspondsToTemplateArtifact": null,
        "opmw:hasFileName": null,
        "opmw:hasValue": null,
        "opmw:hasLocation": null,
        "opmw:hasSize": null,
        "opmw:wasGeneratedBy": null,
        "extra": []
    },
    "opmw:used": [
    ]
};

var template_execution_process = {
    _id: null,
    _type: 'ExecutionProcess',
    _status: {
        diagram: null,
        validated: false
    },
    properties: {
        "rdfs:label": null,
        "opmw:correspondsToTemplateProcess": null,
        "opmw:hasExecutableComponents": [],
        "opmw:used": [],
        "extra": []
    },
    "opmw:wasGeneratedBy": []
};

var experiment_data_by_id = {};
var experiment_data_by_diagram = {};
var experiment_data_by_template_uri = {};
var experiment_data_by_type = {
    'account': null,
    'artifact': [],
    'process': []
};