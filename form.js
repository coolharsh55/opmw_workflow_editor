/*
    form.js
    form (left pane) functions and globals

    used to create dynamic forms for elements

    @author: Harshvardhan Pandit
    @email : me@harshp.com
 */


/*
    form data types

    input:text field
    select:dropdown
    multi-select:checkboxes
 */
var FORM_INPUT_TYPES = ["input", "select", "multi-select"]

/*
    form_element
    holds a reference to the current element represented in the form
 */
var form_data = {
    "schema": null,  // element schema reference
    "type": null,  // element type (string)
    "object": null  // element data (object/dict)
};


/**
 * validate form
 *
 * Will validate the form and return status
 * Checks if required fields are filled
 * Highlights if required fields are unfilled
 *
 * @return {boolean} returns validation status
 */
var form_validate = function() {
    var validated = true;  // assume the form is valid
    // check each input
    $('form#infobox').find('input').each(function() {
        // if it is required, check if it has a value
        if ($(this).prop('required') && !$(this).val()) {
            // if it is empty, highlight it with a red border
            $(this).addClass('red-border');
            // mark this form as not validated
            validated = false;
        // otherwise, remove any red borders since this is now valid
        } else {
            $(this).removeClass('red-border');
        }
    });

    return validated;
}


/**
 * Add form data to element (as data)
 * @return {boolean} operation status
 */
var form_add_element_data = function() {
    // TODO: (function) form add element data
    // if form_data.element === null, this is a new element
    var element = {
        "type": form_data.type,
        "schema": form_data.schema,
        "properties": {},
        "relations": {}
    }
    // forEach(property in form_data.element.properties) {
    //     get property from form
    //     element.properties.attach(property)
    //     link back to property if necessary
    // }
    // forEach(relation in form_data.element.relations) {
    //     get relation from form
    //     element.relations.attach(relations)
    //     link back to relation if necessary
    // }
    form_data.object = element;
    return true;
}


/**
 * Add field to form (#infobox)
 * @param {string} field_name
 * @param {dict} field properties
 * @return {boolean} operation status
 */
var form_add_property = function(field_name, field) {
    // create a new label to add to the form
    var label = $('<label>');
    label.addClass('form-label');
    // if the field is required, highlight it in bold
    if (field.required) {
        label.addClass('required');
        label.append($('<b>').append(field.label));
    } else {
        label.append(field.label);
    }

    // create input based on field input type
    var field_type = field.input;
    // input is a text field
    if (field.input == "text") {
        var input = $("<input>", {
            field_type: 'text',
            name: field_name,
        });
        if (field.required) {
            input.prop('required', true);
        }
        label.append(input);
    // input is a select field
    } else if (field_type == "select") {
        var select = $('<select>');
        for (var i=0; i<options.length; ++i) {
            select.append($('<option>', {
                attr: {value: i},
                html: i
            }));
        }
        if (field.required) {
            select.prop('required', true);
        }
        label.append(select);
    // input is a multi-select field
    // TODO: add multi-select field type to form
    } else if (field_type == "multi-select") {
        label.append('test');
    // input is a text area
    } else {
        label.append($("<textarea>"));
    }
    // attach label and input to infobox
    $('#form-properties').append(label);
    return true;
}


/**
 * display element in infobox
 * @param  {dict} ele element dictionary
 * @return {nothing}
 */
var form_make = function(type, schema, object=null) {
    // TODO: check, validate, save previous form data before making new one

    // object is the instance of that element
    // if it is null, then we create a new element
    if (object != null) {
        // TODO: create new element for schema
    }
    // add details to form object
    form_data.type = type;
    form_data.schema = schema;
    form_data.object = object;


    // clear form elements
    $('#form-properties').empty();
    $('#form-relations').empty();
    // add current element label
    // this will identify which element is being worked on
    $('#form-label').text(schema.label);

    // create elements for each property
    Object.keys(schema.properties).forEach(function(key, index) {
        // add property field to form
        var property = schema.properties[key];
        form_add_property(key, property);
    });

    // create elements for each relation
    Object.keys(schema.relations).forEach(function(key, index) {
        // add related relation objects
        var relation = schema.relations[key];
        if(relation.domain in experiment_data) {
            Object.keys(experiment_data[relation.domain]).forEach(function(key2, index) {
                var related_object = experiment_data.key.key2;
                if (relation.domain == key2) {
                    // TODO: check object is in related_object.properties and add as related
                }
            });
        }
    });

    return true;
}
