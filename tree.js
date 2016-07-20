/*
 tree.js
 tree (right panel) functions and globals

 The tree shows experiment data objects -
 data variables, parameters and steps.

 @author: Harshvardhan Pandit
 @email : me@harshp.com
 */


$('document').ready(function() {

});

// on click event handler for + button in Data variables
$('#add-data-var').click(function() {
    form_make(
        "opmw:DataVariable",
        OPMW.elements["opmw:DataVariable"], null);
});
// on click event handler for + button in Parameter variables
$('#add-param-var').click(function() {
    form_make(
        "opmw:ParameterVariable",
        OPMW.elements["opmw:ParameterVariable"], null);
});
// on click event handler for + button in Step
$('#add-step').click(function() {
    form_make(
        "opmw:WorkflowTemplateProcess",
        OPMW.elements["opmw:WorkflowTemplateProcess"], null);
});
// allow expand/collapse of tree nodes
$('.list > h5').click(function() {
    $(this).parent().find('ul').toggle();
});


/*
 click events for tree nodes
 */

// experiment
$('#tree-experiment').click(function() {
    if (experiment_data["opmw:WorkflowTemplate"].length != 0) {
        form_make(
            "opmw:WorkflowTemplate",
            OPMW.elements["opmw:WorkflowTemplate"],
            experiment_data["opmw:WorkflowTemplate"][0]);
    } else {
        // do nothing
    }
});

// object instances
$('body').on('click', '.object-instance', function(){
    console.log('object-instance click', $(this).text());
    var object = experiment_data_labels[$(this).text()];
    form_make(
        object.type,
        OPMW.elements[object.type],
        object
    );
});
