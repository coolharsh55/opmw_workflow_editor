/*
    index.js
    globals and document events

    uses:
     - jQuery

    @author: Harshvardhan Pandit
    @email : me@harshp.com
 */

// opmw_elements holds the OPMW ontology in JSON format
// is loaded from local file - opmw.json
var OPMW = null;
// experiment data holds the experiment data produced in the workflow editor
// is a dictionary by types
var experiment_data = {};

/*
    on document ready
     - add on click event handlers
 */
$('document').ready(function() {
    /*
        load the OPMW json from file
        add element types to experiment data
        make form for experiment template
     */
    $.getJSON("http://lvh.me:8000/opmw.json", function(json) {
        OPMW = json;
        // for debug purposes, ALWAYS log the OPMW to console
        console.log("opmw.json", OPMW);
        // TODO: set up types for experiment data
        // add each type from OPMW.elements to experiment_data
        Object.keys(OPMW.elements).forEach(function(type, index) {
            experiment_data[type] = {};
        });

        // make form for experiment
        form_make(
            OPMW.begin,         // element type
            OPMW.elements[OPMW.begin]);  // element schema);
    });
});