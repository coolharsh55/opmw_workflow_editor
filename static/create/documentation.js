/**
 * execute workflow
 *
 * The overall structure of the project is to be as verbose as possible.
 * No clever hacks, no clever design patterns.
 * Just write plain repetitive code focused to some specific use case,
 * and be done with it.
 *
 * TODO: write here about files and their roles
 * TODO: write here about how it works in the browser
 *
 */

/*
 today's work - 25/09/2016 14:55
 There are a lot of extra factors to take in to consideration when adapting the
 execute workflow into the create workflow. For one, all the data, params, and
 steps in execute are already set. There are no new objects to create. The data
 model is static, bound to the template being executed. Whereas, in this case,
 the template itself is being created. So there are a lot more use cases.
 While they are all trivial to implement, they still have to be mapped out.
 Case in point - the experiments can no longer be attached to their
 template uri, they must be accessible by their label. And when the label
 changes, the object must be re-allocated on the index again.
 Certain things have to be changed and are to be done, as listed here:
  - make sure all form functions add extra properties
  - make sure all processes show related / attached objects in the form
  - the dropdown / select is not guaranteed to work, add log messages now
  - the data.js needs to be updated: add tempales for objects, and add
    experiment_data_by_label index
  - upon save completion, add the object to the index
  - change the html for create, add buttons for adding vars and steps
  - add object to delete object (this is going to be tricky)
 */

/*
 today's work - 13/09/2016 6:58
 Found a bug while coding the import function in serializer.
 The opmw:wasGeneratedBy link in step looks like an empty array. It should have
 contained the values (ids) for all artifacts it generated.
 Another thing to complete upon importing data is to add the labels to the
 sidebar and then call form_maker on execution_account.
 In lieu of today's meeting, I'm not sure what is expected of me.
 Though I have an idea that Dave expects' some form of "output", as in having
 alfredo's notes in the editor, and then the generated page.
 Found another bug as I was writing the python code to add execution account to
 the graph. The account's overallEndTime is not serialized in export,
 and I'm sure it isn't sent to the server as well.
 Just realized that even though I have added extra properties to the editor,
 there is no way to add them via libOPMW. I need to add that feature.
 Found another thing I did - I do not think much ahead when programming, which
 is a really bad habit. So this time, when I was adding components to the
 execution process in python,
 I realized that I had not set components as a list, and instead had it set to
 be a singular entity.
 */

/*
 today's work - 12/09/2016 0:21
 I've set a sample experiment template via flask.
 Use this template to test this.
 The execution account part is (mostly) over.
 Set the document-ready part to set template attributes to execution account.
 Then write code for generating labels in the sidebar for all artifacts and
 steps. Also display the template uri.
 Then add handlers and methods for all the artifacts and steps.
 Might do well to section the document into logical pieces.
 Add bit of comments between each section so that related methods remain near
 each other. Shouldn't take much time.
 Hopefully, but the end of the day, this piece of work should be over.
 The main thing is to then publish this (execution account) and display it
 as being linked to the template in the browser.
 That might take an additional few hours.
 I think the demo tomorrow is expected to contain Alfredo's experiments as
 adapted to the OPMW and published (viewable) using my tool.
 Might mean that I'm working tomorrow night as well.
 */
