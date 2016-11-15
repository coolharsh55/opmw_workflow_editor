// functions for workflow execution

// on-click event handlers for object labels in sidebar
$('.sidebar-item-label').click(function() {
    $('.sidebar-item-label').removeClass('sidebar-item-selected');
    $(this).addClass('sidebar-item-selected');
});

$('#sidebar-template-label').click(function() {
    form_data = template;
    form_schema = template;
    form_maker = make_form_for_template;
    form_maker();
});

// on document load
$('document').ready(function() {
    // set up experiment objects based on template (sent via flask)
    // execution account
    template._id = generate_id();

    // assign form object for experiment account
    form_data = template;
    form_schema = template;
    // form_template = template["opmw:WorkflowTemplate"];

    form_maker = make_form_for_template;
    form_maker(template);
});

var make_diagram_data = function() {
    var data = {};
    _.each(experiment_data_by_type.data_variable, function(data_var) {
        var data_for_data_var = {};
        data_for_data_var.id = data_var.properties["rdfs:label"];
        data_for_data_var.label = data_var.properties["rdfs:label"];
        data_for_data_var.outgoing = [];
        _.each(data_var["opmw:used"], function(link) {
           data_for_data_var.outgoing.push(link.properties["rdfs:label"]);
        });
        data_for_data_var.type = 'data_variable';
        data_for_data_var.incoming = [];
        if (data_var.properties["opmw:wasGeneratedBy"] != null) {
            data_for_data_var.incoming = [data_var.properties["opmw:wasGeneratedBy"].properties["rdfs:label"]];
            data_for_data_var.var_type = 'data_output';
        } else {
            data_for_data_var.var_type = 'data';
        }
        data_for_data_var.outgoing = [];
        _.each(data_var["opmw:uses"], function(step) {
            data_for_data_var.outgoing.push(step.properties["rdfs:label"]);
        });
        data[data_for_data_var.id] = data_for_data_var;
    });
    _.each(experiment_data_by_type.parameter_variable, function(parameter) {
        var parameter_data = {};
        parameter_data.id = parameter.properties["rdfs:label"];
        parameter_data.label = parameter.properties["rdfs:label"];
        parameter_data.outgoing = [];
        _.each(parameter["opmw:used"], function(link) {
           parameter_data.outgoing.push(link.properties["rdfs:label"]);
        });
        parameter_data.type = 'parameter';
        parameter_data.incoming = [];
        parameter_data.outgoing = [];
        _.each(parameter["opmw:uses"], function(step) {
            parameter_data.outgoing.push(step.properties["rdfs:label"]);
        });
        data[parameter_data.id] = parameter_data;
    });
    _.each(experiment_data_by_type.step, function(step) {
        var step_data = { type: "step" };
        step_data.id = step.properties["rdfs:label"];
        step_data.label = step.properties["rdfs:label"];
        step_data.outgoing = [];
        _.each(step["opmw:wasGeneratedBy"], function(variable) {
            step_data.outgoing.push(variable.properties["rdfs:label"]);
        });
        step_data.incoming = [];
        _.each(step.properties["opmw:uses"], function(variable) {
            step_data.incoming.push(variable.properties["rdfs:label"]);
        });
        data[step_data.id] = step_data;
    });
    console.log("diagram data", data);
    return data;
}

$('body').on('click', '.sidebar-data-label', function() {
    var _id = '_' + $(this).attr('id').split('_')[1];
    form_data = experiment_data_by_id[_id];
    form_schema = template_data_variable;
    form_maker = make_form_for_data_variable;
    form_maker();
});
$('body').on('click', '.sidebar-parameter-label', function() {
    var _id = '_' + $(this).attr('id').split('_')[1];
    form_data = experiment_data_by_id[_id];
    form_schema = template_parameter_variable;
    form_maker = make_form_for_parameter_variable;
    form_maker();
});
$('body').on('click', '.sidebar-step-label', function() {
    var _id = '_' + $(this).attr('id').split('_')[1];
    form_data = experiment_data_by_id[_id];
    form_schema = template_step;
    form_maker = make_form_for_step;
    form_maker();
});
$('#btn-add-data-var').on('click', function() {
    if (experiment_data_by_type.template == undefined || experiment_data_by_type.template == null) {
        console.log("returned due to missing template");
        return;
    }
    var data_var = _.cloneDeep(template_data_variable);
    data_var._id = generate_id();
    form_data = data_var;
    form_schema = template_data_variable;
    form_maker = make_form_for_data_variable;
    form_maker();
});
$('#btn-add-param-var').on('click', function() {
    if (experiment_data_by_type.template == undefined || experiment_data_by_type.template == null) {
        console.log("returned due to missing template");
        return;
    }
    var param_var = _.cloneDeep(template_parameter_variable);
    param_var._id = generate_id();
    form_data = param_var;
    form_schema = template_parameter_variable;
    form_maker = make_form_for_parameter_variable;
    form_maker();
});
$('#btn-add-step').on('click', function() {
    if (experiment_data_by_type.template == undefined || experiment_data_by_type.template == null) {
        console.log("returned due to missing template");
        return;
    }
    var step = _.cloneDeep(template_step);
    step._id = generate_id();
    form_data = step;
    form_schema = template_step;
    form_maker = make_form_for_step;
    form_maker();
});

document.getElementById('input-import').addEventListener('change', readFile, false);
function readFile (evt) {
   var files = evt.target.files;
   var file = files[0];
   var reader = new FileReader();
   reader.onload = function() {
     serializer.import_data(JSON.parse(this.result));
   }
   reader.readAsText(file)
}

$('#btn-publish').click(function() {
    serializer.publish_data();
});