# dev.md

// Tuesday 08/02/16 at 02:03PM - 16 files in 0.08 secs

## TODO (11)
1. workflow_editor/form.js:29         remove reference to dialog element in form
2. workflow_editor/form.js:67         add node of element to tree like node-(id)
3. workflow_editor/form.js:69         update label in node when updating form
4. workflow_editor/form.js:298        add button to remove input node from list in form
5. workflow_editor/form.js:477        check, validate, save previous form data before making new one
6. workflow_editor/index.js:38        set up types for experiment data
7. workflow_editor/README.md:28       detect circular links and create separate links (separate paths)
8. workflow_editor/serialize.js:128   check integrity of imported json
9. workflow_editor/serialize.js:129   check compatibility of imported json
10. workflow_editor/serialize.js:130  check imported json adheres to schema
11. workflow_editor/serialize.js:172  check other ranges in array are in OPMW.elements


## work notes


## things to do
 
 - update label for node
 - change title of infobox to whatever type of element is being currently edited
 - BUG: fix name change being reflected in tree
 - FIXME: duplicate names are still being allowed
 - highlight elements (labels) with color

### attaching element to diagram
 - detect cycles in graph (should this be allowed)

### moving between elements
### arranging elements in diagram
### exporting ontology
 - serialize the experiment and load it back

### serializing diagram
 - serialize diagram along with experiment data?
 - restore positions, labels, links, etc?
 - serialize entire graph and restore entire graph?

### serializing experiment
 - serialize the experiment with export and import
 - export experiment data (type, labels)
 - import experiment data (type, labels)

### publish experiment
### experiment runs

