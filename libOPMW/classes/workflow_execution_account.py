# workflow execution account
#
# author: Harshvardhan Pandit
# email: me@harshp.com
#
# A workflow execution account represents the execution view from the
# perspective of the system.
#
# IRI: http://www.opmw.org/ontology/WorkflowExecutionAccount
#
# Example:
#
#     @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
#     @prefix opmw: <http://www.opmw.org/ontology/> .
#     @prefix opmo: <http://openprovenance.org/model/opmo#> .
#     @prefix prov: <http://www.w3.org/ns/prov#> .
#
#     <http://www.opmw.org/export/resource/WorkflowExecutionAccount/
#       ACCOUNT1335533097598>
#         a       opmo:Account , prov:Bundle, opmw:WorkflowExecutionAccount ;
#         rdfs:label "Execution account created on 1335533097598" ;
#         opmw:executedInWorkflowSystem
#           <http://www.opmw.org/export/resource/Agent/SHELL> ;
#         opmw:hasEndTime "2012-04-25T07:17:48-07:00"^^xsd:dateTime ;
#         opmw:hasExecutionDiagram
#               "http://wind.isi.edu/marbles/assets/components/
#               Water/runs/run_144.png"^^xsd:anyURI ;
#         opmw:overallStartTime
#               "2012-04-25T07:17:05-07:00"^^xsd:dateTime ;
#         opmw:hasStatus "SUCCESS" ;
#
# has super-classes: opmo:Account, prov:Bundle
# is in domain of:
#   opmw:correspondsToTemplate, opmw:executedInWorkflowSystem,
#   opmw:overallEndTime, opmw:hasExecutionDiagram, opmw:hasStartTime,
#   opmw:hasStatus, opmw:hasOriginalLogFile
# is in range of: None


import collections
import datetime

from rdflib import Graph
from rdflib import URIRef, Literal

from .namespaces import namespace_manager
from .namespaces import RDF, RDFS, XSD
from .namespaces import OPMO, OPMW, PROV, PPLAN, DC, DCTERMS

from .resource import RDFResource


class WorkflowExecutionAccount(RDFResource):
    """Workflow Execution Process"""

    def __init__(self):

        # execution account uri
        self._uri = None

        # attributes
        self._label = None
        self._workflow_system = None
        self._end_time = None
        self._diagram = None
        self._start_time = None
        self._status = None
        self._log_file = None

        # links
        self._template = None
        # self._parameter_variables = []
        # self._data_variables = []
        # self._steps = []
        self._is_account_of = []

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

    @property
    def end_time(self):
        return self._end_time

    @end_time.setter
    def end_time(self, value):
        if isinstance(value, datetime.datetime):
            self._end_time = Literal(value)
        elif isinstance(value, str):
            self._end_time = Literal(value, datatype=XSD.dateTime)
        elif isinstance(value, Literal) and value.datatype == XSD.dateTime:
            self._end_time = value
        else:
            raise ValueError('end_time should be a datetime')

    @property
    def start_time(self):
        return self._start_time

    @start_time.setter
    def start_time(self, value):
        if isinstance(value, datetime.datetime):
            self._start_time = Literal(value)
        elif isinstance(value, str):
            self._start_time = Literal(value, datatype=XSD.dateTime)
        elif isinstance(value, Literal) and value.datatype == XSD.dateTime:
            self._start_time = value
        else:
            raise ValueError('start_time should be a datetime')

    @property
    def diagram(self):
        return self._diagram

    @diagram.setter
    def diagram(self, value):
        if isinstance(value, str):
            self._diagram = URIRef(value)
        elif isinstance(value, URIRef):
            self._diagram = value
        elif value is None:
            self._diagram = None
        else:
            raise ValueError('diagram must be empty or URI')

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        if isinstance(value, str):
            self._status = Literal(value, datatype=XSD.string)
        elif isinstance(value, Literal) and value.datatype == XSD.string:
            self._status = value
        else:
            raise ValueError('status must be a string')

    @property
    def log_file(self):
        return self._log_file

    @log_file.setter
    def log_file(self, value):
        if isinstance(value, str):
            self._log_file = URIRef(value)
        elif isinstance(value, URIRef):
            self._log_file = value
        elif value is None:
            self._log_file = None
        else:
            raise ValueError('log file must be empty or URI')

    @property
    def template(self):
        return self._template

    @template.setter
    def template(self, value):
        if isinstance(value, str):
            self._template = URIRef(value)
        elif isinstance(value, URIRef):
            self._template = value
        elif value is None:
            self._template = None
        else:
            raise ValueError('template must be empty or URI')

    # opmw:WorkflowExecutionArtifact
    # stores URIs of data variables
    # str URI
    # @property
    # def data_variables(self):
    #     return self._data_variables

    # @data_variables.setter
    # def data_variables(self, values):
    #     if not isinstance(values, collections.Iterable):
    #         raise ValueError('data variables should be a list')
    #     data_vars = []
    #     for value in values:
    #         if isinstance(value, URIRef):
    #             data_vars.append(value)
    #         else:
    #             try:
    #                 data_vars.append(URIRef(value))
    #             except Exception:
    #                 raise
    #     self._data_variables = data_vars

    # opmw:WorkflowExecutionArtifact
    # stores URIs of execution artifacts that are parameter variables
    # str URI
    # @property
    # def parameter_variables(self):
    #     return self._parameter_variables

    # @parameter_variables.setter
    # def parameter_variables(self, values):
    #     if not isinstance(values, collections.Iterable):
    #         raise ValueError('parameter variables should be a list')
    #     parameter_vars = []
    #     for value in values:
    #         if isinstance(value, URIRef):
    #             parameter_vars.append(value)
    #         else:
    #             try:
    #                 parameter_vars.append(URIRef(value))
    #             except Exception:
    #                 raise
    #     self._parameter_variables = parameter_vars

    # opmw:WorkflowExecutionArtifact
    # stores URIs of steps
    # str URI
    # @property
    # def steps(self):
    #     return self._steps

    # @steps.setter
    # def steps(self, values):
    #     if not isinstance(values, collections.Iterable):
    #         raise ValueError('steps should be a list')
    #     steps = []
    #     for value in values:
    #         if isinstance(value, URIRef):
    #             steps.append(value)
    #         else:
    #             try:
    #                 steps.append(URIRef(value))
    #             except Exception:
    #                 raise
    #     self._steps = steps

    @property
    def is_account_of(self):
        return self._is_account_of

    @is_account_of.setter
    def is_account_of(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('values should be a list')
        resources = []
        for value in values:
            if isinstance(value, URIRef):
                resources.append(value)
            else:
                try:
                    resources.append(URIRef(value))
                except Exception:
                    raise
        self._is_account_of = resources

    def validate(self):
        """validate this execution account
        returns boolean result along with error message"""
        if not self._label:
            return False, 'label is empty'
        if not (self._start_time and self._end_time):
            return False, 'timestamps absent'
        if not self._status:
            return False, 'status empty'
        if not self._template:
            return False, 'template uri not provided'
        return True, None

    @property
    def graph(self):
        """expose execution account as RDF graph
        return rdflib.Graph"""

        graph = Graph()
        graph.namespace_manager = namespace_manager
        if not self._uri:
            raise AttributeError('URI cannot be empty')
        account = self._uri
        # rdf:type
        graph.add((account, RDF.type, OPMW.WorkflowExecutionAccount))
        graph.add((account, RDF.type, OPMO.Account))
        graph.add((account, RDF.type, PROV.Bundle))
        # rdfs:label
        graph.add((account, RDFS.label, self._label))
        # opmw:overallStartTime
        graph.add((account, OPMW.overallStartTime, self._start_time))
        # opmw:hasEndTime
        graph.add((account, OPMW.overallEndTime, self._end_time))
        # opmw:hasStatus
        graph.add((account, OPMW.hasStatus, self._status))
        # opmw:hasExecutionDiagram
        if self._diagram:
            graph.add((account, OPMW.hasExecutionDiagram, self._diagram))
        # opmw:executedInWorkflowSystem
        if self._workflow_system:
            graph.add((
                account, OPMW.executedInWorkflowSystem, self._workflow_system))
        # opmw:correspondsToTemplate
        graph.add((account, OPMW.correspondsToTemplate, self._template))
        # opmw:hasOriginalLogFile
        if self._log_file:
            graph.add((account, OPMW.hasOriginalLogFile, self._log_file))

        # # data variables
        # for data_var in self._data_variables:
        #     graph.add((account, OPMO.Account, data_var))
        # # parameter variables
        # for parameter in self._parameter_variables:
        #     graph.add((account, OPMO.Account, parameter))
        # # steps
        # for step in self._steps:
        #     graph.add((account, OPMO.Account, step))
        for item in self._is_account_of:
            graph.add((account, OPMW.Account, item))

        return graph

    def printobject(self):
        for key in self.__dict__.keys():
            value = getattr(self, key[1:], None)
            print(key, type(value), value)

    @staticmethod
    def parse_from_graph(graph, account_uri):

        def _handler_for_list_of_uris(property_name):
            def _handler(template, value, property_name=property_name):
                values = getattr(template, property_name)
                values.append(value)
                setattr(template, property_name, values)
            return _handler

        _namespaces = [
            str(n) for n in
            (DCTERMS, RDFS, RDF, OPMW, OPMO, PPLAN, PROV, DC)]

        _attribs = {
            'label': lambda a, x: setattr(a, 'label', x),
            'hasStatus': lambda a, x: setattr(a, 'status', x),
            'executedInWorkflowSystem':
                lambda a, x: setattr(a, 'workflow_system', x),
            'correspondsToTemplate': lambda a, x: setattr(a, 'template', x),
            'hasExecutionDiagram': lambda a, x: setattr(a, 'diagram', x),
            'overallStartTime': lambda a, x: setattr(a, 'start_time', x),
            'hasOriginalLogFile': lambda a, x: setattr(a, 'log_file', x),
            'overallEndTime': lambda a, x: setattr(a, 'end_time', x),
            'account': _handler_for_list_of_uris('is_account_of')
        }

        account = WorkflowExecutionAccount()
        account.uri = account_uri

        if not account.uri.startswith('<'):
            account_uri = '<' + account_uri
        if not account.uri.endswith('<'):
            account_uri += '>'

        query = '''
            SELECT ?p ?o
            WHERE {
                { %s ?p ?o }
                UNION
                { ?o ?p %s }
            }''' % (account_uri, account_uri)
        try:
            query_results = graph.query(query)
            for attrib_type, uri in query_results:
                print(attrib_type, uri)
                for namespace in _namespaces:
                    if namespace in attrib_type:
                        attrib_type = attrib_type.split(namespace)[1]
                        if attrib_type in _attribs:
                            handler = _attribs[attrib_type]
                            handler(account, uri)
            account.printobject()
            return account
        except Exception:
            raise


if __name__ == '__main__':
    import os
    from rdflib import plugin
    from rdflib import store
    # ident = URIRef("rdflib_test")
    # uri = Literal(
    #     "sqlite:///%(here)s/development.sqlite" % {"here": os.getcwd()})
    # store = plugin.get("SQLAlchemy", Store)(identifier=ident)
    # plugin.register(
    #     'SQLAlchemy', store.Store,
    #     'rdflib_sqlalchemy.SQLAlchemy', 'SQLAlchemy')
    # graph = Graph('SQLAlchemy', identifier=ident)
    graph = Graph()
    graph.parse('account.ttl', format='turtle')
    account_uri = 'http://www.opmw.org/export/resource/WorkflowExecutionAccount/ACCOUNT1348621567824'
    WorkflowExecutionAccount.parse_from_graph(graph, account_uri)
    graph.close()
