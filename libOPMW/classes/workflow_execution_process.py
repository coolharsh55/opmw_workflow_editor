# workflow execution process
#
# author: Harshvardhan Pandit
# email: me@harshp.com
#
# A workflow execution process represents the execution of a step in a
# workflow template. The execution process also describes the specific method
# used to acomplish the task described in the proces template.
#
# IRI: http://www.opmw.org/ontology/WorkflowExecutionProcess
#
# Example:
#
#     @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
#     @prefix opmw: <http://www.opmw.org/ontology/> .
#     @prefix opmv: <http://purl.org/net/opmv/ns#> .
#     @prefix prov: <http://www.w3.org/ns/prov#> .
#     @prefix opmo: <http://openprovenance.org/model/opmo#> .
#
#     <http://www.opmw.org/export/resource/WorkflowExecutionProcess/
#     CONVERTTOSTANDARDFORMAT133553>
#         a opmw:/WorkflowExecutionProcess , opmv:Process, prov:Activity ;
#         rdfs:label "Execution process ConvertToStandardFormat" ;
#         opmo:account
#           <http://www.opmw.org/export/resource/WorkflowExecutionAccount/
#           ACCOUNT1335533097598> ;
#         opmv:used
#           <http://www.opmw.org/export/resource/
#           WorkflowExecutionArtifact/6C7CF277338D9590EE18534D4D78924F> ;
#         opmv:wasControlledBy
#           <http://www.opmw.org/export/resource/Agent/ADMIN> ;
#         opmw:correspondsToTemplateProcess
#           <http://www.opmw.org/export/resource/WorkflowTemplateProcess/
#           CONVERTTOSTANDARDFORMAT> .
#
# has super-classes: opmv:Process, prov:Activity
# is in domain of:
#   opmw:hasExecutableComponent, opwm:correspondsToTemplateProcess
# is in range of: None

import collections

from rdflib import Graph
from rdflib import URIRef, Literal

from .namespaces import namespace_manager
from .namespaces import RDF, RDFS, XSD
from .namespaces import OPMV, OPMW, OPMO, PROV, PPLAN, DC, DCTERMS

from .resource import RDFResource


class WorkflowExecutionProcess(RDFResource):
    """Workflow Execution Account"""

    def __init__(self):

        # execution process uri
        self._uri = None

        # attributes
        self._label = None
        self._controller = None
        self._component = None

        # links
        self._account = None
        self._generates = None
        self._used = []
        self._template_process = None

    @property
    def uri(self):
        return self._uri

    @uri.setter
    def uri(self, value):
        if isinstance(value, str):
            self._uri = URIRef(value)
        elif isinstance(value, URIRef):
            self._uri = value
        else:
            raise ValueError('label must be a string')
        print(self._uri)

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

    @property
    def controller(self):
        return self._controller

    @controller.setter
    def controller(self, value):
        if isinstance(value, str):
            try:
                self._controller = URIRef(value)
            except ValueError:
                pass
            else:
                return
            self._controller = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._controller = value
        elif isinstance(value, URIRef):
            self._controller = value
        elif value is None:
            self._template = None
        else:
            raise ValueError('controller must be empty, string or URI')

    @property
    def component(self):
        return self._component

    @component.setter
    def component(self, value):
        if isinstance(value, str):
            try:
                self._component = URIRef(value)
            except ValueError:
                pass
            else:
                return
            self._component = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._component = value
        elif isinstance(value, URIRef):
            self._component = value
        elif value is None:
            self._template = None
        else:
            raise ValueError('component must be empty, string or URI')

    @property
    def account(self):
        return self._account

    @account.setter
    def account(self, value):
        if isinstance(value, str):
            try:
                self._account = URIRef(value)
            except ValueError:
                pass
            else:
                return
            self._account = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._account = value
        elif isinstance(value, URIRef):
            self._account = value
        elif value is None:
            self._template = None
        else:
            raise ValueError('account must be empty, string or URI')

    @property
    def generates(self):
        return self._generates

    @generates.setter
    def generates(self, value):
        if isinstance(value, str):
            try:
                self._generates = URIRef(value)
            except ValueError:
                pass
            else:
                return
            self._generates = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._generates = value
        elif isinstance(value, URIRef):
            self._generates = value
        elif value is None:
            self._template = None
        else:
            raise ValueError('generates must be empty, string or URI')

    @property
    def template_process(self):
        return self._template_process

    @template_process.setter
    def template_process(self, value):
        if isinstance(value, str):
            try:
                self._template_process = URIRef(value)
            except ValueError:
                pass
            else:
                return
            self._template_process = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._template_process = value
        elif isinstance(value, URIRef):
            self._template_process = value
        elif value is None:
            self._template = None
        else:
            raise ValueError('controller must be empty, string or URI')

    @property
    def used(self):
        return self._used

    @used.setter
    def used(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('used should be a list')
        artifacts = []
        for value in values:
            if isinstance(value, URIRef):
                artifacts.append(value)
            else:
                try:
                    artifacts.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert to URI')
        self._used = artifacts

    def validate(self, debug=False):
        message = None
        status = True
        if not self._label:
            status, message = False, 'label is empty'
        if not self._account:
            status, message = False, 'account is empty'
        if not self._template_process:
            status, message = False, 'template process is empty'
        if debug:
            return status, message
        return status

    @property
    def graph(self):
        graph = Graph()
        graph.namespace_manager = namespace_manager
        if not self._uri:
            raise AttributeError('URI cannot be empty')
        process = self._uri
        # rdf:type
        graph.add((process, RDF.type, OPMW.WorkflowExecutionProcess))
        graph.add((process, RDF.type, OPMV.Process))
        graph.add((process, RDF.type, PROV.Activity))
        # rdfs:label
        graph.add((process, RDFS.label, self._label))
        # opmw:wasControlledBy
        if self._controller:
            graph.add((process, OPMW.wasControlledBy, self._controller))
        # opmw:hasExecutableComponent
        if self._component:
            graph.add((process, OPMW.hasExecutableComponent, self._component))
        # opmo:account
        graph.add((process, OPMO.account, self._account))
        # opmw:correspondsToTemplateProcess
        graph.add((
            process, OPMW.correspondsToTemplateProcess,
            self._template_process))
        # opmw:hasExecutableComponent
        print(self._component)
        graph.add((process, OPMW.hasExecutableComponent, self._component))
        # opmw:used
        for artifact in self._used:
            graph.add((process, OPMV.used, artifact))
        return graph

    def printobject(self):
        for key in self.__dict__.keys():
            value = getattr(self, key[1:], None)
            print(key, type(value), value)

    @staticmethod
    def parse_from_graph(graph, process_uri):

        def _handler_for_list_of_uris(property_name):
            def _handler(step, value, property_name=property_name):
                values = getattr(step, property_name)
                values.append(value)
                setattr(step, property_name, values)
            return _handler

        _namespaces = [
            str(n) for n in
            (DCTERMS, RDFS, RDF, OPMW, OPMV, OPMO, PPLAN, PROV, DC)]

        _attribs = {
            RDFS.label: lambda p, x: setattr(p, 'label', x),
            OPMV.used: _handler_for_list_of_uris('used'),
            OPMO.account: lambda p, x: setattr(p, 'account', x),
            OPMW.correspondsToTemplateProcess:
                lambda p, x: setattr(p, 'template_process', x),
            OPMV.wasControlledBy: lambda p, x: setattr(p, 'controller', x),
            OPMW.hasExecutableComponent:
                lambda p, x: setattr(p, 'component', x),
            OPMV.wasGeneratedBy: lambda p, x: setattr(p, 'generates', x)
        }

        process = WorkflowExecutionProcess()
        process.uri = process_uri

        if not process_uri.startswith('<'):
            process_uri = '<' + process_uri
        if not process_uri.endswith('>'):
            process_uri += '>'

        query = '''
            SELECT ?p ?o
            WHERE {
                { %s ?p ?o }
                UNION
                { ?o ?p %s }
            }''' % (process_uri, process_uri)
        try:
            query_results = graph.query(query)
            for attrib_type, uri in query_results:
                # DEBUG
                for namespace in _namespaces:
                    if namespace in attrib_type:
                        if attrib_type in _attribs:
                            handler = _attribs[attrib_type]
                            handler(process, uri)
        except Exception:
            raise

        return process


if __name__ == '__main__':
    # import os
    # from rdflib import plugin
    # from rdflib import store
    # ident = URIRef("rdflib_test")
    # uri = Literal(
    #     "sqlite:///%(here)s/development.sqlite" % {"here": os.getcwd()})
    # # store = plugin.get("SQLAlchemy", Store)(identifier=ident)
    # plugin.register(
    #     'SQLAlchemy', store.Store,
    #     'rdflib_sqlalchemy.SQLAlchemy', 'SQLAlchemy')
    # graph = Graph('SQLAlchemy', identifier=ident)
    # graph.open(uri)
    graph = Graph()
    graph.parse('execution_process.ttl', format='turtle')
    process_uri = (
        'http://www.opmw.org/export/resource/WorkflowExecutionProcess/'
        'SELECTQUESTIONS1348621567824')
    WorkflowExecutionProcess.parse_from_graph(graph, process_uri)
    graph.close()
