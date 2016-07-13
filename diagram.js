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
    width: 720,
    height: 700,
    model: graph,
    gridSize: 1
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
        ellipse: { fill: 'green'},
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
        ellipse: { fill: 'orange'},
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
var joint_shape_data_var_op = new joint.shapes.basic.Ellipse({
    attrs: {
        ellipse: { fill: 'darkblue'},
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
        rect: { fill: 'yellow', rx: 5, ry:5},
        text: { text: 'step', fill: 'black'}
    }
});


/*
    create a basic diagram - for testing purpose
 */
// data var
var d1 = joint_shape_data_var.clone();
d1.attr({text: {text: 'data var 1'}});
d1.position(100, 30);
d1.resize(100, 30);
// parameter var
var p1 = joint_shape_param_var.clone();
p1.attr({text: {text: 'param var 1'}});
p1.position(250, 30);
p1.resize(100, 30);
// step
var s1 = joint_shape_step.clone();
s1.attr({text: {text: "step 1"}});
s1.position(200, 100);
s1.resize(100, 30);
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
