/**
 * topological sort
 *
 * Kahn's algorithm
 * https://en.wikipedia.org/wiki/Topological_sorting
 *
 ```
    L ← Empty list that will contain the sorted elements
    S ← Set of all nodes with no incoming edges
    while S is non-empty do
        remove a node n from S
        add n to tail of L
        for each node m with an edge e from n to m do
            remove edge e from the graph
            if m has no other incoming edges then
                insert m into S
    if graph has edges then
        return error (graph has at least one cycle)
    else
        return L (a topologically sorted order)
```
 * If the graph is a DAG, a solution will be contained in the list L
 * (the solution is not necessarily unique). Otherwise, the graph must have at
 * least one cycle and therefore a topological sorting is impossible.
 */

var topological_sort = function(data) {
    var L = [];  // Empty list that will contain the sorted elements
    var S = [];  // Set of all nodes with no incoming edges
    console.log('start');
    // create S
    _.each(data, function(node, key) {
        if (node.incoming.length == 0) {
            console.log("S.push " + node._id);
            S.push(node);
        } else {
            console.log("iterated " + node._id);
        }
    });
    console.log("started with Set", S);
    // while S is non-empty do
    for(var x=0; x<100; x++){
        // remove a node n from S
        if (S.length == 0) {
            break;
        }
        var node_n = S.splice(0, 1)[0];
        console.log("S.pop " + node_n._id);
        // add n to tail of L
        L.push(node_n);
        console.log("L.push " + node_n._id);
        // for each node m with an edge e from n to m do
        var node_n_outgoing = _.clone(node_n.outgoing);
        _.each(node_n_outgoing, function(node_m) {
            // remove edge e from the graph
            // if (node_m === undefined) {
            //     return;
            // }
            node_m = data[node_m];
            console.log("removing edge", node_n._id, node_m._id);
            console.log(node_m.incoming.length, node_m.incoming);
            remove_edge(node_n, node_m);
            console.log(node_m.incoming.length, node_m.incoming);
            // if m has no other incoming edges then
            if (node_m.incoming.length == 0) {
                console.log("S.push " + node_m._id);
                if (!(_.includes(S, node_m))) {
                    S.push(node_m);
                }
            }
        });
    }
    // if graph has edges then
    _.each(data, function(node) {
        if (node.incoming.length !=0 || node.outgoing.length !=0){
            // return error (graph has at least one cycle)
            console.log('graph is not a DAG');
            return;
        }
    });
    // else
    // return L (a topologically sorted order)
    var l_sorted = [];
    _.each(L, function(node) {
        l_sorted.push(node._id);
    });
    return l_sorted;
};

var remove_edge = function(n, m) {
    console.log("removed edge from " + n._id + " to " + m._id);
    for (var i=0; i<n.outgoing.length; i++) {
        if (n.outgoing[i] == m._id) {
            n.outgoing.splice(i, 1);
            i -= 1;
            break;
        }
    }
    for (var i=0; i<m.incoming.length; i++) {
        if (m.incoming[i] == n._id) {
            m.incoming.splice(i, 1);
            i -= 1;
            break;
        }
    }
};