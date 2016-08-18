# Workflow Editor

Harshvardhan Pandit

------

The **workflow editor** is used to document experimental workflows using _Semantic Web_ and _Linked Open Data_ standards. It uses the [**OPMW**](http://www.opmw.org) to describe experiments. The workflow editor consists of a browser-based GUI and a server for hosting the experiment graph. Experiments can be published using the server as RDF graphs.

## GUI

The GUI consists of a browser based page which contains two sections for entering the information (form) and for displaying the diagram. Users enter information in the form, and the corresponding experiment graph is generated in memory, and displayed as a digram.

The first item that needs to be entered is the Experiment information (workflow template), following which parameters, data variables, and steps can be added to the experiment. The buttons at the top are used to add items. The template button is used to access the experiment template once it is saved. The buttons at the right allow the experiment to be published, exported, and imported.

Each item is saved by clicking the save button, which persists the form contents in a graph in memory, and adds a corresponding diagram. Any relations with other items are generated as links. The cancel button re-loads the item from memory and discards any changes made in the form. Linked items are displayed at the bottom as 'Relations'.

### Import / Export

The import / export format is JSON and the graph is flattened to prevent recursive links to items.

### Publish

The experiment is published by sending the data to the server, which adds the experiment to the interal graph, which is serialized on disk. 

### SPARQL

Queries can be run on the graph using SPARQL. The page for querying and displaying results is available at `/sparql/query`. 

## Experiment items (OPMW)

-   WorkflowTemplate (experiment)
-   ParameterVariable (parameter)
-   DataVariable ([data] variable)
-   WorkflowTemplateProcess (step)

## Source

### Browser Editor

-   `index.html index.css index.js`  are the core files that describe the operations of the workflow gui
-   `form.css form.js`  files are for the infobox
-   `diagram.css diagram.js`  files ar for the diagram
-   `serialize.js` used for publish, import, and export 
-   `opmw.json`  the opmw ontology adapted for use in the workflow editor

### Server

-   `main.py` flask app
-   `libOPMW` python module for RDF graph

## Requirements

### Browser Editor

-   jQuery, jQuery-UI
-   Semantic-UI
-   Joint.js
    -   lodash
    -   backbone

### Server

-   Flask (python microframework)
-   RDFLib
-   Arrow (datetime)
-   SQLAlchemy (RDF SQLite persistence)