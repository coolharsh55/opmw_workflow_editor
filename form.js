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
 * save form
 *
 * Will save the form data into the element data
 * and add it to experiment_data under appropriate element type.
 *
 * @return {boolean} returns save status
 */
var form_save = function() {
    // validate form before saving
    if (!form_validate()) {
        console.error("save failed: form is not validated");
        return false;
    }

    // check if there is a duplicate ID
    if (form_data.object["rdfs:label"] in experiment_data_labels) {
        if (experiment_data_labels[form_data.object["rdfs:label"]] != form_data.object) {
            alert('label already in use');
            console.warn('duplicate element ID', form_data.object["rdfs:label"]);
            return false;
        }
    }

    // add form data to element
    if (!form_add_element_data()) {
        console.error("save failed: could not add form data to element");
    }

    // add form element to element_data
    if (form_data.object.id == null) {
        experiment_data[form_data.type].push(form_data.object);
        experiment_data_labels[form_data.object["rdfs:label"]] = form_data.object;
        form_data.object.id = 0;
        // attach element to tree
        if (form_data.type == "opmw:WorkflowTemplate") {
            $('#tree-experiment').text(form_data.object["rdfs:label"]);
        } else if (form_data.type == "opmw:WorkflowTemplateProcess") {
            $('#steps ul').append('<li class="object-instance">' + form_data.object["rdfs:label"]);
        } else if (form_data.type == "opmw:DataVariable") {
            $('#variables_data ul').append('<li class="object-instance">' + form_data.object["rdfs:label"]);
        } else if (form_data.type == "opmw:ParameterVariable") {
            $('#variables_param ul').append('<li class="object-instance">' + form_data.object["rdfs:label"]);
        }
    }

    // add diagram for element
    if (!form_add_diagram()) {
        console.error("save failed: could not render diagram for element");
    }

    console.debug("saved element", form_data.object, experiment_data);
    return true;
}


/**
 * render diagram for element in form
 * @return {bool} operation status
 */
var form_add_diagram = function() {
    var draw_diag = null;
    var diag_properties = null;

    // data variable
    if (form_data.type == "opmw:DataVariable") {
        if (form_data.object["opmw:isGeneratedBy"]) {
            draw_diag = diag_add_data_op_var;
            diag_properties = {
                text: form_data.object["rdfs:label"],
                source: null
            };
            if (form_data.object["opmw:isGeneratedBy"]) {
                diag_properties.source = form_data.object["opmw:isGeneratedBy"].diagram;
            }
        } else {
            draw_diag = diag_add_data_var;
            diag_properties = {
                text: form_data.object["rdfs:label"]
            };
        }
    }

    // parameter variable
    else if (form_data.type == "opmw:ParameterVariable") {
        draw_diag = diag_add_param_var;
        diag_properties = {
            text: form_data.object["rdfs:label"]
        };
    }

    // step
    else if (form_data.type == "opmw:WorkflowTemplateProcess") {
        draw_diag = diag_add_step;
        diag_properties = {
            text: form_data.object["rdfs:label"],
            uses: null
        };
        if (form_data.object["opmw:uses"]) {
            // TODO: return array of linked diagrams
            // FIXME: set opwm:uses as array
            diag_properties.uses = form_data.object["opmw:uses"].diagram;
        }
    }

    // other elements
    else {
        // do nothing
    }

    // attach diagram ID to the saved object instance
    if (diag_properties == null) {
        console.debug("no diagram added for element", form_data.object);
    } else {
        diag_properties.diagram = form_data.object.diagram;
        var diag_id = draw_diag(diag_properties);
        if (diag_id == null) {
            console.error("failed: drawing diagram for element", form_data.object);
        } else {
            form_data.object.diagram = diag_id;
        }
    }
    return true;
}


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

    // TODO: add form data to form element
    Object.keys(form_data.schema.properties).forEach(function(key, index) {
        // console.debug(
        //     key,
        //     form_data.schema.properties[key],
        //     $("input[name='" + key + "']").val(),
        //     key in form_data.object);
        var field_type = form_data.schema.properties[key].input;
        if (field_type == "text") {
            // create array if type is list
            if (form_data.schema.properties[key].dimension == "multi" ||
                    form_data.schema.properties[key].dimension > 1) {
                // TODO: add values to array
                form_data.object[key] = [$("input[name='" + key + "']").val()];
            } else {
                form_data.object[key] = $("input[name='" + key + "']").val();
            }
        } else if (field_type == "select") {
            // create object link if type is select
            // see if select has a value
            if ($("#" + key.replace(':', '-')).length > 0) {
                // get label of selected element
                var label_related_obj =
                    $("#" + key.replace(':', '-') + " option:selected").text();
                // console.debug("select value", label_related_obj);
                // get related element object
                var related_obj = experiment_data_labels[label_related_obj];
                // check if element object exists (it should!)
                if (related_obj == null) {
                    // console.error("finding related object with label", label_related_obj);
                    form_data.object[key] = related_obj;
                } else {
                    form_data.object[key] = related_obj;
                    related_obj.links[key].push(form_data.object);
                }
            }
        }
    });
    console.debug("updated form_data.object", form_data.object);

    // TODO: property and relation resolution
    // NOTE:
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

    return true;
}


/**
 * Add field to form (#infobox)
 * @param {string} field_name
 * @param {dict} field properties
 * @return {boolean} operation status
 */
var form_add_property = function(field_name, field) {
    console.debug("add property to form", field_name, field);
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
            value: form_data.object[field_name]
        });
        if (field.required) {
            input.prop('required', true);
        }
        label.append(input);
    // input is a select field
    } else if (field_type == "select") {
        // TODO: restore field value
        var select = $('<select>', {id: field_name.replace(':', '-')});
        // get the type of the field range
        // it can be single (string) or multiple (array)
        // convert single to [single] to handle both cases with the same code
        var field_range_vals = null;
        if (field.range.constructor === Array) {
            field_range_vals = field.range;
        } else {
            field_range_vals = [field.range];
        }
        console.debug("field range for property", field_range_vals);
        if (!field.required) {
            select.append($('<option>'), {
                attr: {value: null},
                html: 'null',
            });
        }
        field_range_vals.forEach(function(field_range, index) {
            if (experiment_data[field_range] != null) {
                experiment_data[field_range].forEach(function(field_obj, index) {
                    select.append($('<option>', {
                        attr: {value: field_obj["rdfs:label"]},
                        html: field_obj["rdfs:label"]
                    }));
                })
            }
        });
        if (field.required) {
            select.prop('required', true);
        }
        // if this is a saved object, restore the value in the dropdown
        // the value in the dropdown is the label of the linked object
        // so check if the value is null (nothing selected)
        // or it is an object, in which case use its rdfs:label property
        if (form_data.object.id != null) {
            var previous_value = form_data.object[field_name];
            if (previous_value == null || previous_value == 'null') {
                select.val('null');
            } else {
                select.val(form_data.object[field_name]["rdfs:label"]);
            }
        }
        label.append(select);
    // input is a multi-select field
    // TODO: add multi-select field type to form
    } else if (field_type == "multi-select") {
        // TODO: restore field value
        label.append('test');
    // input is a text area
    } else {
        // TODO: restore textarea value
        label.append($("<textarea>"), {value: form_data.object[field_name]});
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
    console.debug("creating form for", type, schema, object);
    if (
            object != null &&
            object["rdfs:label"] != null &&
            object["rdfs:label"] === form_data.object["rdfs:label"]) {
        console.debug("skipping form creation for same object");
        return true;
    }
    // TODO: check, validate, save previous form data before making new one
    // NOTE: this should not be done in this function (?)
    //      the form data save status could be added to the form element
    //      and if it is saved, then just creat the new form
    //      otherwise save and exit? or ask if they want to lose the data?

    // object is the instance of that element
    // if it is null, then we create a new element
    if (object == null) {
        // create new element for schema
        // console.debug("element schema", schema);
        object = {id: null, schema: schema, type: type, links: {}};
        Object.keys(schema.properties).forEach(function(key, index) {
            var property = schema.properties[key];
            if (property.dimension == "multi") {
                object[key] = [];
            } else {
                object[key] = null;
            }
        });
        Object.keys(schema.relations).forEach(function(key, index) {
            object.links[key] = [];
        });
        console.debug("new schema object", object);
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

    // show relations only if the object has an id
    if (object.id != null) {
        // create elements for each relation
        Object.keys(object.links).forEach(function(key, index) {
            var related_links = $('<ul>');
            object.links[key].forEach(function(ele, index) {
                related_links.append($('<li>', {text: ele["rdfs:label"]}));
            });
            // console.debug(related_links);
            $('#form-relations').append(
                $('<li>', {text: schema.relations[key].label}).append(related_links));
        });
    }

    return true;
}

console.debug('loaded form.js');