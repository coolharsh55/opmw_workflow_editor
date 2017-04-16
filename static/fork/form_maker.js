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
    form.find('.success.message').empty();
    form.find('.warning.message').empty();
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

// template
var make_form_for_template = function() {
    var div = null; var fields = null; var input = null;
    _prep_form();
    form_saver = save_form_for_template;

    // rdfs:label
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Template Label' }));
    input = $('<input>', {
        type: 'text',
        id: 'template-input-rdfs-label',
        name: 'rdfs-label',
        placeholder: 'enter label of template'
    });
    if (template.properties["rdfs:label"] !== undefined && template.properties["rdfs:label"] !== null) {
        input.val(template.properties["rdfs:label"]);
    }
    div.append(input);
    div.append('<p>The label of the experiment is used to assign a unique name to the template that will distinguish it from other similar experiments.</p>')
    form.append(div);

    // base template
    div = $('<div>', { class: 'ui floating small info message' });
    div.append($('<div>', { class: 'ui header', text: 'Base Template'} ));
    input = $('<a>', { href: 'http://lvh.me:5000/published/template/' + base_template_label, text: base_template, target: '_blank' });
    div.append(input);
    form.append(div);


    // dcterms:contributor
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { class: 'label', text: 'Contributors' }));
    div.append('<p>Enter URI or location of contributors that author this template.</p>');
    div.append($('<div>', {
        id: 'btn-add-dcterms-contributors' + form_data._id,
        text: 'add contributor',
        class: 'ui mini secondary button'
    }));
    form.append(div);
    var add_dcterms_contributor = function(component) {
        if (component == undefined) {
            component = null;
        }
        var div = $('<div>', { class: 'ui action input' });
        input = $('<input>', {
            type: 'text',
            name: 'dcterms-contributor' + form_data._id,
            placeholder: 'URI / location of contributor',
            val: component
        });
        div.append(input);
        div.append($('<div>', {
            class: 'ui mini red button btn-remove-component',
            text: 'X'
        }));
        return div;
    }
    if (form_data.properties["dcterms:contributors"].length == 0) {
        div.append(add_dcterms_contributor(null));
    } else {
        for(var i=0; i<form_data.properties["dcterms:contributors"].length; i++) {
            div.append(add_dcterms_contributor(form_data.properties["dcterms:contributors"][i]));
        }
    }
    $('body').on('click', '#btn-add-dcterms-contributors' + form_data._id, function() {
        $(this).parent().append(add_dcterms_contributor());
    });

    // opmw:hasDocumentation
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Documentation' }));
    input = $('<input>', {
        type: 'text',
        id: 'template-input-opmw-hasDocumentation',
        name: 'opmw-hasDocumentation',
        placeholder: 'enter documentation string'
    });
    if (template.properties["opmw:hasDocumentation"] !== undefined && template.properties["opmw:hasDocumentation"] !== null) {
        input.val(template.properties["opmw:hasDocumentation"]);
    }
    div.append(input);
    div.append('<p>The documentation can be any information attached to the template to provide more information about it.</p>')
    form.append(div);

    // opmw:versionNumber
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Version' }));
    input = $('<input>', {
        type: 'text',
        id: 'template-input-opmw-versionNumber',
        name: 'opmw-versionNumber',
        placeholder: 'enter version of template'
    });
    if (template.properties["opmw:versionNumber"] !== undefined && template.properties["opmw:versionNumber"] !== null) {
        input.val(template.properties["opmw:versionNumber"]);
    }
    div.append(input);
    div.append('<p>The version of the template reflects the changes made to the template from its original conception.</p>')
    form.append(div);

    // extra properties
    if (form_data.properties.extra.length > 0) {
        for(var i=0; i<form_data.properties.extra.length; i++) {
            var uri = form_data.properties.extra[i].uri;
            var value = form_data.properties.extra[i].value;
            add_extra_property(uri, value);
        }
    }
}

var save_form_for_template = function() {
    _clear_form_messages();
    var error_messages = validate_form_for_template();
    if (error_messages.length > 0) {
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

    // rdfs:label
    var property = template.properties;
    delete experiment_data_by_label[property["rdfs:label"]];
    property["rdfs:label"] = $('#template-input-rdfs-label').val();
    experiment_data_by_label[property["rdfs:label"]] = form_data;

    // dcterms:contributors
    property["dcterms:contributors"] = [];
    $.each($('#object-form input[name="dcterms-contributor' + form_data._id + '"]'), function() {
        property["dcterms:contributors"].push($(this).val());
    });

    // opmw:hasDocumentation
    property["opmw:hasDocumentation"] = $('#template-input-opmw-hasDocumentation').val();

    // opmw:versionNumber
    property["opmw:versionNumber"] = $('#template-input-opmw-versionNumber').val();

    // additional properties
    property.extra = [];
    form_extra_properties.find('.field').each(function() {
        var uri = $(this).find('input[name="property-uri"]').eq(0).val();
        var value = $(this).find('input[name="property-value"]').eq(0).val();
        property.extra.push({ uri: uri, value: value });
    });

    form_data._status.validated = true;
    $('#sidebar-template-label').removeClass('sidebar-item-label-flagged');
    $('#sidebar-template-label').addClass('sidebar-item-label');
    $('#sidebar-template-label').text(form_data.properties["rdfs:label"]);

    var div = $('<div>', { class: 'ui success message' });
    div.append($('<div>', { class: 'header', text: 'Template saved successfully' }));
    div.append('<p>Template properties have been validated and saved.</p>');
    form.prepend(div);
    form.addClass('success');

    // save by id
    if (_.includes(experiment_data_by_id, form_data._id)) {
        _.pull(experiment_data_by_id, form_data._id);
    }
    experiment_data_by_id[form_data._id] = form_data;
    experiment_data_by_type.template = form_data;
}

var validate_form_for_template = function() {
    var error_messages = [];
    if (!$('#template-input-rdfs-label').val()) {
        error_messages.push('label is not set');
    }
    if ($('#object-form input[name="dcterms-contributor' + form_data._id + '"]').length == 0) {
        error_messages.push("no contributors added");
    } else {
        $.each($('#object-form input[name="dcterms-contributor' + form_data._id + '"]'), function() {
            if(!$(this).val()) {
                error_messages.push('contributor value not set');
            }
        });
    }
    if (!$('#template-input-opmw-hasDocumentation').val()) {
        error_messages.push('documentation is empty');
    }
    if (!$('#template-input-opmw-versionNumber').val()) {
        error_messages.push('version is not set');
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

var make_form_for_data_variable = function() {
    var div = null; var fields = null; var input = null;
    _prep_form();
    form_saver = save_form_for_data_variable;

    // rdfs:label
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Data Variable Label' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-rdfs-label' + form_data._id,
        name: 'rdfs-label',
        placeholder: 'enter label of data variable'
    });
    if (form_data.properties["rdfs:label"] !== undefined && form_data.properties["rdfs:label"] !== null) {
        input.val(form_data.properties["rdfs:label"]);
    }
    div.append(input);
    div.append('<p>The label of the data variable is used to assign a unique name to the data that will distinguish it from other similar data sets used in experiments.</p>')
    form.append(div);

    // opmw:hasDimensionality
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Data Variable Dimensionality' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-opmw-hasDimensionality' + form_data._id,
        name: 'opmw-hasDimensionality',
        placeholder: 'enter dimensionality of data variable'
    });
    if (form_data.properties["opmw:hasDimensionality"] !== undefined && form_data.properties["opmw:hasDimensionality"] !== null) {
        input.val(form_data.properties["opmw:hasDimensionality"]);
    }
    div.append(input);
    div.append('<p>Dimensionality describes the property of data variable such as 0 for single file, 1 for collection, etc.</p>')
    form.append(div);

    // opmw:wasGeneratedBy
    // TODO: select field
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Data Variable was generated by Step' }));
    input = $('<select>', {
        id: 'select-opmw-wasGeneratedBy' + form_data._id,
        name: 'opmw-wasGeneratedBy',
        class: 'ui search selection dropdown'
    });
    input.append('<option value="">Select Step</option>');
    _.each(experiment_data_by_type.step, function(step) {
        input.append($('<option>', {
            value: step.properties["rdfs:label"],
            text: step.properties["rdfs:label"]
        }));
    });
    div.append(input);
    div.append('<p>Select the Step that generates this data variable. If it is not generated by any step, leave it blank / default.</p>');
    form.append(div);
    input.dropdown();
    if (form_data.properties["opmw:wasGeneratedBy"] !== undefined && form_data.properties["opmw:wasGeneratedBy"] !== null) {
        input.dropdown('set selected', form_data.properties["opmw:wasGeneratedBy"].properties["rdfs:label"]);
    }

    // extra properties
    if (form_data.properties.extra.length > 0) {
        for(var i=0; i<form_data.properties.extra.length; i++) {
            var uri = form_data.properties.extra[i].uri;
            var value = form_data.properties.extra[i].value;
            add_extra_property(uri, value);
        }
    }
}

var save_form_for_data_variable = function() {
    _clear_form_messages();
    var error_messages = validate_form_for_data_variable();
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

    var property = form_data.properties;
    var prev_label = property["rdfs:label"];
    delete experiment_data_by_label[prev_label];
    property["rdfs:label"] = $('#input-rdfs-label' + form_data._id).val();
    experiment_data_by_label[property["rdfs:label"]] = form_data;
    // data by type
    delete experiment_data_by_type.data_variable[prev_label];
    experiment_data_by_type.data_variable[property["rdfs:label"]] = form_data;
    property["opmw:hasDimensionality"] = $('#input-opmw-hasDimensionality' + form_data._id).val();
    _.each(experiment_data_by_type.step, function(step) {
        _.pull(step["opmw:wasGeneratedBy"], form_data);
    });
    var select = $('#select-opmw-wasGeneratedBy' + form_data._id).parent();
    if (select.dropdown('get value')) {
        var step = experiment_data_by_label[select.dropdown('get value')];
        if (step !== undefined && step !== null) {
            property["opmw:wasGeneratedBy"] = step;
            step["opmw:wasGeneratedBy"].push(form_data);
        }
    } else {
        property["opmw:wasGeneratedBy"] = null;
    }

    // additional properties
    property.extra = [];
    form_extra_properties.find('.field').each(function() {
        var uri = $(this).find('input[name="property-uri"]').eq(0).val();
        var value = $(this).find('input[name="property-value"]').eq(0).val();
        property.extra.push({ uri: uri, value: value });
    });

    form_data._status.validated = true;
    if ($('#sidebar-data-label' + form_data._id).length == 0) {
        // new item
        var li = $('<li>', {
            id: 'sidebar-data-label' + form_data._id,
            class: 'sidebar-data-label sidebar-item-label',
            text: property["rdfs:label"]
        });
        $('#item-list-data').append(li);
    } else {
        // item already exists
        $('#sidebar-data-label' + form_data._id).val(property["rdfs:label"]);
    }

    // save by id
    if (_.includes(experiment_data_by_id, form_data._id)) {
        _.pull(experiment_data_by_id, form_data._id);
    }
    experiment_data_by_id[form_data._id] = form_data;
    if (_.includes(experiment_data_by_label, property["rdfs:label"])) {
        _.pull(experiment_data_by_label, property["rdfs:label"]);
    }

    var div = $('<div>', { class: 'ui success message' });
    div.append($('<div>', { class: 'header', text: 'Data variable saved successfully' }));
    div.append('<p>Data variable properties have been validated and saved.</p>');
    form.prepend(div);
    form.addClass('success');

    draw_graph(make_diagram_data());
}

var validate_form_for_data_variable = function() {
    var error_messages = [];
    if (!$('#input-rdfs-label' + form_data._id).val()) {
        error_messages.push('label is not set');
    }
    if (!$('#input-opmw-hasDimensionality' + form_data._id).val()) {
        error_messages.push('dimensionality not set');
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

var make_form_for_parameter_variable = function() {
    var div = null; var fields = null; var input = null;
    _prep_form();
    form_saver = save_form_for_parameter_variable;

    // rdfs:label
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Parameter Variable Label' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-rdfs-label' + form_data._id,
        name: 'rdfs-label',
        placeholder: 'enter label of data variable'
    });
    if (form_data.properties["rdfs:label"] !== undefined && form_data.properties["rdfs:label"] !== null) {
        input.val(form_data.properties["rdfs:label"]);
    }
    div.append(input);
    div.append('<p>The label of the parameter variable is used to assign a unique name to the parameter that will distinguish it from other similar parameters used in experiments.</p>')
    form.append(div);

    // extra properties
    if (form_data.properties.extra.length > 0) {
        for(var i=0; i<form_data.properties.extra.length; i++) {
            var uri = form_data.properties.extra[i].uri;
            var value = form_data.properties.extra[i].value;
            add_extra_property(uri, value);
        }
    }
}

var save_form_for_parameter_variable = function() {
    _clear_form_messages();
    var error_messages = validate_form_for_parameter_variable();
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

    var property = form_data.properties;
    var prev_label = property["rdfs:label"];
    delete experiment_data_by_label[prev_label];
    property["rdfs:label"] = $('#input-rdfs-label' + form_data._id).val();
    // data by type
    delete experiment_data_by_type.parameter_variable[prev_label];
    experiment_data_by_type.parameter_variable[property["rdfs:label"]] = form_data;
    experiment_data_by_label[property["rdfs:label"]] = form_data;
    // additional properties
    property.extra = [];
    form_extra_properties.find('.field').each(function() {
        var uri = $(this).find('input[name="property-uri"]').eq(0).val();
        var value = $(this).find('input[name="property-value"]').eq(0).val();
        property.extra.push({ uri: uri, value: value });
    });

    form_data._status.validated = true;
    if ($('#sidebar-parameter-label' + form_data._id).length == 0) {
        // new item
        var li = $('<li>', {
            id: 'sidebar-parameter-label' + form_data._id,
            class: 'sidebar-parameter-label sidebar-item-label',
            text: property["rdfs:label"]
        });
        $('#item-list-param').append(li);
    } else {
        // item already exists
        $('#sidebar-parameter-label' + form_data._id).val(property["rdfs:label"]);
    }

    // save by id
    if (_.includes(experiment_data_by_id, form_data._id)) {
        _.pull(experiment_data_by_id, form_data._id);
    }
    experiment_data_by_id[form_data._id] = form_data;
    if (_.includes(experiment_data_by_label, property["rdfs:label"])) {
        _.pull(experiment_data_by_label, property["rdfs:label"]);
    }

    var div = $('<div>', { class: 'ui success message' });
    div.append($('<div>', { class: 'header', text: 'Parameter saved successfully' }));
    div.append('<p>Parameter properties have been validated and saved.</p>');
    form.prepend(div);
    form.addClass('success');

    draw_graph(make_diagram_data());
}

var validate_form_for_parameter_variable = function() {
    var error_messages = [];
    if (!$('#input-rdfs-label' + form_data._id).val()) {
        error_messages.push('label is not set');
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

var make_form_for_step = function() {
    var div = null; var fields = null; var input = null;
    _prep_form();
    form_saver = save_form_for_step;

    // rdfs:label
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Step Label' }));
    input = $('<input>', {
        type: 'text',
        id: 'input-rdfs-label' + form_data._id,
        name: 'rdfs-label',
        placeholder: 'enter label of step'
    });
    if (form_data.properties["rdfs:label"] !== undefined && form_data.properties["rdfs:label"] !== null) {
        input.val(form_data.properties["rdfs:label"]);
    }
    div.append(input);
    div.append('<p>The label of the step is used to assign a unique name to the step that will distinguish it from other similar steps.</p>')
    form.append(div);

    // opmw:uses
    // TODO: select multiple field
    div = $('<div>', { class: 'field' });
    div.append($('<label>', { text: 'Data Variables / Parameters used' }));
    input = $('<select>', {
        id: 'select-opmw-uses' + form_data._id,
        name: 'opmw-uses',
        multiple: "",
        class: 'ui search multiple selection dropdown'
    });
    input.append('<option value="">Select data variables/parameters</option>');
    _.each(experiment_data_by_type.parameter_variable, function(param) {
        input.append($('<option>', {
            value: param.properties["rdfs:label"],
            text: param.properties["rdfs:label"]
        }));
    });
    _.each(experiment_data_by_type.data_variable, function(data_var) {
        input.append($('<option>', {
            value: data_var.properties["rdfs:label"],
            text: data_var.properties["rdfs:label"]
        }));
    });
    div.append(input);
    div.append('<p>Select the data variables and parameters that the step uses.</p>');
    form.append(div);
    input.dropdown();
    if (form_data.properties["opmw:uses"].length > 0) {
        var uses_values = _.map(form_data.properties["opmw:uses"], 'properties["rdfs:label"]');
        input.dropdown('set exactly', uses_values);
    } else {
        input.dropdown('set exactly', []);
    }

    // extra properties
    if (form_data.properties.extra.length > 0) {
        for(var i=0; i<form_data.properties.extra.length; i++) {
            var uri = form_data.properties.extra[i].uri;
            var value = form_data.properties.extra[i].value;
            add_extra_property(uri, value);
        }
    }
}

var save_form_for_step = function() {
    _clear_form_messages();
    var error_messages = validate_form_for_step();
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

    var property = form_data.properties;
    var prev_label = property["rdfs:label"];
    delete experiment_data_by_label[prev_label];
    property["rdfs:label"] = $('#input-rdfs-label' + form_data._id).val();
    experiment_data_by_label[property["rdfs:label"]] = form_data;
    // data by type
    delete experiment_data_by_type.step[prev_label];
    experiment_data_by_type.step[property["rdfs:label"]] = form_data;

    var selected_variables = $('#select-opmw-uses' + form_data._id).parent().dropdown('get value');
    _.each(selected_variables, function(variable_label) {
        var variable = experiment_data_by_label[variable_label];
        _.pull(variable["opmw:uses"], form_data);
    });
    property["opmw:uses"] = [];
    _.each(selected_variables, function(variable_label) {
        var variable = experiment_data_by_label[variable_label];
        property["opmw:uses"].push(variable);
        variable["opmw:uses"].push(form_data);
    });

    // additional properties
    property.extra = [];
    form_extra_properties.find('.field').each(function() {
        var uri = $(this).find('input[name="property-uri"]').eq(0).val();
        var value = $(this).find('input[name="property-value"]').eq(0).val();
        property.extra.push({ uri: uri, value: value });
    });

    form_data._status.validated = true;
    if ($('#sidebar-step-label' + form_data._id).length == 0) {
        // new item
        var li = $('<li>', {
            id: 'sidebar-step-label' + form_data._id,
            class: 'sidebar-step-label sidebar-item-label',
            text: property["rdfs:label"]
        });
        $('#item-list-step').append(li);
    } else {
        // item already exists
        $('#sidebar-step-label' + form_data._id).val(property["rdfs:label"]);
    }

    // save by id
    if (_.includes(experiment_data_by_id, form_data._id)) {
        _.pull(experiment_data_by_id, form_data._id);
    }
    experiment_data_by_id[form_data._id] = form_data;
    if (_.includes(experiment_data_by_label, property["rdfs:label"])) {
        _.pull(experiment_data_by_label, property["rdfs:label"]);
    }

    var div = $('<div>', { class: 'ui success message' });
    div.append($('<div>', { class: 'header', text: 'Step saved successfully' }));
    div.append('<p>Step properties have been validated and saved.</p>');
    form.prepend(div);
    form.addClass('success');

    draw_graph(make_diagram_data());
}

var validate_form_for_step = function() {
    var error_messages = [];
    if (!$('#input-rdfs-label' + form_data._id).val()) {
        error_messages.push('label is not set');
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