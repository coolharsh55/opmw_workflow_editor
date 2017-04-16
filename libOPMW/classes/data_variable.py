# data variable
#
# author: Harshvardhan Pandit
# email: coolharsh55@gmail.com
#
# A Data variable is a workflow template artifact that represents a
# variable in the workflow specification.
#
# IRI: http://www.opmw.org/ontology/DataVariable
#
# Example:
#
#     @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
#     @prefix opmw: <http://www.opmw.org/ontology/> .
#
#     <http://www.opmw.org/export/resource/DataVariable/AQUAFLOW_NTM_SUM_CORRDO>
#         a opmw:WorkflowTemplateArtifact , opmw:DataVariable ;
#         rdfs:label "Data variable Sum_CorrDO" ;
#         opmw:hasDimensionality "0"^^xsd:int ;
#         opmw:isGeneratedBy
#           <http://www.opmw.org/export/resource/WorkflowTemplateProcess/
#           AQUAFLOW_NTM_CREATEPLOTS> ;
#         opmw:correspondsToTemplate
#           <http://www.opmw.org/export/resource/
#           WorkflowTemplate/AQUAFLOW_NTM> .
#
# has super-classes: opmw:WorkflowTemplateArtifact
# is in domain of: hasDimensionality, isGeneratedBy
# is in range of: opmw:isdata_varOfTemplate, uses

import collections

from rdflib import Graph
from rdflib import URIRef, Literal

from .namespaces import namespace_manager
from .namespaces import RDF, RDFS, XSD
from .namespaces import OPMW, PROV, PPLAN, DC, DCTERMS

from .resource import RDFResource


class DataVariable(RDFResource):
    """Data Variable"""

    def __init__(self):

        # data_var URI
        # self._uri = None

        # attributes
        self._label = None
        self._dimensionality = None
        self._generated_by = None

        # links
        self._template = None
        self._used_by = []
        self._execution_artifacts = []

    # data_var URI
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
    #         raise ValueError('data variable URI must be empty or URI')

    # rdfs:label
    # label is a string for the data_var's title
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

    # opmw:hasDimensionality
    # dimensionality of the artifact: 0 for single file, 1 for collection, etc.
    # int, xsd:integer
    @property
    def dimensionality(self):
        return self._dimensionality

    @dimensionality.setter
    def dimensionality(self, value):
        if isinstance(value, int):
            self._dimensionality = Literal(value, datatype=XSD.integer)
        elif isinstance(value, Literal) and value.datatype == XSD.integer:
            self._dimensionality = value
        else:
            try:
                self.dimensionality = int(value)
            except ValueError:
                pass
                # raise ValueError('dimensionality must be a valid integer')

    # opmw:isGeneratedBy
    # links the step which generated the data variable
    # str, URI
    @property
    def generated_by(self):
        return self._generated_by

    @generated_by.setter
    def generated_by(self, value):
        if isinstance(value, str):
            self._generated_by = URIRef(value)
        elif isinstance(value, URIRef):
            self._geneated_by = value
        elif value is None:
            self._geneated_by = None
        else:
            raise ValueError('data variable URI must be empty or URI')

    # opmw:isdata_varOfTemplate
    # links the data variable to the template it was used in
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

    # opmw:uses
    # steps using this data variable
    # list of URI
    @property
    def used_by(self):
        return self._used_by

    @used_by.setter
    def used_by(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('used by should be a list')
        processes = []
        for value in values:
            if isinstance(value, URIRef):
                processes.append(value)
            else:
                try:
                    processes.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert to URI')
        self._used_by = processes

    # opmw:correspondsToTemplateArtifact
    # linked to execution artifact
    # list of URI
    @property
    def execution_artifacts(self):
        return self._execution_artifacts

    @execution_artifacts.setter
    def execution_artifacts(self, values):
        if not isinstance(values, collections.Iterable):
            raise ValueError('used by should be a list')
        artifacts = []
        for value in values:
            if isinstance(value, URIRef):
                artifacts.append(value)
            else:
                try:
                    artifacts.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert to URI')
        self._execution_artifacts = artifacts

    def validate(self):
        """validate this data_var
        returns boolean result along with error message"""
        if not self._label:
            return False, 'label is empty'
        return True, None

    @property
    def graph(self):
        """expose data_var as RDF graph
        returns rdflib.Graph"""

        graph = Graph()
        graph.namespace_manager = namespace_manager
        if not self._uri:
            raise AttributeError('paremeter URI cannot be empty')
        data_var = self._uri
        # rdf:type
        graph.add((data_var, RDF.type, OPMW.DataVariable))
        graph.add((data_var, RDF.type, OPMW.WorkflowTemplateArtifact))
        # rdfs:label
        graph.add((data_var, RDFS.label, self._label))
        # opmw:hasDimensionality
        if self._dimensionality:
            graph.add((
                data_var, OPMW.hasDimensionality, self._dimensionality))
        # opmw:isGeneratedBy
        if self._geneated_by:
            graph.add((
                data_var, OPMW.isGeneratedBy, self._geneated_by))
        # opmw:correspondsToTemplate
        if self._template:
            graph.add((
                data_var, OPMW.isVariableOfTemplate, self._template))
        return graph

    def printobject(self):
        for key in self.__dict__.keys():
            value = getattr(self, key[1:], None)
            print(key, type(value), value)

    @staticmethod
    def parse_from_graph(graph, data_var_uri):

        def _handler_for_list_of_uris(property_name):
            def _handler(data_var, value, property_name=property_name):
                values = getattr(data_var, property_name)
                values.append(value)
                setattr(data_var, property_name, values)
            return _handler

        _namespaces = [
            str(n) for n in
            (DCTERMS, RDFS, RDF, OPMW, PPLAN, PROV, DC)]

        _attribs = {
            'label': lambda p, x: setattr(p, 'label', x),
            'hasDimensionality':
                lambda p, x: setattr(p, 'dimensionality', x),
            'isVariableOfTemplate':
                lambda p, x: setattr(p, 'template', x),
            'isGeneratedBy':
                lambda p, x: setattr(p, 'generated_by', x),
            'uses': _handler_for_list_of_uris('used_by'),
            'correspondsToTemplateArtifact':
                _handler_for_list_of_uris('execution_artifacts')
        }

        data_var = DataVariable()
        data_var.uri = data_var_uri

        if not data_var_uri.startswith('<'):
            data_var_uri = '<' + data_var_uri
        if not data_var_uri.endswith('>'):
            data_var_uri += '>'

        query = '''
            SELECT ?p ?o
            WHERE {
                { %s ?p ?o }
                UNION
                { ?o ?p %s }
            }''' % (data_var_uri, data_var_uri)
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
                            handler(data_var, uri)
            # DEBUG
            data_var.printobject()
        except Exception:
            raise

        return data_var

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
    template_uri = URIRef('http://lvh.me/directed-study/harsh/data_var_A')
    DataVariable.parse_from_graph(graph, template_uri)
    graph.close()
