/**
 * serializer
 *
 * serialize experiment data to JSON
 * allow import and export of data
 *
 * publish data to server
 */


var serializer = {
    serialize: function() {
        var data = {};
        // template
        data.template = template;
        data.template.properties["opmw:createdInWorkflowSystem"] = "OPMW-Workflow-Editor";
        data.template.properties["opmw:hasNativeSystemTemplate"] = null;
        // data variables
        data.data_variables = _.cloneDeep(experiment_data_by_type.data_variable);
        Object.keys(data.data_variables).forEach(function(data_variable, index) {
            data_variable = data.data_variables[data_variable];
            for (var j=0; j<data_variable["opmw:uses"].length; j++) {
                data_variable["opmw:uses"][j] = data_variable["opmw:uses"][j]._id;
            }
            if (data_variable.properties["opmw:wasGeneratedBy"] != undefined && data_variable.properties["opmw:wasGeneratedBy"] != null) {
                data_variable.properties["opmw:wasGeneratedBy"] = data_variable.properties["opmw:wasGeneratedBy"]._id;
            }
        });

        // parameter variables
        data.parameter_variables = _.cloneDeep(experiment_data_by_type.parameter_variable)
        Object.keys(data.parameter_variables).forEach(function(parameter, index) {
            parameter = data.parameter_variables[parameter];
            for (var j=0; j<parameter["opmw:uses"].length; j++) {
                parameter["opmw:uses"][j] = parameter["opmw:uses"][j]._id;
            }
        });

        // steps
        data.steps = _.cloneDeep(experiment_data_by_type.step);
        Object.keys(data.steps).forEach(function(step, index) {
            step = data.steps[step];
            for (var j=0; j<step["opmw:wasGeneratedBy"].length; j++) {
                step["opmw:wasGeneratedBy"][j] = step["opmw:wasGeneratedBy"][j]._id;
            }
            for (var j=0; j<step.properties["opmw:uses"].length; j++) {
                step.properties["opmw:uses"][j] = step.properties["opmw:uses"][j]._id;
            }
        });

        return data;

    },

    import_data: function(data) {
        console.log(data);
        template = data.template;
        // rebuild id index
        experiment_data_by_id = {};
        experiment_data_by_diagram = {};
        experiment_data_by_label = {};
        experiment_data_by_type = {
            'template': template,
            'data_variable': data.data_variables,
            'parameter_variable': data.parameter_variables,
            'step': data.steps,
        };

        // data variables
        Object.keys(data.data_variables).forEach(function(label, index) {
            let item = data.data_variables[label];
            experiment_data_by_label[label] = item;
            experiment_data_by_id[item._id] = item;
            // TODO: diagram
        });
        // parameter variables
        Object.keys(data.parameter_variables).forEach(function(label, index) {
            let item = data.parameter_variables[label];
            experiment_data_by_label[label] = item;
            experiment_data_by_id[item._id] = item;
            // TODO: diagram
        });
        // steps
        Object.keys(data.steps).forEach(function(label, index) {
            let item = data.steps[label];
            experiment_data_by_label[label] = item;
            experiment_data_by_id[item._id] = item;
            // TODO: diagram
        });

        // re-establish links for data variables
        Object.keys(experiment_data_by_type.data_variable).forEach(function(label, index) {
            let item = experiment_data_by_type.data_variable[label];
            let object_basket = [];
            item["opmw:uses"].forEach(function(item_id, index) {
                object_basket.push(experiment_data_by_id[item_id]);
            });
            item["opmw:uses"] = object_basket;
            if (item.properties["opmw:wasGeneratedBy"] != undefined && item.properties["opmw:wasGeneratedBy"] != null) {
                item.properties["opmw:wasGeneratedBy"] = experiment_data_by_id[item.properties["opmw:wasGeneratedBy"]];
            }
        });
        // re-establish links for parameter variables
        Object.keys(experiment_data_by_type.parameter_variable).forEach(function(label, index) {
            let item = experiment_data_by_type.parameter_variable[label];
            let object_basket = [];
            item["opmw:uses"].forEach(function(item_id, index) {
                object_basket.push(experiment_data_by_id[item_id]);
            });
            item["opmw:uses"] = object_basket;
        });
        // re-establish links for steps
        Object.keys(experiment_data_by_type.step).forEach(function(label, index) {
            let item = experiment_data_by_type.step[label];
            let object_basket = [];
            item["opmw:wasGeneratedBy"].forEach(function(item_id, index) {
                object_basket.push(experiment_data_by_id[item_id]);
            });
            item["opmw:wasGeneratedBy"] = object_basket;
            object_basket = [];
            item.properties["opmw:uses"].forEach(function(item_id, index) {
                object_basket.push(experiment_data_by_id[item_id]);
            });
            item.properties["opmw:uses"] = object_basket;
        });

        // clean up previous html items
        $('#item-list-data').empty();
        $('#item-list-param').empty();
        $('#item-list-step').empty();
        // attach template to sidebar
        $('#sidebar-template-label').removeClass('sidebar-item-label-flagged');
        $('#sidebar-template-label').addClass('sidebar-item-label');
        $('#sidebar-template-label').text(template.properties["rdfs:label"]);
        // attach data variables to sidebar
        Object.keys(experiment_data_by_type.data_variable).forEach(function(label, index) {
            let item = experiment_data_by_type.data_variable[label];
            let li = null;
            if (item._status.validated) {
                li = $('<li>', {
                    id: 'sidebar-data-label' + item._id,
                    class: 'sidebar-data-label sidebar-item-label',
                    text: label,
                });
            } else {
                // pass
            }
            $('#item-list-data').append(li);
        });
        // attach parameter variables to sidebar
        Object.keys(experiment_data_by_type.parameter_variable).forEach(function(label, index) {
            let item = experiment_data_by_type.parameter_variable[label];
            let li = null;
            if (item._status.validated) {
                li = $('<li>', {
                    id: 'sidebar-parameter-label' + item._id,
                    class: 'sidebar-parameter-label sidebar-item-label',
                    text: label,
                });
            } else {
                // pass
            }
            $('#item-list-param').append(li);
        });
        // attach steps to sidebar
        Object.keys(experiment_data_by_type.step).forEach(function(label, index) {
            let item = experiment_data_by_type.step[label];
            let li = null;
            if (item._status.validated) {
                li = $('<li>', {
                    id: 'sidebar-step-label' + item._id,
                    class: 'sidebar-step-label sidebar-item-label',
                    text: label,
                });
            } else {
                // pass
            }
            $('#item-list-step').append(li);
        });

        // form_data = execution_account;
        // form_schema = execution_account;
        // form_template = template["opmw:WorkflowTemplate"];
        // form_maker = make_form_for_execution_account;
        // make_form_for_execution_account(execution_account);

        draw_graph(make_diagram_data());

    },

    export_data: function() {
        var svg = paper.toSVG(function(svgString) {
            console.log(svgString);
        });
        var data = serializer.serialize();
        console.log("exported data", data);
        data.diagram = graph.toJSON();
        console.log("exported data", data);
        var dataStr = "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(data));
        $('#btn-export').attr("href", dataStr);
    },

    encode_as_img_and_link: function() {
        var svg = document.getElementById('object-diagram').firstChild.outerHTML;
        $('<canvas/>', { id: 'canvas', width: 700, height: 900}).appendTo('body');
        console.log(svg);
        canvg('canvas', svg);
        var canvas = document.getElementById('canvas');
        // http://stackoverflow.com/questions/19032406/convert-html5-canvas-into-file-to-be-uploaded
        var blobBin = atob(canvas.toDataURL().split(',')[1]);
        canvas.parentNode.removeChild(canvas);
        var array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        var file=new Blob([new Uint8Array(array)], {type: 'image/png'});
        return file;
    },

    publish_data: function() {
        paper.toPNG(function(dataURL) {
            // var file = dataURL;
            var blobBin = atob(dataURL.split(',')[1]);
            var array = [];
            for(var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            var file=new Blob([new Uint8Array(array)], {type: 'image/png'});
            var data = serializer.serialize();
            // flatten internal _id references
            // parameters
            Object.keys(data.parameter_variables).forEach(function(label, index) {
                // resolve step opmw:uses
                let parameter = data.parameter_variables[label];
                let step_uses = [];
                parameter['opmw:uses'].forEach(function(step_id, index) {
                    step_uses.push(experiment_data_by_id[step_id].properties['rdfs:label']);
                });
            });
            // data variables
            Object.keys(data.data_variables).forEach(function(label, index) {
                let data_variable = data.data_variables[label];
                // resolve step opmw:uses
                let step_uses = [];
                data_variable['opmw:uses'].forEach(function(step_id, index) {
                    step_uses.push(experiment_data_by_id[step_id].properties['rdfs:label']);
                });
                data_variable['opmw:uses'] = step_uses;
                // resolve step opmw:isGeneratedBy
                if (data_variable.properties['opmw:wasGeneratedBy'] != undefined && data_variable.properties['opmw:wasGeneratedBy'] != null) {
                    data_variable.properties['opmw:wasGeneratedBy'] = experiment_data_by_id[data_variable.properties['opmw:wasGeneratedBy']].properties['rdfs:label'];
                    }
            });
            // steps
            Object.keys(data.steps).forEach(function(label, index) {
                let step = data.steps[label];
                // resolve parameter / data variables
                let items_used = [];
                step.properties['opmw:uses'].forEach(function(item_id, index) {
                    items_used.push(experiment_data_by_id[item_id].properties['rdfs:label']);
                });
                step.properties['opmw:uses'] = items_used;
            });

            // console.log("published", data);
            var formdata = new FormData();
            formdata.append("data", JSON.stringify(data));
            formdata.append("image", file);
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "/publish/workflowtemplate/", true);
            xhttp.send(formdata);
        });
    }
};