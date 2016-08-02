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
    "object": null,  // element data (object/dict)
    // TODO: remove reference to dialog element in form
    // more than one property might need dialog in forms
    // use DOM to find element
    // in the dialog, add id / ref for property
    // then traverse using #id > ul to get place to insert items
    "dialog": null  // dialog element reference
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

    // TODO: add node of element to tree like node-(id)
    // this makes it easy to reverse reference any node from the element
    // TODO: update label in node when updating form
    // currently, when the label in form is updated, the tree node is not updated
    // though, clicking on the node still opens the correct (previously assigned) element in form

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
            uses: []
        };
        form_data.object["opmw:uses"].forEach(function(link, index) {
            diag_properties.uses.push(link.diagram);
        });
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
                field_vals = [];
                $("input[name='" + key + "']").each(function(){
                    field_vals.push($(this).val());
                });
                form_data.object[key] = field_vals;
            } else {
                form_data.object[key] = $("input[name='" + key + "']").val();
            }
        } else if (field_type == "select") {
            if (form_data.schema.properties[key].dimension == "multi" ||
                    form_data.schema.properties[key].dimension > 2) {
                form_data.object[key] = [];
                $('#' + key.replace(':', '-')).find('li>ul>li').each(function() {
                    var related_obj = experiment_data_labels[$(this).text()];
                    form_data.object[key].push(related_obj);
                    related_obj.links[key].push(form_data.object);
                });
            } else {
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
        } else if (field_type == "textarea") {
            form_data.object[key] = $("#" + key.replace(':', '-')).val();
        }
    });
    console.debug("updated form_data.object", form_data.object);

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
        if (field.dimension == "multi" || field.dimension > 1) {
            var span = $("<span>", {
                class: 'snap-right',
                text: '+',
                click: function(e) {
                    var input = $("<input>", {
                        field_type: 'text',
                        name: field_name,
                        value: ''
                    });
                    if (field.required) {
                        input.prop('required', true);
                    }
                    label.append(input);
                    // TODO: add button to remove input node from list in form
                    // var span = $("<span>", {
                    //     class: 'snap-right',
                    //     text: '-',
                    //     click: function(e) {
                    //        console.log('delete input node');
                    //     }
                    // });
                    // label.append(span);
                }
            });
            label.append(span);
            if (form_data.object.id == null) {
                if (field.required) {
                        var input = $("<input>", {
                        field_type: 'text',
                        name: field_name,
                        required: true,
                        value: form_data.object[field_name]
                    });
                    label.append(input);
                }
            } else {
                form_data.object[field_name].forEach(function(field_val, index) {
                    var input = $("<input>", {
                        field_type: 'text',
                        name: field_name,
                        value: field_val
                    });
                    if (field.required) {
                        input.prop('required', true);
                    }
                    label.append(input);
                });
            }
        } else {
            var input = $("<input>", {
                field_type: 'text',
                name: field_name,
                value: form_data.object[field_name]
            });
            if (field.required) {
                input.prop('required', true);
            }
            label.append(input);
        }
    // input is a select field
    } else if (field_type == "select") {
        if (field.dimension == "multi" || field.dimension > 1) {
            // FIXME: sanitation check
            if (form_data.object[field_name].constructor !== Array) {
                form_data.object[field_name] = [form_data.object[field_name]];
            }
            var select_opener = $('<span>', {
                class: 'snap-right',
                text: "select"
            });
            select_opener.on('click', function() {
                dialog_multi_select.dialog("open");
            });
            label.append(select_opener);
            var selected_options = $("<ul>", {id: field_name.replace(':', '-')});
            label.append(selected_options);
            form_data.dialog = selected_options;
            var form_listing = {};  // to list selected items in form
            // populate the multi-select options
            $('#multi-select-title').text(field.label)
            $('#multi-select-options').empty();
            field.range.forEach(function(field_range, index) {
                if (experiment_data[field_range] != null) {
                    var holder_div = $('<div>');
                    holder_div.append('<h4>' + OPMW.elements[field_range].label + '</h4>')
                    form_listing[OPMW.elements[field_range].label] = [];
                    experiment_data[field_range].forEach(function(field_obj, index) {
                        var checkbox_checked = false;
                        for(var i=0; i<form_data.object[field_name].length; i++) {
                            if (form_data.object[field_name][i] == field_obj) {
                                checkbox_checked = true;
                                break;
                            }
                        }
                        holder_div.append($('<input>', {
                            type: 'checkbox',
                            value: field_obj["rdfs:label"],
                            checked: checkbox_checked
                        })).append(field_obj["rdfs:label"]).append('<br>');
                    });
                    $('#multi-select-options').append(holder_div);
                }
            });
            // add existing property links
            form_data.object[field_name].forEach(function(linked_obj, index) {
                form_listing[linked_obj.schema.label].push(linked_obj["rdfs:label"]);
            });
            Object.keys(form_listing).forEach(function(obj_type, index) {
                var obj_type_items = $('<ol>');
                form_listing[obj_type].forEach(function(obj_type_item, index) {
                    obj_type_items.append($('<li>', {text: obj_type_item}));
                });
                selected_options.append($('<li>', {text: obj_type}));
                selected_options.append(obj_type_items);
            });
        } else {
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
        }
    } else if (field_type == "multi-select") {
        label.append($("<button>", {
            text: select,
            click: dialog_multi_select.dialog("open"),
        }));
    // input is a text area
    } else {
        var textarea = $("<textarea>", {id: field_name.replace(':', '-')});
        textarea.val(form_data.object[field_name]);
        label.append(textarea);

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

var dialog_multi_select = $('#multi-select').dialog({
    autoOpen: false,
    height: 500,
    width: 400,
    modal: true,
    buttons: {
        "select": function() {
            form_data.dialog.empty();
            $('#multi-select-options div').each(function () {
                var list = $('<li>', {text: $(this).find('h4').eq(0).text()});
                var list_items = $('<ul>');
                list.append(list_items);
                $(this).find('input:checkbox:checked').each(function() {
                    list_items.append('<li>' + $(this).val() + '</li>');
                });
                form_data.dialog.append(list);
            });
            dialog_multi_select.dialog("close");
        },
        "cancel": function() {
            dialog_multi_select.dialog("close");
        }
    },
    close: function() {
        // actions on dialog close
    }
});

console.info("loaded form.js");