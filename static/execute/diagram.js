// diagram handler for workflow execution

var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $('#object-diagram'),
    width: 700,
    height: 900,
    gridSize: 10,
    // perpendicularLinks: true,
    // interactive: false,
    model: graph
});

var _diagram_size = {
    artifact: { height: 25, width: 50 },
    connector: { height: 10, width: 15 },
    step: { height: 25, width: 100 }
};

var _artifact_color = {
    'data': '#285526',
    'parameter': '#E29414',
    'data_output': '#032553'
};

var reference_diagram_connector = new joint.shapes.basic.Rect({
    size: { height: 10, width: 15 },
    attrs: {
        rect: { fill: '#FEC288', stroke: 'black', style: { 'pointer-events': 'none' }},
    }
});

var reference_diagram_artifact = new joint.shapes.basic.Ellipse({
    size: { height: 25, width: 100 },
    attrs: {
        ellipse: { stroke: 'black' },
        text: {
            fill: 'white',
            'font-size': 8,
            'font-variant': 'small-caps',
            'font-weight': 'bold'
        }
    }
});

var reference_diagram_step = new joint.shapes.basic.Rect({
    size: { height: 25, width: 100 },
    attrs: {
        rect: { fill: '#FEC288', stroke: 'black'},
        text: {
            fill: 'black',
            'font-size': 8,
            'font-variant': 'small-caps',
            'font-weight': 'bold'
        }
    }
});

var _make_step = function(data) {
    var step = reference_diagram_step.clone();
    step.attr({ text: { text: data.label }});
    step.attr('id', data.id);
    // step.position(100, 200);
    // graph.addCell(step);
    return step;
};

var _make_artifact = function(data) {
    var artifact = reference_diagram_artifact.clone();
    artifact.attr({ text: { text: data.label }});
    artifact.attr('ellipse/fill', _artifact_color[data.type]);
    artifact.attr('id', data.id);
    // artifact.position(200, 100);
    // graph.addCell(artifact);
    return artifact;
};

var _link_cells = function(source_id, target_id) {
    var link = new joint.dia.Link({
        source: { id: source_id },
        target: { id: target_id },
        smooth: false,
        attrs: {
            '.marker-target': { d: 'M 4 0 L 0 2 L 4 4 z'}
        }});
    return link;
};

// topological sort
// var data = {
//     s_a: {
//         _id: 's_a',
//         type: 'step',
//         incoming: ['p_a', 'd_a'],
//         outgoing: ['d_b']
//     },
//     s_b: {
//         _id: 's_b',
//         type: 'step',
//         incoming: ['p_a', 'd_b'],
//         outgoing: ['d_d']
//     },
//     s_c: {
//         _id: 's_c',
//         type: 'step',
//         incoming: ['p_b', 'd_c', 'd_d'],
//         outgoing: ['d_e']
//     },
//     d_a: {
//         _id: 'd_a',
//         type: 'data',
//         incoming: [],
//         outgoing: ['s_a']
//     },
//     p_a: {
//         _id: 'p_a',
//         type: 'parameter',
//         incoming: [],
//         outgoing: ['s_a', 's_b']
//     },
//     d_b: {
//         _id: 'd_b',
//         type: 'data_output',
//         incoming: ['s_a'],
//         outgoing: ['s_b']
//     },
//     d_c: {
//         _id: 'd_c',
//         type: 'data',
//         incoming: [],
//         outgoing: ['s_c']
//     },
//     d_d: {
//         _id: 'd_d',
//         type: 'data_output',
//         incoming: ['s_b'],
//         outgoing: ['s_c']
//     },
//     d_e: {
//         _id: 'd_e',
//         type: 'data_output',
//         incoming: ['s_c'],
//         outgoing: []
//     },
//     p_b: {
//         _id: 'p_b',
//         type: 'parameter',
//         incoming: [],
//         outgoing: ['s_c']
//     },
// };

var draw_graph = function(data) {
    // data = {
    //  label: {
    //      _id: 'id',
    //      type: 'data/data_output/step',
    //      incoming: [],
    //      outgoing: []
    //  }
    // }
    // var data = _.cloneDeep(data);
    console.log("data", data);
    // return;
    var t_data = topological_sort(_.cloneDeep(data));
    console.log("topological sort", t_data);
    // _.each(t_data, function(node_id) {
    //     var corresponding_node = experiment_data_by_id[node_id];
    //     _.each(corresponding_node.properties, function(property, label) {
    //         if (label.indexOf('opmw:corresponds') >= 0) {
    //             console.log(property);
    //         }
    //     });
    // });
    // return;
    var cells = [];
    var links = [];
    var cell_index = {};

    var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'blue' }, text: { text: 'exp', fill: 'white' } }
    });
    cells.push(rect);

    _.each(t_data, function(node, label) {
        node = data[node];
        var prop = {
            id: node.id,
            label: node.id,
            type: node.type
        };
        var cell = null;
        // console.log(node, node.type);
        if (node.type === 'step') {
            cell = _make_step(prop);
        } else {
            cell = _make_artifact(prop);
        }
        cells.push(cell);
        cell_index[node.id] = cell.id;
    });
    _.each(t_data, function(node, label) {
        node = data[node];
        // console.log(node.incoming, node.outgoing);
        if (node.incoming.length == 0) {
            links.push(_link_cells(rect.id, cell_index[node.id]));
        }
        if (node.incoming.length == 0 || node.outgoing.length == 0) {
            return;
        }
        _.each(node.incoming, function(source) {
            links.push(_link_cells(cell_index[source], cell_index[node.id]));
        });
        _.each(node.outgoing, function(target) {
            links.push(_link_cells(cell_index[node.id], cell_index[target]));
        });
    });
    // console.log(cells);
    // console.log(cells.length, links.length);
    var all_cells = cells.concat(links);
    // console.log(cells.length);

    cells[0].position(200, 50);

    graph.resetCells(all_cells);

    var graphLayout = new joint.layout.TreeLayout({
        graph: graph,
        gap: 50,
        siblingGap: 50,
        direction: 'B'
    });
    graphLayout.layout();
    rect.remove();
    _.each(cells, function(cell) {
        graph.removeLinks(cell);
    });
    _.each(data, function(node, label) {
        _.each(node.outgoing, function(target) {
            graph.addCell(_link_cells(cell_index[node.id], cell_index[target]));
        });
    });
}
