# workflow template process
#
# author: Harshvardhan Pandit
# email: me@harshp.com
#
# A workflow process template is an abstraction of the workflow execution
# process step that aims to describe the method followed by the scientist
# instead of its specific instantiation.
#
# IRI: http://www.opmw.org/ontology/WorkflowTemplateProcess
#
# Example:
#
#     @prefix opmw: <http://www.opmw.org/ontology/> .
#     @prefix water: <http://www.isi.edu/ac/Water/library.owl#> .
#     @prefix p-plan: <http://purl.org/net/p-plan#> .
#
#     <http://www.opmw.org/export/resource/WorkflowTemplateProcess/
#         AQUAFLOW_NTM_CALCULATEHOURLYAVERAGES>
#
#         a opmw:WorkflowTemplateProcess, water:CalculateHourlyAverages,
#         p-plan:Step;
#         opmw:isStepOfTemplate
#         <http://www.opmw.org/export/resource/WorkflowTemplate/AQUAFLOW_NTM> ;
#         opmw:uses <http://www.opmw.org/export/resource/DataVariable/
#             AQUAFLOW_NTM_FILTEREDDATA>.
#
# has super-classes: p-plan:Step
# is in domain of: opmw:uses
# is in range of: opmw:correspondsToTemplateProcess, opmw:isGeneratedBy

import collections

from rdflib import Graph
from rdflib import URIRef, Literal

from .namespaces import namespace_manager
from .namespaces import RDF, RDFS, XSD
from .namespaces import OPMW, PROV, PPLAN, DC, DCTERMS

from .resource import RDFResource


class WorkflowTemplateProcess(RDFResource):
    """Workflow Template Process"""

    def __init__(self):

        # step uri
        # self._uri = None

        # attributes
        self._label = None
        self._uses = []

        # links
        self._template = None
        self._generates = []
        self._execution_processes = []

    # step uri
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
    #         raise ValueError('step URI must be empty or URI')

    # rdfs:label
    # label is a string for the step's title
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

    # opmw:uses
    # data variables and parameters used by the step
    # list or URIs
    @property
    def uses(self):
        return self._uses

    @uses.setter
    def uses(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('uses by should be a list')
        artifacts = []
        for value in values:
            if isinstance(value, URIRef):
                artifacts.append(value)
            else:
                try:
                    artifacts.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert to URI')
        self._uses = artifacts

    # opmw:isStepOfTemplate
    # linked to the template it belongs to
    # str, URI
    @property
    def template(self):
        return self._template

    @template.setter
    def template(self, value):
        if isinstance(value, str):
            try:
                self._template = URIRef(value)
            except ValueError:
                pass
            else:
                return
            self._template = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._template = value
        elif isinstance(value, URIRef):
            self._template = value
        elif value is None:
            self._template = None
        else:
            raise ValueError('template must be empty, string or URI')

    # opmw:isGeneratedBy
    # linked to artifacts generated by this step
    # list of URIs
    @property
    def generates(self):
        return self._generates

    @generates.setter
    def generates(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('artifacts by should be a list')
        artifacts = []
        for value in values:
            if isinstance(value, URIRef):
                artifacts.append(value)
            else:
                try:
                    artifacts.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert to URI')
        self._generates = artifacts

    # opmw:correspondsToTemplateProcess
    # linked to execution instances of the step
    # list of URIs
    @property
    def execution_processes(self):
        return self._execution_processes

    @execution_processes.setter
    def execution_processes(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('execution processes by should be a list')
        processes = []
        for value in values:
            if isinstance(value, URIRef):
                processes.append(value)
            else:
                try:
                    processes.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert to URI')
        self._execution_processes = processes

    def validate(self):
        if not self._label:
            return False, 'label is empty'
        if not self._template:
            return False, 'template is empty'
        return True, None

    def printobject(self):
        for key in self.__dict__.keys():
            value = getattr(self, key[1:], None)
            print(key, type(value), value)

    @property
    def graph(self):

        graph = Graph()
        graph.namespace_manager = namespace_manager
        if not self._uri:
            raise AttributeError('step URI cannot be empty')
        step = self._uri
        # rdf:type
        graph.add((step, RDF.type, OPMW.WorkflowTemplateProcess))
        # rdfs:label
        graph.add((step, RDFS.label, self._label))
        # opmw:uses
        for artifact in self._uses:
            graph.add((step, OPMW.uses, artifact))
        # opmw:isStepOfTemplate
        if self._tempalte:
            graph.add((step, OPMW.isStepOfTemplate, self._template))

    @staticmethod
    def parse_from_graph(graph, step_uri):

        def _handler_for_list_of_uris(property_name):
            def _handler(step, value, property_name=property_name):
                values = getattr(step, property_name)
                values.append(value)
                setattr(step, property_name, values)
            return _handler

        _namespaces = [
            str(n) for n in
            (DCTERMS, RDFS, RDF, OPMW, PPLAN, PROV, DC)]

        _attribs = {
            'label': lambda p, x: setattr(p, 'label', x),
            'isStepOfTemplate':
                lambda p, x: setattr(p, 'template', x),
            'uses': _handler_for_list_of_uris('uses'),
            'isGeneratedBy': _handler_for_list_of_uris('generates'),
            'correspondsToTemplateProcess':
                _handler_for_list_of_uris('execution_processes')
        }

        step = WorkflowTemplateProcess()
        step.uri = step_uri

        if not step_uri.startswith('<'):
            step_uri = '<' + step_uri
        if not step_uri.endswith('>'):
            step_uri += '>'

        query = '''
            SELECT ?p ?o
            WHERE {
                { %s ?p ?o }
                UNION
                { ?o ?p %s }
            }''' % (step_uri, step_uri)
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
                            handler(step, uri)
            # DEBUG
            step.printobject()
        except Exception:
            raise

        return step


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
    graph.open(uri)
    template_uri = URIRef('http://lvh.me/directed-study/harsh/step_M1')
    WorkflowTemplateProcess.parse_from_graph(graph, template_uri)
    graph.close()
