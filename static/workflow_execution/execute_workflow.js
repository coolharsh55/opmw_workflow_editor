/*
    index.js
    globals and document events

    uses:
     - jQuery

    @author: Harshvardhan Pandit
    @email : me@harshp.com
 */

// opmw_elements holds the OPMW ontology in JSON format
// is loaded from local file - opmw.json
var OPMW = null;
// experiment data holds the experiment data produced in the workflow editor
// is a dictionary by types
var execution_data = {};
// `experiment data labels` holds references to the various elements
// instantiated which can be accessed using their labels
// It also holds references in the tree and in the diagram
var execution_data_labels = {};
var execution_diagram = {};
var execution_account = null;
// link template objects with execution objects
var linked_template_objects = {};

var _make_empty_object = function(opmw_execution_key) {
    var opmw_execution_item = OPMW.execution[opmw_execution_key];
    var object = {};
    Object.keys(opmw_execution_item.properties).forEach(function(property, index) {
        if (property.dimension > 1) {
            object[property] = [];
        } else {
            object[property] = null;
        }
    });
    object.links = {};
    Object.keys(opmw_execution_item.relations).forEach(function(relation, index) {
        if (typeof(relation.domain) === 'string') {
            object.links[relation] = null;
        } else {
            object.links[relation] = [];
        }
    });
    return object;
};

/*
    on document ready
     - add on click event handlers
 */
$('document').ready(function() {
    /*
        load the OPMW json from file
        add element types to experiment data
        make form for experiment template
     */
    $.getJSON("/opmw.json", function(json) {
        OPMW = json;
        console.info("loaded opmw.json");
        // for debug purposes, ALWAYS log the OPMW to console
        console.debug("opmw.json", OPMW);

        // create execution objects for template
        // execution account
        var account = _make_empty_object("opmw:WorkflowExecutionAccount");
        account.type = "opmw:WorkflowExecutionAccount";
        account.schema = OPMW.execution[account.type];
        account["opmw:correspondsToTemplate"] = template.template.uri;
        account.template = template.template;
        linked_template_objects[template.template.uri] = account;
        execution_account = account;
        console.log("account", account);
        // execution_data.account = account;

        // data vars
        var data_variables = [];
        for (var i=0; i<template.data_variables.length; i++) {
            var data_var = _make_empty_object("opmw:WorkflowExecutionArtifact");
            data_var.type = "opmw:WorkflowExecutionArtifact";
            data_var.schema = OPMW.execution[data_var.type];
            data_var["opmw:account"] = account;
            account.links["opmw:account"].push(data_var);
            data_var["opmw:correspondsToTemplateArtifact"] = template.data_variables[i].uri;
            data_var.template = template.data_variables[i];
            linked_template_objects[template.data_variables[i].uri] = data_var;
            data_variables.push(data_var);
            data_var.diagram_properties = { text: data_var.template.label };
            if (data_var.template.generated_by == null || data_var.template.generated_by === "None") {
                data_var.diagram_properties.diagram = diag_add_data_var(data_var.diagram_properties);
                execution_diagram[data_var.diagram_properties.diagram] = data_var;
                console.log("data var diagram", data_var);
            } else {
                console.log("data var is not generated", data_var);
            }
        };
        console.log("data variables", data_variables);

        // parameters
        var parameters = [];
        for (var i=0; i<template.parameters.length; i++) {
            var parameter = _make_empty_object("opmw:WorkflowExecutionArtifact");
            parameter.type = "opmw:WorkflowExecutionArtifact";
            parameter.schema = OPMW.execution[parameter.type];
            parameter["opmw:account"] = account;
            account.links["opmw:account"].push(parameter);
            parameter["opmw:correspondsToTemplateArtifact"] = template.parameters[i].uri;
            parameter.template = template.parameters[i];
            linked_template_objects[template.parameters[i].uri] = parameter;
            parameters.push(parameter);
            parameter.diagram_properties = { text: parameter.template.label };
            parameter.diagram_properties.diagram = diag_add_param_var(parameter.diagram_properties);
            execution_diagram[parameter.diagram_properties.diagram] = parameter;
        };
        console.log("parameters", parameters);

        // steps
        var steps = [];
        for (var i=0; i<template.steps.length; i++) {
            var step = _make_empty_object("opmw:WorkflowExecutionProcess");
            step.type = "opmw:WorkflowExecutionProcess";
            step.schema = OPMW.execution[step.type];
            step["opmw:account"] = account;
            account.links["opmw:account"].push(step);
            step["opmw:correspondsToTemplateProcess"] = template.steps[i].uri;
            step.template = template.steps[i];
            linked_template_objects[template.steps[i].uri] = step;
            steps.push(step);
            step.links = {
                "opmw:wasGeneratedBy": []
            };
            step.diagram_properties = { text: step.template.label, uses: [] };
            step.diagram_properties.diagram = diag_add_step(step.diagram_properties);
            execution_diagram[step.diagram_properties.diagram] = step;
        };
        console.log("steps", steps);

        // link objects together
        // link data parameters to steps
        data_variables.forEach(function(data_var, index) {
            var generated_by = data_var.template.generated_by;
            if (!(generated_by === "None" || generated_by == null)) {
                data_var["opmw:wasGeneratedBy"] = linked_template_objects[generated_by];
                linked_template_objects[generated_by].links["opmw:wasGeneratedBy"].push(data_var);
                data_var.diagram_properties.source = data_var["opmw:wasGeneratedBy"].diagram_properties.diagram;
                data_var.diagram_properties.diagram = diag_add_data_op_var(data_var.diagram_properties);
                execution_diagram[data_var.diagram_properties.diagram] = data_var;
            }
        });
        // link artifacts used within steps
        steps.forEach(function(step, index) {
            step["opmw:used"] = [];
            step.template.uses.forEach(function(artifact, index) {
                step["opmw:used"].push(linked_template_objects[artifact]);
                linked_template_objects[artifact].links["opmw:used"].push(step);
                step.diagram_properties.uses.push(linked_template_objects[artifact].diagram_properties.diagram);
            });
            step.diagram_properties.diagram = diag_add_step(step.diagram_properties);
            execution_diagram[step.diagram_properties.diagram] = step;
        });

        $('#btn-template').click(function() {
            form_make(
                type=execution_account.type,
                schema=execution_account.schema,
                execution_account);
        });

        // render the form for the execution run
        form_make(
            type=account.type,
            schema=account.schema,
            object=account);
    });

});

$('#btn-form-save').click(function() {
    form_save();
});
$('#btn-form-cancel').click(function() {
    form_cancel();
});


// input file event
// snippet copied from
// https://stackoverflow.com/questions/4950567/reading-client-side-text-file-using-javascript
document.getElementById('btn-import').addEventListener('change', readFile, false);
function readFile (evt) {
   var files = evt.target.files;
   var file = files[0];
   var reader = new FileReader();
   reader.onload = function() {
     // console.debug("imported file", this.result);
     serialize_import(this.result);
   }
   reader.readAsText(file)
}

console.info('loaded execute_workflow.js');