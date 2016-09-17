# workflow template process
#
# author: Harshvardhan Pandit
# email: me@harshp.com
#
# A workflow process template is an abstraction of the workflow execution
# process step that aims to describe the method followed by the scientist
# instead of its specific instantiation.
#
# IRI: http://www.opmw.org/ontology/WorkflowTemplate
#
# A workflow template represents the design of the workflow.
# In such design, the different steps and inputs don't have to be bound to a
# specific tool or dataset. It is a generic view of the workflow,
# which is instantiated in each execution.
#
# Example:
#
#     @prefix dc:  <http://purl.org/dc/terms/> .
#     @prefix opmw: <http://www.opmw.org/ontology/> .
#     @prefix p-plan: <http://purl.org/net/p-plan#> .
#     @prefix prov: <http://www.w3.org/ns/prov#> .
#
#     <http://www.opmw.org/export/resource/WorkflowTemplate/AQUAFLOW_NTM>
#         a opmw:WorkflowTemplate, p-plan:Plan, prov:Plan;
#         rdfs:label "AquaFlow_NTM" ;
#         dc:contributor  <http://www.opmw.org/export/resource/Agent/WATER> ;
#         dc:modified  "2011-06-08T09:57:12-07:00"^^xsd:dateTime ;
#         opmw:hasVersion "2"^^xsd:int .
#
# has super-classes: p-plan:Plan
# is in domain of:
#   created in Workflow System, has Documentation,
#   has Template Diagram, has Native System Template
# is in range of: corresponds to Template
#
# is related to:
# Data Variable: opmw:correspondsToTemplate
# Parameter Variable: opmw:correspondsToTemplate
# Workflow Execution Process: opmw:correspondsToTemplate
# Execution Account: opmw:correspondsToTemplate
#
# TODO: workflow executions

import collections
import datetime

from rdflib import Graph
from rdflib import URIRef, Literal

from .namespaces import namespace_manager
from .namespaces import RDF, RDFS, XSD
from .namespaces import OPMW, PROV, PPLAN, DC, DCTERMS

from .resource import RDFResource


class WorkflowTemplate(RDFResource):
    """Workflow Template"""

    def __init__(self):

        # template URI
        # self._uri = None

        # attributes
        self._label = None
        # TODO: contributors as collection?
        self._contributors = []
        self._modified = None
        self._version = None
        self._documentation = None
        self._workflow_system = None
        self._template_diagram = None
        self._native_system_template = None

        # links
        self._data_variables = []
        self._parameter_variables = []
        self._steps = []
        self._execution_accounts = []

    # template URI
    # @property
    # def uri(self):
    #     return self._uri

    # @uri.setter
    # def uri(self, value):
    #     if isinstance(value, str):
    #         self._uri = URIRef(value)
    #     elif isinstance(value, URIRef):
    #         self._uri = value
    #     elif value is None:
    #         self._uri = None
    #     else:
    #         raise ValueError('template URI must be empty or URI')

    # rdfs:label
    # label is a string for the template's title
    # label types can be str, xsd:string
    @property
    def label(self):
        return self._label

    @label.setter
    def label(self, value):
        if isinstance(value, str):
            self._label = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._label = value
        else:
            raise ValueError('label must be a string')

    # contributors
    # the list of dc:contributor on this template
    # contributors is a collection of valid URI as Literal or str
    @property
    def contributors(self):
        return self._contributors

    @contributors.setter
    def contributors(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('contributors should be a list')
        contributors = []
        for value in values:
            if isinstance(value, URIRef):
                contributors.append(value)
            else:
                try:
                    contributors.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert contributor to URI')
        self._contributors = contributors

    # dc:modified
    # when the template was last modified
    # str, datetime, xsd:dateTime
    @property
    def modified(self):
        return self._modified

    @modified.setter
    def modified(self, value):
        if isinstance(value, datetime.datetime):
            self._modified = Literal(value)
        elif isinstance(value, str):
            self._modified = Literal(value, datatype=XSD.dateTime)
        elif isinstance(value, Literal) and value.datatype == XSD.dateTime:
            self._modified = value
        else:
            raise ValueError('modified should be a datetime')

    # opmw:hasVersion
    # version of the template
    # is of type int or xsd:int
    @property
    def version(self):
        return self._version

    @version.setter
    def version(self, value):
        if isinstance(value, int):
            self._version = Literal(value, datatype=XSD.integer)
        elif isinstance(value, Literal) and value.datatype is XSD.integer:
            self._version = value
        else:
            try:
                self.version = int(value)
            except ValueError:
                raise ValueError('version must be a valid integer')

    # opmw:hasDocumentation
    # documentation for the template
    # str, xsd:string, URI
    @property
    def documentation(self):
        return self._documentation

    @documentation.setter
    def documentation(self, value):
        if isinstance(value, str):
            try:
                self._documentation = URIRef(value)
            except ValueError:
                pass
            else:
                return
            self._documentation = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._documentation = value
        elif isinstance(value, URIRef):
            self._documentation = value
        elif value is None:
            self._documentation = None
        else:
            raise ValueError('documentation must be empty, string or URI')

    # opmw:hasTemplateDiagram
    # template diagram URI
    # str, URI
    @property
    def template_diagram(self):
        return self._template_diagram

    @template_diagram.setter
    def template_diagram(self, value):
        if isinstance(value, str):
            self._template_diagram = URIRef(value)
        elif isinstance(value, URIRef):
            self._template_diagram = value
        elif value is None:
            self._template_diagram = None
        else:
            raise ValueError('template diagram must be empty or URI')

    # opmw:createdInWorkflowSystem
    # binds the template to the tool used for design and creation
    # str, URI
    @property
    def workflow_system(self):
        return self._workflow_system

    @workflow_system.setter
    def workflow_system(self, value):
        if isinstance(value, str):
            self._workflow_system = URIRef(value)
        elif isinstance(value, URIRef):
            self._workflow_system = value
        elif value is None:
            self._workflow_system = None
        else:
            raise ValueError('workflow system must be empty or URI')

    # opmw:hasNativeSystemTemplate
    # link to template encoded in the syntax of the workflow system
    # str, URI
    @property
    def native_system_template(self):
        return self._native_system_template

    @native_system_template.setter
    def native_system_template(self, value):
        if isinstance(value, str):
            self._native_system_template = URIRef(value)
        elif isinstance(value, URIRef):
            self._native_system_template = value
        elif value is None:
            self._native_system_template = None
        else:
            raise ValueError('native system template must be empty or URI')

    # opmw:DataVariable
    # stores URIs of data variables
    # str URI
    @property
    def data_variables(self):
        return self._data_variables

    @data_variables.setter
    def data_variables(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('data variables should be a list')
        data_vars = []
        for value in values:
            if isinstance(value, URIRef):
                data_vars.append(value)
            else:
                try:
                    data_vars.append(URIRef(value))
                except Exception:
                    raise
        self._data_variables = data_vars

    # opmw:ParameterVariable
    # stores URIs of parameter variables
    # str URI
    @property
    def parameter_variables(self):
        return self._parameter_variables

    @parameter_variables.setter
    def parameter_variables(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('parameter variables should be a list')
        parameter_vars = []
        for value in values:
            if isinstance(value, URIRef):
                parameter_vars.append(value)
            else:
                try:
                    parameter_vars.append(URIRef(value))
                except Exception:
                    raise
        self._parameter_variables = parameter_vars

    # opmw:WorkflowTemplateProcess
    # stores URIs of steps
    # str URI
    @property
    def steps(self):
        return self._steps

    @steps.setter
    def steps(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('steps should be a list')
        steps = []
        for value in values:
            if isinstance(value, URIRef):
                steps.append(value)
            else:
                try:
                    steps.append(URIRef(value))
                except Exception:
                    raise
        self._steps = steps

    @property
    def execution_accounts(self):
        return self._execution_accounts

    @execution_accounts.setter
    def execution_accounts(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('contributors should be a list')
        accounts = []
        for value in values:
            if isinstance(value, URIRef):
                accounts.append(value)
            else:
                try:
                    accounts.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert contributor to URI')
        self._execution_accounts = accounts

    def validate(self):
        """validate this template instance
        returns boolean result along with error message"""
        if not self._label:
            return False, 'label is empty'
        if not self._contributors:
            return False, 'contributors are empty'
        if not self._modified:
            return False, 'modified is empty'
        if not self._version:
            return False, 'version is empty'
        return True, None

    @property
    def graph(self):
        """expose template as RDF graph
        template: URI for template that will be associated with all attributes
        returns rdflib.Graph"""

        # create graph for template with appropriate namespaces
        graph = Graph()
        graph.namespace_manager = namespace_manager
        # get the template as a namespaced URI
        if not self._uri:
            raise AttributeError('template URI cannot be empty')
        template = self._uri
        # rdf:type
        graph.add((template, RDF.type, OPMW.WorkflowTemplate))
        graph.add((template, RDF.type, PPLAN.Plan))
        graph.add((template, RDF.type, PROV.Plan))
        # rdfs:label
        graph.add((template, RDFS.label, self._label))
        # modified
        graph.add((template, DC.modified, self._modified))
        # version
        graph.add((template, OPMW.hasVersion, self._version))
        # dcterms:contributor
        for contributor in self._contributors:
            graph.add((template, DCTERMS.contributor, contributor))
        # documentation
        graph.add((template, OPMW.hasDocumentation, self._documentation))
        # diagram
        graph.add((template, OPMW.hasTemplateDiagram, self._template_diagram))
        # workflow system
        graph.add((
            template, OPMW.createdInWorkflowSystem, self._workflow_system))
        # native system template
        graph.add((
            template, OPMW.hasNativeSystemTemplate,
            self._native_system_template))
        # data variables
        for data_var in self._data_variables:
            graph.add((
                template, OPMW.isVariableOfTemplate, data_var))
        # parameter variables
        for parameter in self._parameter_variables:
            graph.add((
                template, OPMW.isParameterOfTemplate, parameter))
        # steps
        for step in self._steps:
            graph.add((template, OPMW.isStepOfTemplate, step))

        return graph

    def printobject(self):
        for key in self.__dict__.keys():
            value = getattr(self, key[1:], None)
            print(key, type(value), value)

    @staticmethod
    def parse_from_graph(graph, template_uri):

        def _handler_for_list_of_uris(property_name):
            def _handler(template, value, property_name=property_name):
                values = getattr(template, property_name)
                values.append(value)
                setattr(template, property_name, values)
            return _handler

        _namespaces = [
            str(n) for n in
            (DCTERMS, RDFS, RDF, OPMW, PPLAN, PROV, DC)]

        _attribs = {
            'contributor': _handler_for_list_of_uris('contributors'),
            'label': lambda t, x: setattr(t, 'label', x),
            'modified': lambda t, x: setattr(t, 'modified', x),
            'version': lambda t, x: setattr(t, 'version', x),
            'hasDocumentation': lambda t, x: setattr(t, 'documentation', x),
            'createdInWorkflowSystem':
                lambda t, x: setattr(t, 'workflow_system', x),
            'hasTemplateDiagram':
                lambda t, x: setattr(t, 'template_diagram', x),
            'hasNativeSystemTemplate':
                lambda t, x: setattr(t, 'native_system_template', x),
            'isParameterOfTemplate':
                _handler_for_list_of_uris('parameter_variables'),
            'isVariableOfTemplate':
                _handler_for_list_of_uris('data_variables'),
            'isStepOfTemplate':
                _handler_for_list_of_uris('steps'),
            'correspondsToTemplate':
                _handler_for_list_of_uris('execution_accounts')
        }

        template = WorkflowTemplate()
        template.uri = template_uri

        if not template_uri.startswith('<'):
            template_uri = '<' + template_uri
        if not template_uri.endswith('>'):
            template_uri += '>'

        query = '''
            SELECT ?p ?o
            WHERE {
                { %s ?p ?o }
                UNION
                { ?o ?p %s }
            }''' % (template_uri, template_uri)
        try:
            query_results = graph.query(query)
            for attrib_type, uri in query_results:
                # DEBUG
                print(attrib_type, uri)
                for namespace in _namespaces:
                    if namespace in attrib_type:
                        attrib_type = attrib_type.split(namespace)[1]
                        if attrib_type in _attribs:
                            handler = _attribs[attrib_type]
                            handler(template, uri)
            # DEBUG
            template.printobject()
        except Exception:
            raise

        return template

if __name__ == '__main__':
    import os
    from rdflib import plugin
    from rdflib import store
    ident = URIRef("rdflib_test")
    uri = Literal(
        "sqlite:///%(here)s/development.sqlite" % {"here": os.getcwd()})
    # store = plugin.get("SQLAlchemy", Store)(identifier=ident)
    plugin.register(
        'SQLAlchemy', store.Store,
        'rdflib_sqlalchemy.SQLAlchemy', 'SQLAlchemy')
    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    template_uri = URIRef('http://lvh.me/directed-study/harsh/experiment_A')
    WorkflowTemplate.parse_from_graph(graph, template_uri)
    graph.close()
