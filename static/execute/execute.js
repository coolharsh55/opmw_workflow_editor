// functions for workflow execution

// on-click event handlers for object labels in sidebar
$('.sidebar-item-label').click(function() {
    $('.sidebar-item-label').removeClass('sidebar-item-selected');
    $(this).addClass('sidebar-item-selected');
});

$('#sidebar-execution-account-label').click(function() {
    make_form_for_execution_account(execution_account);
});

// on document load
$('document').ready(function() {
    // set up experiment objects based on template (sent via flask)
    // execution account
    execution_account.properties["opmw:correspondsToTemplate"] = template["opmw:WorkflowTemplate"].uri;
    execution_account._id = generate_id();
    experiment_data_by_id[execution_account._id] = execution_account;
    experiment_data_by_template_uri[execution_account.properties["opmw:correspondsToTemplate"]] = execution_account;
    experiment_data_by_type.account = execution_account;
    $('#sidebar-execution-account-template-uri').text(execution_account.properties["opmw:correspondsToTemplate"]);

    // parameter variables
    objects = template["opmw:ParameterVariable"];
    for(var i=0; i<objects.length; i++) {
        var template_object = objects[i];
        var object = _.cloneDeep(template_execution_artifact);
        object._id = generate_id();
        experiment_data_by_id[object._id] = object;
        experiment_data_by_template_uri[template_object.uri] = object;
        object.properties["opmw:correspondsToTemplateArtifact"] = template_object.uri;
        experiment_data_by_type.artifact.push(object);
        execution_account["opmw:account"].push(object);
        delete object.properties["opmw:wasGeneratedBy"];
        // add object to sidebar
        var li = $('<li>', {
            id: 'sidebar-artifact-label' + object._id,
            class: 'sidebar-artifact-label sidebar-item-label-flagged',
            text: 'label not set'
        });
        li.append($('<span>', {
            id: 'sidebar-artifact-template-uri' + object._id,
            class: 'sidebar-template-uri',
            text: object.properties["opmw:correspondsToTemplateArtifact"]
        }));
        $('#item-list-param').append(li);
    };

    // data variables
    objects = template["opmw:DataVariable"];
    for(var i=0; i<objects.length; i++) {
        var template_object = objects[i];
        var object = _.cloneDeep(template_execution_artifact);
        object._id = generate_id();
        experiment_data_by_id[object._id] = object;
        experiment_data_by_template_uri[template_object.uri] = object;
        object.properties["opmw:correspondsToTemplateArtifact"] = template_object.uri;
        if (template_object.generated_by !== undefined && template_object.generated_by !== null && template_object.generated_by !== 'None') {
            object.properties["opmw:wasGeneratedBy"] = template_object.generated_by;
        } else {
            object.properties["opmw:wasGeneratedBy"] = null;
        }
        experiment_data_by_type.artifact.push(object);
        execution_account["opmw:account"].push(object);
        // add object to sidebar
        var li = $('<li>', {
            id: 'sidebar-artifact-label' + object._id,
            class: 'sidebar-artifact-label sidebar-item-label-flagged',
            text: 'label not set'
        });
        li.append($('<span>', {
            id: 'sidebar-artifact-template-uri' + object._id,
            class: 'sidebar-template-uri',
            text: object.properties["opmw:correspondsToTemplateArtifact"]
        }));
        $('#item-list-data').append(li);
    };

    // steps
    objects = template["opmw:WorkflowTemplateProcess"];
    for(var i=0; i<objects.length; i++) {
        var template_object = objects[i];
        var object = _.cloneDeep(template_execution_process);
        object._id = generate_id();
        experiment_data_by_id[object._id] = object;
        experiment_data_by_template_uri[template_object.uri] = object;
        object.properties["opmw:correspondsToTemplateProcess"] = template_object.uri;
        experiment_data_by_type.process.push(object);
        for(var artifact of template_object.uses) {
            artifact = experiment_data_by_template_uri[artifact];
            object.properties["opmw:used"].push(artifact);
            artifact["opmw:used"].push(object);
        }
        execution_account["opmw:account"].push(object);
        // add object to sidebar
        var li = $('<li>', {
            id: 'sidebar-step-label' + object._id,
            class: 'sidebar-step-label sidebar-item-label-flagged',
            text: 'label not set'
        });
        li.append($('<span>', {
            id: 'sidebar-step-template-uri' + object._id,
            class: 'sidebar-template-uri',
            text: object.properties["opmw:correspondsToTemplateProcess"]
        }));
        $('#item-list-step').append(li);
    };

    // link artifacts to steps
    for (var i=0; i<experiment_data_by_type.artifact.length; i++) {
        artifact = experiment_data_by_type.artifact[i];
        if (artifact.properties.hasOwnProperty("opmw:wasGeneratedBy") && artifact.properties["opmw:wasGeneratedBy"] !== null) {
            artifact.properties["opmw:wasGeneratedBy"] = experiment_data_by_template_uri[artifact.properties["opmw:wasGeneratedBy"]];
        }
    }

    // assign form object for experiment account
    form_data = execution_account;
    form_schema = execution_account;
    form_template = template["opmw:WorkflowTemplate"];

    form_maker = make_form_for_execution_account;
    make_form_for_execution_account(execution_account);
});

$('#sidebar-execution-account-label').click(function() {
    form_data = execution_account;
    form_schema = execution_account;
    form_template = template["opmw:WorkflowTemplate"];
    form_maker = make_form_for_execution_account;
    make_form_for_execution_account(execution_account);
});
$('body').on('click', '.sidebar-artifact-label', function() {
    var _id = '_' + $(this).attr('id').split('_')[1];
    form_data = experiment_data_by_id[_id];
    form_schema = template_execution_artifact;
    form_template = template["opmw:DataVariable"];
    form_maker = make_form_for_execution_artifact;
    form_maker(form_data);
});
$('body').on('click', '.sidebar-step-label', function() {
    var _id = '_' + $(this).attr('id').split('_')[1];
    form_data = experiment_data_by_id[_id];
    form_schema = template_execution_artifact;
    form_template = template["opmw:WorfklowTemplateProcess"];
    form_maker = make_form_for_execution_process;
    form_maker(form_data);
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