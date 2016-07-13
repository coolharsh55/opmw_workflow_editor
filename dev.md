# dev.md

## things to do

### adding elements to stack
 - `opmw_elements` is the ontology loaded from the json file
 - `experiment_data` is the elements in the experiment
 - the element is added to the stack after validation in form
 - the starting element is _opmw:WorkflowTemplate_ which is the experiment
 - once that is validated, it is added to experiment_data
#### experiment data
 - the elements are segregated by types variables, steps, experiment template
```
form_element = current element in form

onDocumentReady:
    make_form(
        type=opmw:WorkflowTemplate,  // type of element from opmw
        id=null)  // null id means this is a new element

make_form(element_type, id):
    clear_form_elements()
    element = opmw_elements.element_type
    form.header = element.label
    for property in element.properties:
        form.properties.add(
            property.input,  // type of input
            property.label,  // label to display
            property.required  // whether this is a required input
        )
    for relation in element.relations:
        label = relation.info
        for related_element in experiment_data[relation.domain]:
            if related_element.properties[relation.property] == this:
                form.relations.add(related_element.label)

add_element_btn():
    check_if_form_is_validated()
    save_form_element()
```
### re-edit ontology - add missing parts and bits
### establishing relation between domain-range for elements
### attaching element to diagram
### moving between elements
### arranging elements in diagram
### exporting ontology
### serializing diagram
### serializing experiment
### publish experiment
### experiment runs

