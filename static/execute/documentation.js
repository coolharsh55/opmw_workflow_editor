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
 TODO: today's work - 13/09/2016 6:58
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
 TODO: today's work - 12/09/2016 0:21
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
