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
var serialize_export = function() {
    var export_json = {
        workflow_template:
            experiment_data['opmw:WorkflowTemplate'][0]["rdfs:label"],
        objects: {},
        diagram: {}
    };
    // unwanted properties
    var unwanted_properties = ["id", "schema", "links"];
    // flatten structure
    // (remove circular links and references)
    // (set links as string indexes to label of object)
    // start with properties
    Object.keys(experiment_data_labels).forEach(function(object_label) {
        var object_json = {};
        var object = experiment_data_labels[object_label];
        Object.keys(object).forEach(function(key) {
            // if this property should not be exported, don't handle it
            if (unwanted_properties.indexOf(key) > -1) {
                return;
            }
            var property = object[key];
            if (property && property.constructor == Object) {
                console.debug("property is a link", key, property);
                object_json[key] = property["rdfs:label"];
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
        // attach diagram node (through id)
        object_json.diagram = object.diagram;
        console.debug(object_label, object_json);
        export_json.objects[object_label] = object_json;
    });
    export_json.diagram = graph.toJSON();
    // snippet copied from
    // http://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    var dataStr = "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(export_json));
    $('#export-data').attr("href", dataStr);
    // ~snippet~
    console.info("exported data", export_json);
    return true;
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
    var workflow_template_label = file_json.workflow_template;
    var diagram = file_json.diagram;
    experiment_data_labels = file_json.objects;

    // TODO: check integrity of imported json
    // TODO: check compatibility of imported json
    // TODO: check imported json adheres to schema

    // clear out previous experiment data
    Object.keys(experiment_data).forEach(function(key, index) {
        experiment_data[key] = [];
    });
    // remove tree nodes
    $('#steps ul').empty();
    $('#variables_data ul').empty();
    $('#variables_param ul').empty();
    // insert imported objects
    Object.keys(experiment_data_labels).forEach(function(key, index) {
        var object = experiment_data_labels[key];
        // mark as imported object
        object.id = 1;
        // link with schema
        object.schema = OPMW.elements[object.type];
        // add to experiment data
        experiment_data[object.type].push(object);
        // add links
        Object.keys(object.links).forEach(function(link_type, index) {
            objects_link_type = []
            object.links[link_type].forEach(function(object_label, index) {
                objects_link_type.push(experiment_data_labels[object_label]);
            });
            object.links[link_type] = objects_link_type;
        });
        // add linked properties
        var nonlinked_properties = ["id", "schema", "links", "diagram"];
        Object.keys(object).forEach(function(property, index) {
            if (nonlinked_properties.indexOf(property) > -1) {
                return;
            }
            if (
                property in object.schema.properties &&
                object.schema.properties[property].range in OPMW.elements &&
                object[property] != null
            ) {
                object[property] = experiment_data_labels[object[property]];
            }
        });
        // add object to tree
        if (object.type == "opmw:WorkflowTemplate") {
            $('#tree-experiment').text(object["rdfs:label"]);
        } else if (object.type == "opmw:WorkflowTemplateProcess") {
            $('#steps ul').append('<li class="object-instance">' + object["rdfs:label"]);
        } else if (object.type == "opmw:DataVariable") {
            $('#variables_data ul').append('<li class="object-instance">' + object["rdfs:label"]);
        } else if (object.type == "opmw:ParameterVariable") {
            $('#variables_param ul').append('<li class="object-instance">' + object["rdfs:label"]);
        }
    });

    // open workflow template in form
    form_make(
        "opmw:WorkflowTemplate",
        OPMW.elements["opmw:WorkflowTemplate"],
        experiment_data["opmw:WorkflowTemplate"][0]);

    console.log("experiment data", experiment_data);
    console.log("experiment data labels", experiment_data_labels);

    // restore diagram status
    graph.fromJSON(diagram);

    return true;
}
