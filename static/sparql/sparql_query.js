// sparql_query.js
// script for sparql queries on graph
// author: Harshvardhan Pandit


/**
 * populate page with results table
 * @param  {json} data   response from server
 */
var populate_results = function(data, status, jqXHR) {
    // check for errors
    if (data.error) {
        $('#results-body').empty();
        $('#results-body').append($('<div>', {
            class: "ui error message",
            text: data.error_message
        }));
        return;
    }
    // get the data from results
    var results = data.results;
    var columns = data.columns;
    // get table body
    var results_list = $('#results-body');
    // clear previous contents
    results_list.empty();
    // check for no results, and return if true
    if (columns == 0) {
        results_list.append($('<div>', {
            class: "ui message",
            text: "no results"
        }));
        return;
    }

    // results header
    var header = $('#results-header');
    // clear out previous contents
    header.empty();
    // generate column header names
    for(var j=0; j<columns; j++) {
        header.append($('<th>', {
            text: "col " + (j+1)
        }));
    };

    // results table
    for(var i=0; i<results.length; i++) {
        var row = $('<tr>');
        for(var j=0; j<columns; j++) {
            var cell = $('<td>', {
                text: results[i][j]
            });
            row.append(cell);
        };
        results_list.append(row);
    };
};

/**
 * submit query text from form
 */
$('#form-submit').on('click', function() {
    $.ajax({
        url: "/sparql/query/run/",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ query: $('#query-text').val() }),
        success: populate_results
    });
});
