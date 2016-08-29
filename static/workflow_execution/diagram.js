/*
    diagram.js
    diagram (middle pane) functions and declarations

    uses
        - jQuery
        - joint.js (http://www.jointjs.com)

    replicates figures used in OPMW
    (http://www.opmw.org/model/OPMW/#ParameterVariable)
    and in example SimilarWords
    (http://www.opmw.org/export/page/resource/WorkflowTemplate/SIMILARWORDS)
    with diagram
    (http://wind.isi.edu/marbles/assets/components/workflow_portal/
    users/2/TextAnalytics/ontology/TextAnalytics/SimilarWords.owl.png)

    @author: Harshvardhan Pandit
    @email : me@harshp.com
 */


// declare canvas
var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    // id of diagram is 'diagram'
    el: $('#diagram'),
    // arbitrary size
    width: 700,
    height: 900,
    model: graph,
    gridSize: 1
});


/**
 * onClick handler for elements on graph
 * upon clicking the element, the appropriate element should be loaded in form
 */
paper.on('cell:pointerclick', function(cellView, evt, x, y) {
    // console.debug(cellView, evt, x, y);
    var element_label = cellView.model.attributes.attrs.text.text;
    var object = experiment_data_labels[element_label];
    // console.debug(element_label);
    // console.debug("element clicked", experiment_data_labels[element_label]);
    form_make(object.type, object.schema, object);
});

/**
 * Basic shapes in OPMW diagram
 * These shapes represent the basic OPMW types
 * These are then cloned to create the actual diagram
 */

/**
 * Data Variable
 * @type {joint.shapes.basic.Ellipse}
 *
 * represents a data variable in the diagram
 * is colored green with white text
 */
var joint_shape_data_var = new joint.shapes.basic.Ellipse({
    attrs: {
        ellipse: { fill: '#285526'},
        text: {text: 'data', fill: 'white'}
    }
});
/**
 * Parameter Variable
 * @type {joint.shapes.basic.Ellipse}
 *
 * represents a parameter variable in the diagram
 * is colored orange with black text
 */
var joint_shape_param_var = new joint.shapes.basic.Ellipse({
    attrs: {
        ellipse: { fill: '#E29414'},
        text: {text: 'param', fill: 'black'}
    }
});
/**
 * Data Output Variable
 * @type {joint.shapes.basic.Ellipse}
 *
 * represents a data variable that is the output of a step
 * is colored darkblue with white text
 */
var joint_shape_data_op_var = new joint.shapes.basic.Ellipse({
    attrs: {
        ellipse: { fill: '#032553'},
        text: {text: 'data', fill: 'white'}
    }
});
/**
 * Step
 * @type {joint.shapes.basic.Rect}
 *
 * represents an execution step
 * is colored yellow with black text
 */
var joint_shape_step = new joint.shapes.basic.Rect({
    attrs: {
        rect: { fill: '#FEC288', rx: 5, ry:5},
        text: { text: 'step', fill: 'black'}
    }
});


/*
    create a basic diagram - for testing purpose
 */
var diagram_test = function() {
    // data var
    var d1 = joint_shape_data_var.clone();
    d1.attr({text: {text: 'data var 1'}});
    d1.position(50, 30);
    d1.resize(50, 30);
    // parameter var
    var p1 = joint_shape_param_var.clone();
    p1.attr({text: {text: 'param var 1'}});
    p1.position(75, 30);
    p1.resize(50, 30);
    // step
    var s1 = joint_shape_step.clone();
    s1.attr({text: {text: "step 1"}});
    s1.position(100, 30);
    s1.resize(50, 30);
    // link data and step
    var link_d1_s1 = new joint.dia.Link({
        source: {id:d1.id},
        target: {id:s1.id}
    });
    link_d1_s1.attr({
        '.connection': {stroke: 'black'},
        '.marker-target': {fill: 'black', d:'M 10 0 L 0 5 L 10 10 z'}
    });
    // link parameter and step
    var link_p1_s1 = new joint.dia.Link({
        source: {id:p1.id},
        target: {id:s1.id}
    });
    link_p1_s1.attr({
        '.connection': {stroke: 'black'},
        '.marker-target': {fill: 'black', d:'M 10 0 L 0 5 L 10 10 z'}
    });
    // add cells to graph
    graph.addCells([d1, p1, s1, link_p1_s1, link_d1_s1]);
    return true;
}
// diagram_test();


/**
 * add link between two objects
 * @param  {cell} from
 * @param  {cell} to
 * @param  {dict} options options for the link
 * @return {boolean} operation completion status
 */
var diag_add_link = function(from, to, options) {
    options = typeof options !== 'undefined' ? options : {};
    var link = new joint.dia.Link({
        source: {id: from},
        target: {id: to}
    });
    attr = {
        '.connection': {stroke: 'black'},
        '.marker-target': {fill: 'black', d:'M 10 0 L 0 5 L 10 10 z'}
    };
    $.extend(attr, options);
    link.attr(attr);
    link.addTo(graph);
};


/*
 * functions for drawing diagrams on screen
 */

/**
 * add data variable diagram to graph
 * @param  {dict} data_var properties and links
 * @return {bool}          operation status
 */
var diag_add_data_var = function(data_var) {
    // check for unsaved (new) elements
    if (data_var.diagram == undefined) {
        var data_diag = joint_shape_data_var.clone();
        data_diag.attr({text: {text: data_var.text}});
        data_diag.position(200, 200);
        data_diag.resize(100, 30);
        graph.addCells([data_diag]);
        console.info("added data variable diagram", data_diag.id);
    }
    // saved element, has diagram instance on graph
    else {
        var data_diag = graph.getCell(data_var.diagram);
        data_diag.attr({text: {text: data_var.text}});
        // clear all inbound links for this node
        var links = graph.getConnectedLinks(data_diag, {inbound:true});
        links.forEach(function(link, index) {
            link.remove();
        });
        console.info("modified added data variable diagram", data_diag.id);
    }
    return data_diag.id;
};

/**
 * add data variable (output) diagram to graph
 * @param  {dict} data_var properties and links
 * @return {bool}          operation status
 */
var diag_add_data_op_var = function(data_var) {
    console.log(data_var);
    // check for unsaved (new) elements
    if (data_var.diagram == undefined) {
        var data_diag = joint_shape_data_op_var.clone();
        data_diag.attr({text: {text: data_var.text}});
        data_diag.position(200, 200);
        data_diag.resize(100, 30);
        data_diag.addTo(graph);
        diag_add_link(from=data_var.source, to=data_diag.id);
        console.info("added data variable (artifact) diagram", data_diag.id);
    }
    // saved element, has diagram instance on graph
    else {
        var data_diag = graph.getCell(data_var.diagram);
        data_diag.attr({text: {text: data_var.text}});
        var links = graph.getConnectedLinks(data_diag, {inbound: true});
        // if links are present
        if (links.length != 0) {
            // check if the link has changed
            if (links[0].attributes.source.id != data_var.uses) {
                // redraw the link, delete the old link
                console.debug("link changed", links[0].attributes.source.id, data_var.source);
                links[0].remove();
                diag_add_link(from=data_var.source, to=data_diag.id);
            }
        // links are not present, so generate them
        } else {
            diag_add_link(from=data_var.source, to=data_diag.id);
        }
        console.info("modified artifact diagram", data_diag.id);
    }
    return data_diag.id;
};

/**
 * add param variable diagram to graph
 * @param  {dict} param_var properties and links
 * @return {bool}          operation status
 */
var diag_add_param_var = function(param_var) {
    // check for unsaved (new) elements
    if (param_var.diagram == undefined) {
        var param_diag = joint_shape_param_var.clone();
        param_diag.attr({text: {text: param_var.text}});
        param_diag.position(200, 200);
        param_diag.resize(100, 30);
        graph.addCells([param_diag]);
        console.info("added parameter variable diagram", param_diag.id);
    }
    // saved element, has diagram instance on graph
    else {
        var param_var_diag = graph.getCell(param_var.diagram);
        param_var_diag.attr({text: {text: param_var.text}});
        console.info("modified parameter variable diagram", param_var_diag.id);
    }
    return param_diag.id;
};

/**
 * add step diagram to graph
 * @param  {dict} step properties and links
 * @return {bool}          operation status
 */
var diag_add_step = function(step) {
    // check for unsaved (new) element
    if (step.diagram == undefined) {
        var step_diag = joint_shape_step.clone();
        step_diag.attr({text: {text: step.text}});
        step_diag.position(200, 200);
        step_diag.resize(100, 30);
        step_diag.addTo(graph);
        // if the element is related, draw a link for it
        step.uses.forEach(function(linked_diag, index) {
            diag_add_link(from=linked_diag, to=step_diag.id);
        });
        console.info("added step diagram", step_diag.id);
    }
    // previous saved element, has a diagram instance on graph
    else {
        var step_diag = graph.getCell(step.diagram);
        step_diag.attr({text: {text: step.text}});
        var links = graph.getConnectedLinks(step_diag, {inbound: true});
        links.forEach(function(link, index) {
            link.remove();
        })
        step.uses.forEach(function(linked_diag, index) {
            diag_add_link(from=linked_diag, to=step_diag.id);
        });
        console.info("modified step diagram", step_diag.id);
    }
    return step_diag.id;
};

console.info("loaded diagram.js");