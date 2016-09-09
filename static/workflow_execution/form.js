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
 * and add it to execution_data under appropriate element type.
 *
 * @return {boolean} returns save status
 */
var form_save = function() {
    // validate form before saving
    if (!form_validate()) {
        console.error("save failed: form is not validated");
        return false;
    }

    // add form data to element
    if (!form_add_element_data()) {
        console.error("save failed: could not add form data to element");
    }

    // check if there is a duplicate ID
    // if (form_data.object["rdfs:label"] in execution_data_labels) {
    //     if (execution_data_labels[form_data.object["rdfs:label"]] != form_data.object) {
    //         alert('label already in use');
    //         console.warn('duplicate element ID', form_data.object["rdfs:label"]);
    //         return false;
    //     }
    // }

    // TODO: add node of element to tree like node-(id)
    // this makes it easy to reverse reference any node from the element
    // TODO: update label in node when updating form
    // currently, when the label in form is updated, the tree node is not updated
    // though, clicking on the node still opens the correct (previously assigned) element in form

    // add form element to element_data
    // if (form_data.object.id == null) {
    //     execution_data[form_data.type].push(form_data.object);
    //     execution_data_labels[form_data.object["rdfs:label"]] = form_data.object;
    //     form_data.object.id = 0;
    //     // attach element to tree
    //     if (form_data.type == "opmw:WorkflowTemplate") {
    //         $('#btn-template').text(form_data.object["rdfs:label"]);
    //     }
    // }

    // add diagram for element
    if (!form_add_diagram()) {
        console.error("save failed: could not render diagram for element");
    }

    form_make(form_data.type, form_data.schema, form_data.object);
    console.debug("saved element", form_data.object, execution_data);
    return true;
}


/**
 * cancel the form modifications and reload object
 * @return {boolean} operation status
 */
var form_cancel = function() {
    if (form_data.object != null && form_data.object.id != null) {
        form_make(form_data.type, form_data.schema, form_data.object);
    } else {
        form_make(form_data.type, form_data.schema);
    }
}


/**
 * render diagram for element in form
 * @return {bool} operation status
 */
var form_add_diagram = function() {
    var draw_diag = null;
    var diag_properties = null;

    // data variable
    // parameter variable
    if (form_data.type == "opmw:WorkflowExecutionArtifact") {
        diag_properties = {
            text: form_data.object["rdfs:label"],
            diagram: form_data.object.diagram_properties.diagram,
            validated: true
        }
        if (form_data.object.template.generated_by == undefined) {
            // param
            diag_add_param_var(diag_properties)
        } else if (form_data.object.template.generated_by == null || form_data.object.template.generated_by === "None") {
            // data var
            diag_add_data_var(diag_properties);
        } else {
            // data var op
            diag_properties.source = form_data.object["opmw:wasGeneratedBy"].diagram_properties.diagram;
            diag_add_data_op_var(diag_properties);
        }
    }

    // step
    else if (form_data.type == "opmw:WorkflowExecutionProcess") {
        diag_properties = {
            text: form_data.object["rdfs:label"],
            diagram: form_data.object.diagram_properties.diagram,
            validated: true,
            uses: []
        };
        console.log("step diagram", diag_properties);
        form_data.object["opmw:used"].forEach(function(link, index) {
            link = execution_data_labels[link];
            console.log(link);
            diag_properties.uses.push(link.diagram_properties.diagram);
        });
        diag_add_step(diag_properties);
    }

    // other elements
    else {
        // do nothing
    }

    // attach diagram ID to the saved object instance
    if (diag_properties == null) {
        console.debug("no diagram added for element", form_data.object);
    } else {
        // diag_properties.diagram = form_data.object.diagram;
        // draw_diag(diag_properties);
        // if (diag_id == null) {
        //     console.error("failed: drawing diagram for element", form_data.object);
        // } else {
        //     form_data.object.diagram = diag_id;
        // }
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
        if (($(this).prop('required') && !$(this).val()) || $(this).val().lastIndexOf("label not set") === 0) {
            // if it is empty, highlight it with a red border
            $(this).parent().addClass('error');
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
                var select_val = $('#dropdown-' + key.replace(':', '-')).dropdown('get value');
                for (var i=0; i<select_val.length-1; i++) {
                    var related_obj = execution_data_labels[select_val[i]];
                    form_data.object[key].push(related_obj);
                    related_obj.links[key].push(form_data.object);
                };
            } else {
                // create object link if type is select
                // see if select has a value
                var select_val = $('#dropdown-' + key.replace(':', '-')).dropdown('get value');
                if (select_val != '') {
                    // get label of selected element
                    // console.debug("select value", label_related_obj);
                    // get related element object
                    if ($('#related-' + key.replace(':', '-')).length) {
                        $('#related-' + key.replace(':', '-')).append($('<div>', {class: item, text: select_val}));
                    }
                    var related_obj = execution_data_labels[select_val];
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
    if (field.input == "text") {
        if (field.dimension == "multi" || field.dimension > 1) {

            var add_input_to_group = function(value) {
                if (typeof(value) !== "string") {
                    value = null;
                }
                var div = $("<div>", {
                    class: "inline field",
                });
                if (field.required) {
                    div.addClass('required');
                }
                div.append($("<button>", {
                    type: 'button',
                    class: 'snap-right tiny ui button',
                    text: '-',
                    click: function(e) {
                        if ($(this).parent().parent().find('.field').length > 1) {
                            var parent = $(this).parent().parent();
                            $(this).parent().remove();
                            var i = 1;
                            parent.find('.field>label').each(function() {
                                $(this).text(field.label + ' ' + i);
                                i += 1;
                            });
                        }
                    }
                }));
                div.append(
                    $('#group-' + field_name.replace(':', '-')).find('.field').length + 1);
                div.append($("<input>", {
                    field_type: 'text',
                    name: field_name,
                    required: field.required,
                    value: value
                }));

                group.append(div);
            };
            var group = $("<div>", {
                id: 'group-' + field_name.replace(':', '-'),
                class: "grouped fields"
            });
            group.append($("<button>", {
                type: 'button',
                class: 'snap-right tiny ui button',
                text: '+',
                click: add_input_to_group
            }));
            $('#form-properties').append(group);
            group.append($('<label>', {
                text: field.label,
                class: 'ui label'
            }));
            console.log("multi", form_data.object[field_name]);
            if (form_data.object[field_name] == null || form_data.object[field_name].length == 0) {
                add_input_to_group(null);
            } else {
                form_data.object[field_name].forEach(function(name) {
                    if (typeof(name) !== 'string') {
                        if (name["rdfs:label"] == null) {
                            name = 'unlabeled ' + name.type;
                        } else {
                            name = name["rdfs:label"];
                        }
                    }
                    add_input_to_group(name);
                });
            }

            // if (form_data.object.id == null) {
            //     if (field.required) {
            //             var input = $("<input>", {
            //             field_type: 'text',
            //             name: field_name,
            //             required: true,
            //             value: form_data.object[field_name]
            //         });
            //         label.append(input);
            //     }
            // } else {
            //     form_data.object[field_name].forEach(function(field_val, index) {
            //         var input = $("<input>", {
            //             field_type: 'text',
            //             name: field_name,
            //             value: field_val
            //         });
            //         if (field.required) {
            //             input.prop('required', true);
            //         }
            //         label.append(input);
            //     });
            // }
        } else {
            var div = $("<div>", {
                class: "field",
            });
            if (field.required) {
                div.addClass('required');
            }
            div.append($('<label>', {
                text: field.label,
                class: 'ui label'
            }));
            var field_value = form_data.object[field_name];
            if (field_value !== null && typeof(field_value) !== 'string') {
                console.log("field value", field_value);
                if (field_value.type != undefined) {
                    if (field_value["rdfs:label"] == null) {
                        field_value = 'label not set for ' + field_value.type;
                    } else {
                        field_value = field_value["rdfs:label"];
                    }
                } else {
                    field_value = 'unknown type';
                }
            }
            var input = $("<input>", {
                field_type: 'text',
                name: field_name,
                required: field.required,
                value: field_value
            });
            div.append(input);
            $('#form-properties').append(div);
        }
    // input is a select field
    } else if (field.input == "select") {
        if (field.dimension == "multi" || field.dimension > 1) {
            var div = $("<div>", {
                class: field
            });
            div.append($('<label>', {
                class: "ui label",
                text: field.label
            }));
            var select = $("<select>", {
                id: 'dropdown-' + field_name.replace(':', '-'),
                class: "ui fluid search selection dropdown multiple"
            });
            select.append($('<input>', {
                type: 'hidden',
                name: field_name.replace(':', '-'),
                required: field.required
            }));
            div.append(select);
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
            select.append("<option value>Select</option>");
            field_range_vals.forEach(function(field_range, index) {
                if (execution_data[field_range] != null) {
                    execution_data[field_range].forEach(function(field_obj, index) {
                        select.append($("<option>", {
                            value: field_obj["rdfs:label"],
                            text: field_obj["rdfs:label"]
                        }));
                    });
                }
            });
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
            $('#form-properties').append(div);
            var divdrop = document.getElementById('dropdown-' + field_name.replace(':', '-'));
            divdrop.setAttribute("multiple", "");
            select.dropdown();
            // if this is a saved object, restore the value in the dropdown
            // the value in the dropdown is the label of the linked object
            // so check if the value is null (nothing selected)
            // or it is an object, in which case use its rdfs:label property
            if (form_data.object.id != null) {
                var previous_value = form_data.object[field_name];
                if (previous_value && previous_value !== 'null' && previous_value.length > 0) {
                    select.dropdown('set selected', previous_value.map(function(elem) { return elem["rdfs:label"]; }));
                }
            }
            // // FIXME: sanitation check
            // if (form_data.object[field_name].constructor !== Array) {
            //     form_data.object[field_name] = [form_data.object[field_name]];
            // }
            // var select_opener = $('<span>', {
            //     class: 'snap-right',
            //     text: "select"
            // });
            // select_opener.on('click', function() {
            //     dialog_multi_select.dialog("open");
            // });
            // label.append(select_opener);
            // var selected_options = $("<ul>", {id: field_name.replace(':', '-')});
            // label.append(selected_options);
            // form_data.dialog = selected_options;
            // var form_listing = {};  // to list selected items in form
            // // populate the multi-select options
            // $('#multi-select-title').text(field.label)
            // $('#multi-select-options').empty();
            // field.range.forEach(function(field_range, index) {
            //     if (execution_data[field_range] != null) {
            //         var holder_div = $('<div>');
            //         holder_div.append('<h4>' + OPMW.elements[field_range].label + '</h4>')
            //         form_listing[OPMW.elements[field_range].label] = [];
            //         execution_data[field_range].forEach(function(field_obj, index) {
            //             var checkbox_checked = false;
            //             for(var i=0; i<form_data.object[field_name].length; i++) {
            //                 if (form_data.object[field_name][i] == field_obj) {
            //                     checkbox_checked = true;
            //                     break;
            //                 }
            //             }
            //             holder_div.append($('<input>', {
            //                 type: 'checkbox',
            //                 value: field_obj["rdfs:label"],
            //                 checked: checkbox_checked
            //             })).append(field_obj["rdfs:label"]).append('<br>');
            //         });
            //         $('#multi-select-options').append(holder_div);
            //     }
            // });
            // // add existing property links
            // form_data.object[field_name].forEach(function(linked_obj, index) {
            //     form_listing[linked_obj.schema.label].push(linked_obj["rdfs:label"]);
            // });
            // Object.keys(form_listing).forEach(function(obj_type, index) {
            //     var obj_type_items = $('<ol>');
            //     form_listing[obj_type].forEach(function(obj_type_item, index) {
            //         obj_type_items.append($('<li>', {text: obj_type_item}));
            //     });
            //     selected_options.append($('<li>', {text: obj_type}));
            //     selected_options.append(obj_type_items);
            // });
        } else {
            var div = $('<div>', {
                id: 'dropdown-' + field_name.replace(':', '-'),
                class: "ui fluid search selection dropdown"
            });
            div.append($('<input>', {
                type: 'hidden',
                name: field_name.replace(':', '-'),
                required: field.required
            }));
            div.append($('<div>', {class: "default text"}).append('select...'));
            var menu = $('<div>', {class: "menu"});
            div.append(menu);
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
            field_range_vals.forEach(function(field_range, index) {
                if (execution_data[field_range] != null) {
                    execution_data[field_range].forEach(function(field_obj, index) {
                        var div = $('<div>', {
                            class: "item",
                            "data-value": field_obj["rdfs:label"],
                        });
                        div.append(field_obj["rdfs:label"]);
                        menu.append(div);
                    });
                }
            });
            var div_base = $('<div>', {class: "field"});
            if (field.required) {
                div_base.addClass("required");
            }
            div_base.append($('<label>', {
                class: "ui label",
                text: field.label
            }));
            div_base.append(div);
            $('#form-properties').append(div_base);
            div.dropdown();
            // if this is a saved object, restore the value in the dropdown
            // the value in the dropdown is the label of the linked object
            // so check if the value is null (nothing selected)
            // or it is an object, in which case use its rdfs:label property
            if (form_data.object.id != null) {
                var previous_value = form_data.object[field_name];
                if (previous_value && previous_value !== 'null') {
                    div.dropdown('set selected', previous_value["rdfs:label"]);
                }
            }
        }
    } else if (field.input == "multi-select") {
        // label.append($("<button>", {
        //     text: select,
        //     click: dialog_multi_select.dialog("open"),
        // }));
        console.log("fix this multi-select");
    // input is a text area
    } else {
        var textarea = $("<textarea>", {id: field_name.replace(':', '-')});
        textarea.val(form_data.object[field_name]);
        var div_base = $('<div>', {class: "field"});
        if (field.required) {
            div_base.addClass("required");
        }
        div_base.append($('<label>', {
            class: "ui label",
            text: field.label
        }));
        div_base.append(div);
        div_base.append(textarea);
        $('#form-properties').append(div_base);
        // label.append(textarea);

    }
    // attach label and input to infobox
    // $('#form-properties').append(label);
    return true;
}


/**
 * display element in infobox
 * @param  {dict} ele element dictionary
 * @return {nothing}
 */
var form_make = function(type, schema, object) {

    console.debug("creating form for", type, schema, object);
    $('#element-type').text(schema.label);
    // TODO: check, validate, save previous form data before making new one
    // NOTE: this should not be done in this function (?)
    //      the form data save status could be added to the form element
    //      and if it is saved, then just creat the new form
    //      otherwise save and exit? or ask if they want to lose the data?

    if (object["rdfs:label"] == null) {
        $('#form-experiment-label').text("label undefined");
    } else {
        $('#form-experiment-label').text(object["rdfs:label"]);
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
    var not_properties = ["schema", "type", "links"];
    Object.keys(schema.properties).forEach(function(key, index) {
        for (var i=0; i<not_properties.length; i++) {
            if (not_properties[i] == key) {
                return;
            }
        }
        // add property field to form
        var property = schema.properties[key];
        form_add_property(key, property);
    });

    // create elements for each relation
    Object.keys(object.links).forEach(function(key, index) {
        var div = $('<div>', {class: "ui vertical segment"});
        div.append($('<label>', {
            class: "ui label",
            text: schema.relations[key].info
        }));
        var list = $('<div>', {
            id: 'related-' + key.replace(':', '-'),
            class: "ui bulleted list"
        });
        div.append(list);
        console.log("links", key, object.links[key]);
        object.links[key].forEach(function(ele, index) {
            var ele_text = ele["rdfs:label"];
            if (ele_text == null || ele_text === "None") {
                ele_text = ele.schema.label + " linked to " + ele.template.uri;
            }
            list.append($('<div>', {
                class: "item",
                text: ele_text
            }));
        });
        $('#form-relations').append(div);
    });

    return true;
}

console.info("loaded form.js");