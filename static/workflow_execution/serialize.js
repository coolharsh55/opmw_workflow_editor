/*
    serialize.js
    persistence and restoration of experiment data

    @author: Harshvardhan Pandit
    @email : me@harshp.com
 */

//////////////////////////////////////////////////////////////////////////////
// export experiment data

/**
 * export experiment data
 * @return {boolean} operation status
 */
var serialize_data = function() {
    var export_json = {
        account: execution_account["opmw:correspondsToTemplate"],
        objects: {},
        execution_diagram: {}
    };
    // unwanted properties
    var unwanted_properties = ["id", "schema", "links", "template", "diagram", "diagram_properties"];
    // flatten structure
    // (remove circular links and references)
    // (set links as string indexes to label of object)
    // start with properties
    Object.keys(linked_template_objects).forEach(function(object_label) {
        var object_json = {};
        var object = linked_template_objects[object_label];
        Object.keys(object).forEach(function(key) {
            // if this property should not be exported, don't handle it
            if (unwanted_properties.indexOf(key) > -1) {
                return;
            }
            var property = object[key];
            // if property is a dictionary
            if (property && property.constructor == Object) {
                console.debug("property is a linked object", key, property);
                object_json[key] = property["rdfs:label"];
            // if property is a list of items
            } else if (property && property.constructor == Array) {
                console.debug("property is a list of linked objects", key, property);
                object_json[key] = [];
                property.forEach(function(item, index) {
                    if (item && typeof(item) != 'string') {
                        object_json[key].push(item["rdfs:label"]);
                    } else {
                        object_json[key].push(item);
                    }
                });
                // if property has some range (over elements)
                // if (object.schema.properties[key].range){
                //     // if the range is not a list, and it is not an OPMW element
                //     // add the item as json
                //     if (object.schema.properties[key].range.constructor !== Array &&
                //             !(object.schema.properties[key].range in OPMW.elements)) {
                //         property.forEach(function(item, index) {
                //             object_json[key].push(item);
                //         });
                //     }
                //     // if the range is not a list, but it is an OPMW element
                //     // add the item's label as json
                //     else  if(object.schema.properties[key].range.constructor !== Array &&
                //             object.schema.properties[key].range in OPMW.elements) {
                //         property.forEach(function(item, index) {
                //             object_json[key].push(item["rdfs:label"]);
                //         });
                //     }
                //     // if the range is a list
                //     else if(object.schema.properties[key].range.constructor == Array) {
                //         // NOTE: figure out a way to mix OPMW elements and other types if required
                //         property.forEach(function(item, index) {
                //             object_json[key].push(item["rdfs:label"]);
                //         });
                //     }
                // }
                // // item has a null range, which means that it is a list of literal values
                // else {
                //     property.forEach(function(item, index) {
                //         object_json[key].push(item);
                //     });
                // }
            } else {
                console.debug("property is a literal", key, property);
                object_json[key] = object[key];
            }
        });
        // flatten links
        object_json.links = {};
        Object.keys(object.links).forEach(function(key) {
            var link = object.links[key];
            // if the link is represented as an Array (multiple values),
            // flatten it
            if (link && link.constructor == Array) {
                object_json.links[key] = [];
                link.forEach(function(link_item, index) {
                    object_json.links[key].push(link_item["rdfs:label"]);
                });
            } else {
                object_json.links[key] = link;
            }
        });
        object_json.template = object.template;
        // attach diagram node (through id)
        // object_json.diagram = object.diagram;
        export_json.objects[object_label] = object_json;
    });
    Object.keys(execution_diagram).forEach(function(key, index) {
        var object = execution_diagram[key];
        export_json.execution_diagram[object["rdfs:label"]] = key;
    });
    console.log(export_json);
    return export_json;
}


var serialize_export = function() {
    var export_json = serialize_data();
    export_json.diagram = graph.toJSON();
    // snippet copied from
    // http://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    var dataStr = "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(export_json));
    $('#export-data').attr("href", dataStr);
    // ~snippet~
    // console.info("exported data", {data: export_json});
}

function encode_as_img_and_link(){
    var svg = document.getElementById('diagram').firstChild.outerHTML;
    $('<canvas/>', { id: 'canvas', width: 700, height: 900}).appendTo('body');
    canvg('canvas', svg);
    var canvas = document.getElementById('canvas');
    // http://stackoverflow.com/questions/19032406/convert-html5-canvas-into-file-to-be-uploaded
    var blobBin = atob(canvas.toDataURL().split(',')[1]);
    canvas.parentNode.removeChild(canvas);
    var array = [];
    for(var i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
    }
    var file=new Blob([new Uint8Array(array)], {type: 'image/png'});
    return file;
}

var serialize_publish = function() {
    var export_json = serialize_data();
    var file = encode_as_img_and_link();

    var formdata = new FormData();
    formdata.append("image", file);
    formdata.append("data", JSON.stringify(export_json));

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/publish/workflowexecution/", true);
    // xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(formdata);
}


//////////////////////////////////////////////////////////////////////////////
// import experiment data

var imported_json = null;
/**
 * import experiment data
 * @return {boolean} operation status
 */
var serialize_import = function(file_contents) {
    var file_json = JSON.parse(file_contents);
    console.log("imported json", file_json);
    var execution_account_label = file_json.account;
    var diagram = file_json.diagram;
    template = file_json.template;
    linked_template_objects = file_json.objects;
    execution_diagram = file_json.execution_diagram;
    execution_account = linked_template_objects[execution_account_label];
    execution_data_labels = {};

    // TODO: check integrity of imported json
    // TODO: check compatibility of imported json
    // TODO: check imported json adheres to schema

    // create global index by rdfs:label
    Object.keys(linked_template_objects).forEach(function(key, index) {
        object = linked_template_objects[key];
        execution_data_labels[object["rdfs:label"]] = object;
        object.schema = OPMW.execution[object.type];
    });
    // set links to objects
    Object.keys(linked_template_objects).forEach(function(key, index) {
        object = linked_template_objects[key];
        Object.keys(object).forEach(function(key, index) {
            if (key == "rdfs:label") { return; }
            value = object[key];
            if (value == null || value == undefined || value === 'None') {
                return;
            }
            if (typeof(value) == 'string') {
                if (value in execution_data_labels) {
                    object[key] = execution_data_labels[value];
                }
            } else if (value.isArray) {
                for(var i=0; i<value.length; i++) {
                    if (value[i] in execution_data_labels) {
                        value[i] = execution_data_labels[value[i]];
                    } else {
                        break;
                    }
                }
            }
        });
        if (object.links !== null && object.links !== undefined) {
            Object.keys(object.links).forEach(function(link, index) {
                var linked_items = object.links[link];
                for(var i=0; i<linked_items.length; i++) {
                    linked_items[i] = execution_data_labels[linked_items[i]];
                }
            });
        }
    });

    Object.keys(execution_diagram).forEach(function(key, index) {
        var diagram_id = execution_diagram[key];
        execution_diagram[diagram_id] = execution_data_labels[key];
        execution_data_labels[key].diagram_properties = { diagram: diagram_id };
    });

    // // open workflow template in form
    form_make(
        execution_account.type,
        execution_account.schema,
        execution_account);

    console.info("imported data from file");
    console.info("execution data", linked_template_objects);
    console.info("execution data labels", execution_data_labels);

    // restore diagram status
    graph.fromJSON(diagram);

    return true;
}

console.info("loaded serialize.js");