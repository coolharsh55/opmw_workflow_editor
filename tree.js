/*
    tree.js
    tree (right panel) functions and globals

    The tree shows experiment data objects -
    data variables, parameters and steps.

    @author: Harshvardhan Pandit
    @email : me@harshp.com
 */


$('document').ready(function() {
    // on click event handler for + button in Data variables
    $('#add-data-var').click(function() {
        form_validate();
    });
    // on click event handler for + button in Parameter variables
    $('#add-param-var').click(function() {
        form_validate();
    });
    // on click event handler for + button in Step
    $('#add-step-var').click(function() {
        form_validate();
    });
    // allow expand/collapse of tree nodes
    $('.list > h5').click(function() {
        $(this).parent().find('ul').toggle();
    });
    // TODO: (remove/testing) tree experiment make form
    $('#tree-experiment').click(function() {
        make_form(experiment);
    });
});