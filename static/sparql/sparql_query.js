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

$('document').ready(function() {
    $('#query-text').linedtextarea();
});

/**
 * jQuery Lined Textarea Plugin
 *   http://alan.blog-city.com/jquerylinedtextarea.htm
 *
 * Copyright (c) 2010 Alan Williamson
 *
 * Version:
 *    $Id: jquery-linedtextarea.js 464 2010-01-08 10:36:33Z alan $
 *
 * Released under the MIT License:
 *    http://www.opensource.org/licenses/mit-license.php
 *
 * Usage:
 *   Displays a line number count column to the left of the textarea
 *
 *   Class up your textarea with a given class, or target it directly
 *   with JQuery Selectors
 *
 *   $(".lined").linedtextarea({
 *      selectedLine: 10,
 *    selectedClass: 'lineselect'
 *   });
 *
 * History:
 *   - 2010.01.08: Fixed a Google Chrome layout problem
 *   - 2010.01.07: Refactored code for speed/readability; Fixed horizontal sizing
 *   - 2010.01.06: Initial Release
 *
 */
(function($) {

    $.fn.linedtextarea = function(options) {

        // Get the Options
        var opts = $.extend({}, $.fn.linedtextarea.defaults, options);


        /*
         * Helper function to make sure the line numbers are always
         * kept up to the current system
         */
        var fillOutLines = function(codeLines, h, lineNo){
            while ( (codeLines.height() - h ) <= 0 ){
                if ( lineNo == opts.selectedLine )
                    codeLines.append("<div class='lineno lineselect'>" + lineNo + "</div>");
                else
                    codeLines.append("<div class='lineno'>" + lineNo + "</div>");

                lineNo++;
            }
            return lineNo;
        };


        /*
         * Iterate through each of the elements are to be applied to
         */
        return this.each(function() {
            var lineNo = 1;
            var textarea = $(this);

            /* Turn off the wrapping of as we don't want to screw up the line numbers */
            textarea.attr("wrap", "off");
            textarea.css({resize:'none'});
            var originalTextAreaWidth   = textarea.outerWidth();

            /* Wrap the text area in the elements we need */
            textarea.wrap("<div class='linedtextarea'></div>");
            var linedTextAreaDiv    = textarea.parent().wrap("<div class='linedwrap' style='width:" + originalTextAreaWidth + "px'></div>");
            var linedWrapDiv            = linedTextAreaDiv.parent();

            linedWrapDiv.prepend("<div class='lines' style='width:50px'></div>");

            var linesDiv    = linedWrapDiv.find(".lines");
            linesDiv.height( textarea.height() + 6 );


            /* Draw the number bar; filling it out where necessary */
            linesDiv.append( "<div class='codelines'></div>" );
            var codeLinesDiv    = linesDiv.find(".codelines");
            lineNo = fillOutLines( codeLinesDiv, linesDiv.height(), 1 );

            /* Move the textarea to the selected line */
            if ( opts.selectedLine != -1 && !isNaN(opts.selectedLine) ){
                var fontSize = parseInt( textarea.height() / (lineNo-2) );
                var position = parseInt( fontSize * opts.selectedLine ) - (textarea.height()/2);
                textarea[0].scrollTop = position;
            }


            /* Set the width */
            var sidebarWidth                    = linesDiv.outerWidth();
            var paddingHorizontal       = parseInt( linedWrapDiv.css("border-left-width") ) + parseInt( linedWrapDiv.css("border-right-width") ) + parseInt( linedWrapDiv.css("padding-left") ) + parseInt( linedWrapDiv.css("padding-right") );
            var linedWrapDivNewWidth    = originalTextAreaWidth - paddingHorizontal;
            var textareaNewWidth            = originalTextAreaWidth - sidebarWidth - paddingHorizontal - 20;

            textarea.width( textareaNewWidth );
            linedWrapDiv.width( linedWrapDivNewWidth );



            /* React to the scroll event */
            textarea.scroll( function(tn){
                var domTextArea     = $(this)[0];
                var scrollTop       = domTextArea.scrollTop;
                var clientHeight    = domTextArea.clientHeight;
                codeLinesDiv.css( {'margin-top': (-1*scrollTop) + "px"} );
                lineNo = fillOutLines( codeLinesDiv, scrollTop + clientHeight, lineNo );
            });


            /* Should the textarea get resized outside of our control */
            textarea.resize( function(tn){
                var domTextArea = $(this)[0];
                linesDiv.height( domTextArea.clientHeight + 6 );
            });

        });
    };

  // default options
  $.fn.linedtextarea.defaults = {
    selectedLine: -1,
    selectedClass: 'lineselect'
  };
})(jQuery);