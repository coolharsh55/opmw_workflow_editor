# dev.md

// Saturday 07/30/16 at 01:26PM - 16 files in 0.28 secs

## TODO (19)
1. workflow_editor/diagram.js:151    create separate function for adding links
2. workflow_editor/diagram.js:220    multiple links will be present to check from
3. workflow_editor/diagram.js:312    multiple links will be present to check from
4. workflow_editor/form.js:131       return array of linked diagrams
5. workflow_editor/form.js:193       add form data to form element
6. workflow_editor/form.js:205       add values to array
7. workflow_editor/form.js:233       property and relation resolution
8. workflow_editor/form.js:284       restore field value
9. workflow_editor/form.js:329       add multi-select field type to form
10. workflow_editor/form.js:331      restore field value
11. workflow_editor/form.js:335      restore textarea value
12. workflow_editor/form.js:358      check, validate, save previous form data before making new one
13. workflow_editor/index.js:37      set up types for experiment data
14. workflow_editor/README.md:28     detect circular links and create separate links (separate paths)
15. workflow_editor/README.md:29     the diagram can be exported
16. workflow_editor/README.md:38     clicking on the element highlights the element diagram
17. workflow_editor/serialize.js:92  check integrity of imported json
18. workflow_editor/serialize.js:93  check compatibility of imported json
19. workflow_editor/serialize.js:94  check imported json adheres to schema


## things to do
 
 - multi-select
 - restore textarea contents upon element reload
 - multiple text inputs for input dimension="multi"
 - check: form object does not remain the same after changing forms
 - update label for node
 - remove relations for step (e.g.) where value is empty
 - change title of infobox to whatever type of element is being currently edited
 - BUG: fix name change being reflected in tree
 - FIXME: duplicate names are still being allowed

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

