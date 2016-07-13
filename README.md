# dev notes
-----------

## gui
------
The gui is a three panel workspace with panels for entering information (form),
displaying diagram, and selecting nodes.

### infobox
This is the panel on the left, and contains a form for entering information for
the currently active element.
 - TODO: there is a 'X' at the top to cancel the current element and remove it
 from the stack
 - the header is the element type
 - for each property, an appropriate input type is added to the form
 - text for string, select for properties with domains, 
 textarea for documentation, etc.
 - if the property is required, the input is attributed as required
 - during validation, the input is highlighted if not filled
 - TODO: for each relation, the appropriate label of the related element is shown
 along with the relation
 - TODO: the label is clickable, and will open the selected element

### diagram
TODO: element generation for diagram
The center panel is the diagram, and is created using the jointjs library.
 - There are distinct diagram for each element type.
 - Data variable, Parameter Variable, Step each have their distinct diagram
 - Once an element is saved, it is added to the diagram along with their
 links (with arrows)
 - moving the elements is permitted in the diagram
 - the diagram can be exported

### tree
The right panel is the tree, which shows a list of elements 
ordered by their types.
 - the top most element is the experiment, this is the label of the experiment
 - trees exist for variables, parameters, and steps
 - when an element is successfully added to the stack, 
 it is also added to the tree under its tree type.
 - clicking on the element highlights the element diagram and opens it 
 in the infobox panel for editing


## data types
TODO: WorkflowTemplateArtifact - why is this missing???

## files
 - index.html index.css index.js
 These are the core files that describe the operations of the workflow gui
 - form.css form.js
 These files are for the infobox
 - diagram.css diagram.js
 These files ar for the diagram
 - tree.css tree.js
 These files are the element tree
 - opmw.json
 Contains the opmw ontology adapted for use in the workflow editor
 - grid.css.map toast.css
 CSS framework for panels
