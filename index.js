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
// `experiment data labels` holds references to the various elements
// instantiated which can be accessed using their labels
// It also holds references in the tree and in the diagram
var experiment_data_labels = {};

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
    $.getJSON("opmw.json", function(json) {
        OPMW = json;
        console.info("loaded opmw.json");
        // for debug purposes, ALWAYS log the OPMW to console
        console.debug("opmw.json", OPMW);
        // TODO: set up types for experiment data
        // add each type from OPMW.elements to experiment_data
        Object.keys(OPMW.elements).forEach(function(type, index) {
            experiment_data[type] = [];
        });
        console.debug("experiment data", experiment_data);

        // make form for experiment
        form_make(
            OPMW.begin,         // element type
            OPMW.elements[OPMW.begin]);  // element schema);
    });
});

$('#form-save').click(function() {
    form_save();
});
$('#form-cancel').click(function() {
    form_cancel();
});

// input file event
// snippet copied from
// https://stackoverflow.com/questions/4950567/reading-client-side-text-file-using-javascript
document.getElementById('input-file').addEventListener('change', readFile, false);
function readFile (evt) {
   var files = evt.target.files;
   var file = files[0];
   var reader = new FileReader();
   reader.onload = function() {
     // console.debug("imported file", this.result);
     serialize_import(this.result);
   }
   reader.readAsText(file)
}

console.info('loaded index.js');