var label = function(item) {
    // assume it is valid
    var item_list = item.split('/');
    return item_list[item_list.length - 1];
};

var populate_list = function(data, uri_link) {
    // sort the data
    data.sort(function(a, b) {
        return a[0].localeCompare(b[0]);
    });
    var item = null;
    var content = null;
    var header = null;
    var description = null;
    data.forEach(function(result) {
        div = $('<div>', { class: 'item' });
        content = $('<div>', { class: 'content' });
        header = $('<a>', {
            class: 'header',
            href: 'http://lvh.me:5000/published/' + uri_link + '/' + label(result[0]) + '/',
            text: label(result[0])
        });
        description = $('<div>', {
            class: 'description',
            text: label(result[1])});
        content.append(header);
        content.append(description);
        div.append(content);
        $('#list').append(div);
    });
};

var query_builder = function(item) {
    var query = null;
    if (item.parameters == 1) {
        query = "SELECT ?x \
                WHERE { \
                    ?x a " + item.type + " }";
    } else if (item.parameters == 2) {
        query = "SELECT ?x ?y \
                WHERE { \
                    ?x a " + item.type + " .\
                    ?x " + item.relation + " ?y }";
    } else {
        // pass
    }
    return query;
};

var sparql_query = function(item) {
    // item: {
    //   type: opmw:something
    //
    // }

    $.ajax({
        url: "/sparql/query/run/",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ query: 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
            PREFIX opmw: <http://www.opmw.org/ontology/> \
            PREFIX opmo: <http://openprovenance.org/model/opmo#> \
            ' + query_builder(item)}),
        success: function(data, status, jqXHR) {
            if (data.error) {
                alert('request failed');
                return;
            }
            populate_list(data.results, item.uri_link);
        }
    });
};