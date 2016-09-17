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
        data.template = template;
        data.execution_account = _.cloneDeep(execution_account);
        data.artifacts = _.cloneDeep(experiment_data_by_type.artifact);
        data.processes = _.cloneDeep(experiment_data_by_type.process);
        // TODO: serialize graph
        // data.jointjs_graph = null;

        // flatten objects
        // execution account
        for (var i=0; i<data.execution_account["opmw:account"].length; i++) {
            data.execution_account["opmw:account"][i] = data.execution_account["opmw:account"][i]._id;
        }
        // artifacts
        for (var i=0; i<data.artifacts.length; i++) {
            var artifact = data.artifacts[i];
            for (var j=0; j<artifact["opmw:used"].length; j++) {
                artifact["opmw:used"][j] = artifact["opmw:used"][j]._id;
            }
            if (artifact.properties.hasOwnProperty("opmw:wasGeneratedBy") && artifact.properties["opmw:wasGeneratedBy"] !== null) {
                artifact.properties["opmw:wasGeneratedBy"] = artifact.properties["opmw:wasGeneratedBy"]._id;
            }
        }
        // steps
        for (var i=0; i<data.processes.length; i++) {
            var step = data.processes[i];
            for (var j=0; j<step.properties["opmw:used"].length; j++) {
                step.properties["opmw:used"][j] = step.properties["opmw:used"][j]._id;
            }
            for (var j=0; j<step["opmw:wasGeneratedBy"].length; j++) {
                step["opmw:wasGeneratedBy"][j] = step["opmw:wasGeneratedBy"][j]._id;
            }
        }

        return data;

    },

    import_data: function(data) {
        console.log(data);
        template = data.template;
        execution_account = data.execution_account;
        experiment_data_by_type.account = execution_account;
        experiment_data_by_type.artifact = data.artifacts;
        experiment_data_by_type.process = data.processes;

        // rebuild id index
        experiment_data_by_id = {};
        // experiment_data_by_type = {};
        experiment_data_by_template_uri = {};

        experiment_data_by_id[execution_account._id] = execution_account;
        experiment_data_by_type.account = execution_account;
        experiment_data_by_template_uri[execution_account.properties["opmw:correspondsToTemplate"]] = execution_account;

        // clean up previous html items
        $('#item-list-data').empty();
        $('#item-list-param').empty();
        $('#item-list-step').empty();

        $('#sidebar-execution-account-label').removeClass('sidebar-item-label-flagged');
        $('#sidebar-execution-account-label').addClass('sidebar-item-label');
        $('#sidebar-execution-account-label').text(execution_account.properties["rdfs:label"]);

        for (var i=0; i<data.artifacts.length; i++) {
            var artifact = data.artifacts[i];
            experiment_data_by_id[artifact._id] = artifact;
            experiment_data_by_template_uri[artifact.properties["opmw:correspondsToTemplateArtifact"]] = artifact;
            artifact["opmw:used"] = [];

            if (artifact._status.validated) {
                var li = $('<li>', {
                    id: 'sidebar-artifact-label' + artifact._id,
                    class: 'sidebar-artifact-label sidebar-item-label',
                    text: artifact.properties["rdfs:label"]
                });
            } else {
                var li = $('<li>', {
                    id: 'sidebar-artifact-label' + artifact._id,
                    class: 'sidebar-artifact-label sidebar-item-label-flagged',
                    text: 'label not set'
                });
                li.append($('<span>', {
                    id: 'sidebar-artifact-template-uri' + artifact._id,
                    class: 'sidebar-template-uri',
                    text: object.properties["opmw:correspondsToTemplateArtifact"]
                }));
            }
            if (artifact.properties.hasOwnProperty("opmw:wasGeneratedBy")) {
                $('#item-list-data').append(li);
            } else {
                $('#item-list-param').append(li);
            }
        }

        for (var i=0; i<data.processes.length; i++) {
            var step = data.processes[i];
            experiment_data_by_id[step._id] = step;
            experiment_data_by_template_uri[step.properties["opmw:correspondsToTemplateProcess"]] = step;
            for (var j=0; j<step.properties["opmw:used"].length; j++) {
                step.properties["opmw:used"][j] = experiment_data_by_id[step.properties["opmw:used"][j]];
                step.properties["opmw:used"][j]["opmw:used"].push(step);
            }
            step["opmw:wasGeneratedBy"] = [];

            if (step._status.validated) {
                var li = $('<li>', {
                    id: 'sidebar-step-label' + step._id,
                    class: 'sidebar-step-label sidebar-item-label',
                    text: step.properties["rdfs:label"]
                });
            } else {
                var li = $('<li>', {
                    id: 'sidebar-step-label' + step._id,
                    class: 'sidebar-step-label sidebar-item-label-flagged',
                    text: 'label not set'
                });
                li.append($('<span>', {
                    id: 'sidebar-step-template-uri' + step._id,
                    class: 'sidebar-template-uri',
                    text: object.properties["opmw:correspondsToTemplateProcess"]
                }));
            }
            $('#item-list-step').append(li);
        }

        for (var i=0; i<data.artifacts.length; i++) {
            var artifact = data.artifacts[i];
            if (artifact.properties.hasOwnProperty("opmw:wasGeneratedBy") && artifact.properties["opmw:wasGeneratedBy"] !== null) {
                artifact.properties["opmw:wasGeneratedBy"] = experiment_data_by_id[artifact.properties["opmw:wasGeneratedBy"]];
                artifact.properties["opmw:wasGeneratedBy"]["opmw:wasGeneratedBy"].push(artifact);
            }
        }

        form_data = execution_account;
        form_schema = execution_account;
        form_template = template["opmw:WorkflowTemplate"];
        form_maker = make_form_for_execution_account;
        make_form_for_execution_account(execution_account);
    },

    export_data: function() {
        var data = serializer.serialize();
        console.log("exported data", data);
        var dataStr = "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(data));
        $('#btn-export').attr("href", dataStr);
    },

    publish_data: function() {
        var data = serializer.serialize();
        console.log("published", data);
        var formdata = new FormData();
        // formdata.append("image", file);
        formdata.append("data", JSON.stringify(data));
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/publish/workflowexecution/", true);
        xhttp.send(formdata);
    }
};