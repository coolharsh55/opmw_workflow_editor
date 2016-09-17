// create form elements for template

var form = $('#object-form');
var form_extra_properties = $('#object-form-extra-properties');

// form data
var form_data = undefined;
var form_schema = undefined;
var form_template = undefined;
var form_maker = undefined;
var form_saver = undefined;

var _prep_form = function() {
    form.empty();
    form_extra_properties.empty();
};

var _clear_form_messages = function() {
    form.find('.success .message').empty();
    form.find('.warning .message').empty();
}

// click handler for saving form
$('#btn-save-form').click(function() {
    form_saver();
});

// click handler for cancelling form
$('#btn-cancel-form').click(function() {
    // just call the form maker again
    form_maker(form_data);
});

var make_form_for_execution_account = function(account) {
    var div = null; var fields = null; var input = null;
    _prep_form();
    form_saver = save_form_for_execution_account;

    // rdfs:label
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Experiment Run Label' }));
    input = $('<input>', {
        type: 'text',
        id: 'execution-account-input-rdfs-label',
        name: 'rdfs-label',
        placeholder: 'enter label of experiment run'
    });
    if (execution_account.properties["rdfs:label"] !== undefined && execution_account.properties["rdfs:label"] !== null) {
        input.val(execution_account.properties["rdfs:label"]);
    }
    div.append(input);
    div.append('<p>The label of the experiment is used to assign a unique name to the experiment that will distinguish it from other similar experiments.</p>')
    form.append(div);

    // correspondsToTemplate
    div = $('<div>', { class: 'ui floating small info message' });
    div.append($('<div>', { class: 'ui header', text: 'Workflow Template'} ));
    div.append($('<div>', { class: 'label', text: form_data.properties["opmw:correspondsToTemplate"] }));
    form.append(div);

    // opmw:hasStatus
    fields = $('<div>', { class: 'grouped inline fields' });
    fields.append($('<label>', { text: 'Status' }));
    div = $('<div>', { class: 'field' });
    div.append($('<div>', { class: 'ui label', text: 'as checkbox'}));
    input = $('<input>', {
        type: 'checkbox',
        id: 'execution-account-input-opmw-hasStatus-checkbox',
        name: 'hasStatus-checkbox'
    });
    if (execution_account.properties["opmw:hasStatus"] !== undefined && execution_account.properties["opmw:hasStatus"] !== null && typeof(execution_account.properties["opmw:hasStatus"]) === "boolean") {
        input.prop('checked', execution_account.properties["opmw:hasStatus"]);
    }
    div.append(input);
    fields.append(div);
    div = $('<div>', { class: 'field' });
    div.append($('<div>', { class: 'ui label', text: 'as text'}));
    input = $('<input>', {
        type: 'text',
        id: 'execution-account-input-opmw-hasStatus-text',
        name: 'hasStatus-text',
        placeholder: 'enter status message'
    });
    if (execution_account.properties["opmw:hasStatus"] !== undefined && execution_account.properties["opmw:hasStatus"] !== null && typeof(execution_account.properties["opmw:hasStatus"]) === "string") {
        input.val(execution_account["opmw:hasStatus"]);
    }
    div.append(input);
    fields.append(div)
    fields.append('<p>Status reflects the operational status of the experiment run, and usually is referred to in the boolean sense - complete or incomplete. If there is text entered, the checkbox value will be ignored.</p>');
    form.append(fields);

    // opmw:overallStartTime
    fields = $('<div>', { class: 'grouped inline fields' });
    fields.append($('<label>', { text: 'Experiment timings' }));
    div = $('<div>', { class: 'field' });
    div.append($('<div>', { class: 'ui label', text: 'start time'}));
    input = $('<input>', {
        type: 'text',
        id: 'execution-account-input-opmw-overallStartTime',
        name: 'overallStartTime'
    });
    div.append(input);
    if (execution_account.properties["opmw:overallStartTime"] !== undefined && execution_account.properties["opmw:overallStartTime"] !== null) {
        input.val(execution_account.properties["opmw:overallStartTime"]);
    }
    fields.append(div);
    div = $('<div>', { class: 'field' });
    div.append($('<div>', { class: 'ui label', text: 'end time'}));
    input = $('<input>', {
        type: 'text',
        id: 'execution-account-input-opmw-overallEndTime',
        name: 'overallEndTime',
    });
    div.append(input);
    if (execution_account.properties["opmw:overallEndTime"] !== undefined && execution_account.properties["opmw:overallEndTime"] !== null) {
        input.val(execution_account.properties["opmw:overallEndTime"]);
    }
    fields.append(div)
    fields.append('<p>Timestamps for when the experiment begun and when it ended. The timestamps are for the overall experiment and not for any individual step or part of the experiment.</p>');
    form.append(fields);
    $('#execution-account-input-opmw-overallStartTime').datetimepicker();
    $('#execution-account-input-opmw-overallEndTime').datetimepicker();

    // extra properties
    if (execution_account.properties.extra.length > 0) {
        for(var i=0; i<execution_account.properties.extra.length; i++) {
            var uri = execution_account.properties.extra[i].uri;
            var value = execution_account.properties.extra[i].value;
            add_extra_property(uri, value);
        }
    }
};

var save_form_for_execution_account = function() {
    // form.find('.message').remove();
    _clear_form_messages();
    var error_messages = validate_form_for_execution_account();
    if (error_messages.length > 0) {
        // TODO: display message on form
        console.log(error_messages);
        var div = $('<div>', { class: 'ui warning message' });
        div.append($('<div>', { class: 'header', text: 'There were errors in the form' }));
        var list = $('<ui>', { class: 'list' });
        for (var i=0; i<error_messages.length; i++) {
            list.append($('<li>', { text: error_messages[i] }));
        }
        div.append(list);
        form.prepend(div);
        form.addClass('warning');
        return;
    }
    form.removeClass('warning');

    // save form
    var property = execution_account.properties;
    property["rdfs:label"] = $('#execution-account-input-rdfs-label').val();
    // save status as boolean or text
    if ($('#execution-account-input-opmw-hasStatus-text').val()) {
        property["opmw:hasStatus"] = $('#execution-account-input-opmw-hasStatus-text').val();
    } else {
        property["opmw:hasStatus"] = $('#execution-account-input-opmw-hasStatus-checkbox').prop('checked');
    }
    property["opmw:overallStartTime"] = $('#execution-account-input-opmw-overallStartTime').val();
    property["opmw:overallEndTime"] = $('#execution-account-input-opmw-overallEndTime').val();

    // additional properties
    property.extra = [];
    form_extra_properties.find('.field').each(function() {
        var uri = $(this).find('input[name="property-uri"]').eq(0).val();
        var value = $(this).find('input[name="property-value"]').eq(0).val();
        property.extra.push({ uri: uri, value: value });
    });

    form_data._status.validated = true;
    $('#sidebar-execution-account-label').removeClass('sidebar-item-label-flagged');
    $('#sidebar-execution-account-label').addClass('sidebar-item-label');
    $('#sidebar-execution-account-label').text(form_data.properties["rdfs:label"]);

    var div = $('<div>', { class: 'ui success message' });
    div.append($('<div>', { class: 'header', text: 'Account saved successfully' }));
    div.append('<p>Execution Account properties have been validated and saved.</p>');
    form.prepend(div);
    form.addClass('success');
};

var validate_form_for_execution_account = function() {
    var error_messages = [];
    if (!$('#execution-account-input-rdfs-label').val()) {
        error_messages.push('label is not set');
    }
    if (!$('#execution-account-input-opmw-overallStartTime').val()) {
        error_messages.push('starting time is not set');
    }
    if (!$('#execution-account-input-opmw-overallEndTime').val()) {
        error_messages.push('ending time is not set');
    }
    form_extra_properties.find('.field').each(function() {
        if (!$(this).find('input[name="property-uri"]').eq(0).val()) {
            error_messages.push('additional property uri is not set');
            return;
        }
        if (!$(this).find('input[name="property-value"]').eq(0).val()) {
            error_messages.push('additional property value is not set');
        }
    });
    return error_messages;
}

var make_form_for_execution_process = function(process) {
    var div = null; var fields = null; var input = null;
    _prep_form();
    form_saver = save_form_for_execution_process;

    // rdfs:label
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Experiment Run Label' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-rdfs-label' + form_data._id,
        name: 'rdfs-label',
        placeholder: 'enter label of experiment process'
    });
    if (form_data.properties["rdfs:label"] !== undefined && form_data.properties["rdfs:label"] !== null) {
        input.val(form_data.properties["rdfs:label"]);
    }
    div.append(input);
    div.append('<p>The label of the experiment is used to assign a unique name to the experiment that will distinguish it from other similar experiments.</p>')
    form.append(div);

    // correspondsToTemplateProcess
    div = $('<div>', { class: 'ui floating small info message' });
    div.append($('<div>', { class: 'ui header', text: 'Workflow Template Process'} ));
    div.append($('<div>', { class: 'label', text: form_data.properties["opmw:correspondsToTemplateProcess"] }));
    form.append(div);

    // opmw:used
    div = $('<div>', { class: 'ui floating small info message' });
    div.append($('<div>', { class: 'ui header', text: 'Artifacts used'} ));
    var ul = $('<ul>', { class: 'list' });
    for(var i=0; i<form_data.properties["opmw:used"].length; i++) {
        var artifact = form_data.properties["opmw:used"][i];
        if (artifact.properties["rdfs:label"] == undefined || artifact.properties["rdfs:label"] == null) {
            ul.append('<li>label not set for artifact linked to ' + artifact.properties["opmw:correspondsToTemplateArtifact"] + '</li>');
        } else {
            ul.append('<li>' + artifact.properties["rdfs:label"] + '</li>');
        }
        div.append(ul);
    }
    form.append(div);

    // opmw:wasGeneratedBy
    if (form_data["opmw:wasGeneratedBy"].length > 0) {
        div = $('<div>', { class: 'ui floating small info message' });
        div.append($('<div>', { class: 'ui header', text: 'Artifacts generated'} ));
        var ul = $('<ul>', { class: 'list' });
        for(var i=0; i<form_data["opmw:wasGeneratedBy"].length; i++) {
            var artifact = form_data["opmw:wasGeneratedBy"][i];
            if (artifact.properties["rdfs:label"] == undefined || artifact.properties["rdfs:label"] == null) {
                ul.append('<li>label not set for artifact linked to ' + artifact.properties["opmw:correspondsToTemplateArtifact"] + '</li>');
            } else {
                ul.append('<li>' + artifact.properties["rdfs:label"] + '</li>');
            }
            div.append(ul);
        }
        form.append(div);
    }

    // opmw:hasExecutable Component
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { class: 'label', text: 'Executable Components / Scripts' }));
    div.append('<p>Enter URI or location of components / scripts used to execute this process.</p>');
    div.append($('<div>', {
        id: 'btn-add-opmw-hasExecutableComponent' + form_data._id,
        text: 'add component',
        class: 'ui mini secondary button'
    }));
    form.append(div);
    var add_executable_component = function(component) {
        if (component == undefined) {
            component = null;
        }
        var div = $('<div>', { class: 'ui action input' });
        input = $('<input>', {
            type: 'text',
            name: 'executable-component' + form_data._id,
            placeholder: 'URI / location of component',
            val: component
        });
        div.append(input);
        div.append($('<div>', {
            class: 'ui mini red button btn-remove-component',
            text: 'X'
        }));
        return div;
    }
    for(var i=0; i<form_data.properties["opmw:hasExecutableComponents"].length; i++) {
        div.append(add_executable_component(form_data.properties["opmw:hasExecutableComponents"][i]));
    }
    $('body').on('click', '#btn-add-opmw-hasExecutableComponent' + form_data._id, function() {
        $(this).parent().append(add_executable_component());
    });

    // extra properties
    if (form_data.properties.extra.length > 0) {
        for(var i=0; i<form_data.properties.extra.length; i++) {
            var uri = form_data.properties.extra[i].uri;
            var value = form_data.properties.extra[i].value;
            add_extra_property(uri, value);
        }
    }
};

var save_form_for_execution_process = function() {
    // form.find('.message').remove();
    _clear_form_messages();
    var error_messages = validate_form_for_execution_process();
    if (error_messages.length > 0) {
        var div = $('<div>', { class: 'ui warning message' });
        div.append($('<div>', { class: 'header', text: 'There were errors in the form' }));
        var list = $('<ui>', { class: 'list' });
        for (var i=0; i<error_messages.length; i++) {
            list.append($('<li>', { text: error_messages[i] }));
        }
        div.append(list);
        form.prepend(div);
        form.addClass('warning');
        return;
    }
    form.removeClass('warning');

    // save form
    var property = form_data.properties;
    property["rdfs:label"] = property["rdfs:label"] = $('#input-rdfs-label' + form_data._id).val();
    form_data.properties["opmw:hasExecutableComponents"] = [];
    $.each($('#object-form input[name="executable-component' + form_data._id + '"]'), function() {
        form_data.properties["opmw:hasExecutableComponents"].push($(this).val());
    });

    // additional properties
    property.extra = [];
    form_extra_properties.find('.field').each(function() {
        var uri = $(this).find('input[name="property-uri"]').eq(0).val();
        var value = $(this).find('input[name="property-value"]').eq(0).val();
        property.extra.push({ uri: uri, value: value });
    });

    form_data._status.validated = true;
    $('#sidebar-step-label' + form_data._id).removeClass('sidebar-item-label-flagged');
    $('#sidebar-step-label' + form_data._id).addClass('sidebar-item-label');
    $('#sidebar-step-label' + form_data._id).text(form_data.properties["rdfs:label"]);

    var div = $('<div>', { class: 'ui success message' });
    div.append($('<div>', { class: 'header', text: 'Account saved successfully' }));
    div.append('<p>Execution Account properties have been validated and saved.</p>');
    form.prepend(div);
    form.addClass('success');
};

var validate_form_for_execution_process = function() {
    var error_messages = [];
    if (!$('#input-rdfs-label' + form_data._id).val()) {
        error_messages.push('label is not set');
    }
    $.each($('#object-form input[name="executable-component' + form_data._id + '"]'), function() {
        if(!$(this).val()) {
            error_messages.push('executable component value not set');
        }
    });
    form_extra_properties.find('.field').each(function() {
        if (!$(this).find('input[name="property-uri"]').eq(0).val()) {
            error_messages.push('additional property uri is not set');
            return;
        }
        if (!$(this).find('input[name="property-value"]').eq(0).val()) {
            error_messages.push('additional property value is not set');
        }
    });
    return error_messages;
}

var make_form_for_execution_artifact = function(parameter) {
    var div = null; var fields = null; var input = null;
    _prep_form();
    form_saver = save_form_for_execution_artifact;

    // rdfs:label
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Execution Artifact Label' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-rdfs-label' + form_data._id,
        name: 'rdfs-label',
        placeholder: 'enter label of experiment artifact'
    });
    if (form_data.properties["rdfs:label"] !== undefined && form_data.properties["rdfs:label"] !== null) {
        input.val(form_data.properties["rdfs:label"]);
    }
    div.append(input);
    div.append('<p>The label of the experiment is used to assign a unique name to the experiment that will distinguish it from other similar experiments.</p>')
    form.append(div);

    // correspondsToTemplate
    div = $('<div>', { class: 'ui floating small info message' });
    div.append($('<div>', { class: 'ui header', text: 'Workflow Template Artifact'} ));
    div.append($('<div>', { class: 'label', text: form_data.properties["opmw:correspondsToTemplateArtifact"] }));
    form.append(div);

    // opmw:wasGeneratedBy
    if (form_data.properties.hasOwnProperty("opmw:wasGeneratedBy") && form_data.properties["opmw:wasGeneratedBy"] !== null) {
        div = $('<div>', { class: 'ui message' });
        div.append($('<div>', { class: 'ui header', text: 'Artifact was generated by'} ));
        var step = form_data.properties["opmw:wasGeneratedBy"];
        if (step._status.validated === false) {
            step = '(label not set) Execution Process linked to ' + step.properties["opmw:correspondsToTemplateProcess"];
        } else {
            step = step.properties["rdfs:label"];
        }
        div.append($('<div>', { class: 'label', text: step }));
        form.append(div);
    }

    // opmw:hasFileName
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Artifact File Name' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-opmw-hasFileName' + form_data._id,
        name: 'opmw-hasFileName',
        placeholder: 'enter file name of artifact'
    });
    if (form_data.properties["opmw:hasFileName"] !== undefined && form_data.properties["opmw:hasFileName"] !== null) {
        input.val(form_data.properties["opmw:hasFileName"]);
    }
    div.append(input);
    div.append('<p>The label of the experiment is used to assign a unique name to the experiment that will distinguish it from other similar experiments.</p>')
    form.append(div);

    // opmw:hasValue
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Execution Artifact Value' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-opmw-hasValue' + form_data._id,
        name: 'opmw-hasValue',
        placeholder: 'enter value of experiment artifact'
    });
    if (form_data.properties["opmw:hasValue"] !== undefined && form_data.properties["opmw:hasValue"] !== null) {
        input.val(form_data.properties["opmw:hasValue"]);
    }
    div.append(input);
    div.append('<p>The label of the experiment is used to assign a unique name to the experiment that will distinguish it from other similar experiments.</p>')
    form.append(div);

    // opmw:hasLocation
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Execution Artifact File Location' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-opmw-hasLocation' + form_data._id,
        name: 'opmw-hasLocation',
        placeholder: 'enter URI of location'
    });
    if (form_data.properties["opmw:hasLocation"] !== undefined && form_data.properties["opmw:hasLocation"] !== null) {
        input.val(form_data.properties["opmw:hasLocation"]);
    }
    div.append(input);
    div.append('<p>The label of the experiment is used to assign a unique name to the experiment that will distinguish it from other similar experiments.</p>')
    form.append(div);

    // opmw:hasSize
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Execution Artifact Size' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-opmw-hasSize' + form_data._id,
        name: 'opmw-hasSize',
        placeholder: 'enter label of experiment artifact'
    });
    if (form_data.properties["opmw:hasSize"] !== undefined && form_data.properties["opmw:hasSize"] !== null) {
        input.val(form_data.properties["opmw:hasSize"]);
    }
    div.append(input);
    div.append('<p>The label of the experiment is used to assign a unique name to the experiment that will distinguish it from other similar experiments.</p>')
    form.append(div);
};

var save_form_for_execution_artifact = function() {
    // form.find('.message').remove();
    _clear_form_messages();
    var error_messages = validate_form_for_execution_artifact();
    if (error_messages.length > 0) {
        // TODO: display message on form
        var div = $('<div>', { class: 'ui warning message' });
        div.append($('<div>', { class: 'header', text: 'There were errors in the form' }));
        var list = $('<ui>', { class: 'list' });
        for (var i=0; i<error_messages.length; i++) {
            list.append($('<li>', { text: error_messages[i] }));
        }
        div.append(list);
        form.prepend(div);
        form.addClass('warning');
        return;
    }
    form.removeClass('warning');

    // save form
    var property = form_data.properties;
    property["rdfs:label"] = $('#input-rdfs-label' + form_data._id).val();
    property["opmw:hasFileName"] = $('#input-opmw-hasFileName' + form_data._id).val();
    property["opmw:hasValue"] = $('#input-opmw-hasValue' + form_data._id).val();
    property["opmw:hasLocation"] = $('#input-opmw-hasLocation' + form_data._id).val();
    property["opmw:hasSize"] = $('#input-opmw-hasSize' + form_data._id).val();

    // additional properties
    property.extra = [];
    form_extra_properties.find('.field').each(function() {
        var uri = $(this).find('input[name="property-uri"]').eq(0).val();
        var value = $(this).find('input[name="property-value"]').eq(0).val();
        property.extra.push({ uri: uri, value: value });
    });

    form_data._status.validated = true;
    $('#sidebar-artifact-label' + form_data._id).removeClass('sidebar-item-label-flagged');
    $('#sidebar-artifact-label' + form_data._id).addClass('sidebar-item-label');
    $('#sidebar-artifact-label' + form_data._id).text(form_data.properties["rdfs:label"]);

    var div = $('<div>', { class: 'ui success message' });
        div.append($('<div>', { class: 'header', text: 'Account saved successfully' }));
        div.append('<p>Execution Account properties have been validated and saved.</p>');
        form.prepend(div);
        form.addClass('success');
};

var validate_form_for_execution_artifact = function() {
    var error_messages = [];
    if (!$('#input-rdfs-label' + form_data._id).val()) {
        error_messages.push('label is not set');
    }
    if (!$('#input-opmw-hasFileName' + form_data._id).val()) {
        error_messages.push('filename is not set');
    }
    if (!$('#input-opmw-hasValue' + form_data._id).val()) {
        error_messages.push('value is not set');
    }
    if (!$('#input-opmw-hasLocation' + form_data._id).val()) {
        error_messages.push('location is not set');
    }
    if (!$('#input-opmw-hasSize' + form_data._id).val()) {
        error_messages.push('size is not set');
    }
    return error_messages;
};



// click handler for button adding extra property
var add_extra_property = function(uri, value) {
    var field = $('<div>', { class: 'field' });
    field.append($('<div>', {
        class: 'ui right floated red mini button btn-remove-extra-property',
        text: 'X'
    }));
    field.append($('<div>', {
        class: 'ui label',
        text: 'URI / type' }));
    var input = $('<input>', {
        type: 'text',
        name: 'property-uri',
        placeholder: 'enter URI of property'
    });
    if (uri !== undefined && uri !== null) {
        input.val(uri);
    }
    field.append(input);
    field.append($('<div>', {
        class: 'ui label',
        text: 'URI / value' }));
    input = $('<input>', {
        type: 'text',
        name: 'property-value',
        placeholder: 'enter value of property'
    });
    if (value !== undefined && value !== null) {
        input.val(value);
    }
    field.append(input);
    field.append('<br/><br/>');
    form_extra_properties.append(field);
    $('#col-form').animate({
        scrollTop: field.offset().top
    }, 200);
};

$('#btn-add-extra-property').click(function() {
    add_extra_property();
});

// click handler for button removing extra property
$('body').on('click', '.btn-remove-extra-property', function() {
    $(this).parent().remove();
});
$('body').on('click', '.btn-remove-component', function() {
    $(this).parent().remove();
});