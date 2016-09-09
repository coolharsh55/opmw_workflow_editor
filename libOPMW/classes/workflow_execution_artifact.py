import collections

from rdflib import Graph
from rdflib import URIRef, Literal

from .namespaces import namespace_manager
from .namespaces import RDF, RDFS, XSD
from .namespaces import OPMV, OPMW, OPMO, PROV

from .resource import RDFResource


class WorkflowExecutionArtifact(RDFResource):
    """Workflow Execution Artifact

    A Workflow Execution Artifact represents a resource used or generated
    in the execution of a workflow.

    IRI: http://www.opmw.org/ontology/WorkflowExecutionArtifact

    Example:

    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix opmw: <http://www.opmw.org/ontology/> .
    @prefix opmv: <http://purl.org/net/opmv/ns#> .
    @prefix prov: <http://www.w3.org/ns/prov#> .
    @prefix opmo: <http://openprovenance.org/model/opmo#> .

    <http://www.opmw.org/export/resource/WorkflowExecutionArtifact/25F1016C12EBE301EE7AADBC0B085C45>
        a       opmw:WorkflowExecutionArtifact , opmv:Artifact, prov:Entity;
        rdfs:label
            "Execution artifact with id: 25f1016c12ebe301ee7aadbc0b085c45" ;
        opmo:account
            <http://www.opmw.org/export/resource/WorkflowExecutionAccount/
            ACCOUNT1335533097598> ;
        opmv:wasGeneratedBy
            <http://www.opmw.org/export/resource/WorkflowExecutionProcess/p1> ;
        opmw:hasLocation
            "http://wings.isi.edu/opmexport/resource/1/144/
            Formatted_SMN_2010_03_10Z"^^xsd:anyURI ;
        opmw:hasSize "8618"^^xsd:int ;
        opmw:correspondsToTemplateArtifact
            <http://www.opmw.org/export/resource/DataVariable/
            AQUAFLOW_EDM_FORMATTEDDATA>.

    has super-classes: opmv:Artifact, prov:Entity
    is in domain of:
        opmw:hasFileName, opmw:hasLocation, opmw:hasSize,
        opmw:correspondsToTemplateArtifact, opmw:hasValue
    is in range of: None """

    types = (OPMV.Artifact, OPMW.WorkflowExecutionArtifact)

    def __init__(self):

        # attributes
        self._label = None
        self._account = None
        self._generated_by = None
        self._filename = None
        self._location = None
        self._size = None
        self._template_artifact = None

        # links
        self._used_by = []

    # rdfs:label
    # label is a string for the artifacts title
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

    # opmo:account
    @property
    def account(self):
        return self._account

    @account.setter
    def account(self, value):
        if isinstance(value, str):
            self._account = URIRef(value)
        elif isinstance(value, URIRef):
            self._account = value
        elif value is None:
            self._account = None
        else:
            raise ValueError('account URI must be empty or URI')

    # opmw:isGeneratedBy
    # links the step which generated the artifact
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
            raise ValueError('could not parse URI')

    # opmw:hasFileName
    @property
    def filename(self):
        return self._filename

    @filename.setter
    def filename(self, value):
        if isinstance(value, Literal) and value.datatype == XSD.string:
            self._filename = value
        else:
            self._filename = Literal(value, datatype=XSD.string)

    # opmw:hasLocation
    @property
    def location(self):
        return self._location

    @location.setter
    def location(self, value):
        if isinstance(value, URIRef):
            self._location = value
        else:
            self._location = URIRef(value)

    # opmw:hasSize
    @property
    def size(self):
        return self._size

    @size.setter
    def size(self, value):
        if isinstance(value, Literal) and value.datatype == XSD.integer:
            self._size = value
        else:
            self._size = Literal(value, datatype=XSD.int)

    @property
    def template_artifact(self):
        return self._template_artifact

    @template_artifact.setter
    def template_artifact(self, value):
        if isinstance(value, URIRef):
            self._template_artifact = value
        else:
            self._template_artifact = URIRef(value)

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

    def validate(self):
        """validate this artifact
        returns boolean result along with error message"""
        if not self._label:
            return False, 'label is empty'
        if not self._account:
            return False, 'account is empty'
        if not self._template_artifact:
            return False, 'template artifact is empty'
        return True, None

    @property
    def graph(self):
        """expose artifact as RDF graph
        returns rdflib.Graph"""

        graph = Graph()
        graph.namespace_manager = namespace_manager
        if not self._uri:
            raise AttributeError('paremeter URI cannot be empty')
        artifact = self._uri
        # rdf:type
        graph.add((artifact, RDF.type, OPMV.Artifact))
        graph.add((artifact, RDF.type, PROV.Entity))
        graph.add((artifact, RDF.type, OPMW.WorkflowExecutionArtifact))
        # rdfs:label
        graph.add((artifact, RDFS.label, self._label))
        # opmo:account
        graph.add((artifact, OPMO.account, self._account))
        # opmw:wasGeneratedBy
        if self._geneated_by:
            graph.add((artifact, OPMW.wasGeneratedBy, self._geneated_by))
        # opmw:hasFileName
        if self._filename:
            graph.add((artifact, OPMW.hasFileName, self._filename))
        # opmw:hasLocation
        if self._location:
            graph.add((artifact, OPMW.hasLocation, self._location))
        # opmw:hasSize
        if self._size:
            graph.add((artifact, OPMW.hasSize, self._size))
        # opmw:correspondsToTemplateArtifact
        graph.add((
            artifact, OPMW.correspondsToTemplateArtifact,
            self._template_artifact))
        # opmw:uses
        for process in self._used_by:
            graph.add((process, OPMW.uses, artifact))

        return graph

    def printobject(self):
        for key in self.__dict__.keys():
            value = getattr(self, key[1:], None)
            print(key, type(value), value)

    @staticmethod
    def parse_from_graph(graph, artifact_uri):

        def _handler_for_list_of_uris(property_name):
            def _handler(artifact, value, property_name=property_name):
                values = getattr(artifact, property_name)
                values.append(value)
                setattr(artifact, property_name, values)
            return _handler

        # TODO: remove namespace, not required, see example here
        # _namespaces = [
        #     str(n) for n in
        #     (DCTERMS, RDFS, RDF, OPMV, OPMO, OPMW, PPLAN, PROV, DC)]

        def _print(a, x):
            print('----', a, x)

        _attribs = {
            RDFS.label: lambda a, x: setattr(a, 'label', x),
            OPMO.account: lambda a, x: setattr(a, 'account', x),
            OPMV.wasGeneratedBy: lambda a, x: setattr(a, 'generated_by', x),
            OPMW.hasFileName: lambda a, x: setattr(a, 'filename', x),
            OPMW.hasLocation: lambda a, x: setattr(a, 'location', x),
            OPMW.hasSize: lambda a, x: setattr(a, 'size', x),
            OPMW.correspondsToTemplateArtifact:
                lambda a, x: setattr(a, 'template_artifact', x),
            OPMV.used: _handler_for_list_of_uris('used_by')
        }

        artifact = WorkflowExecutionArtifact()
        artifact.uri = artifact_uri

        if not artifact_uri.startswith('<'):
            artifact_uri = '<' + artifact_uri
        if not artifact_uri.endswith('>'):
            artifact_uri += '>'

        query = '''
            SELECT ?p ?o
            WHERE {
                { %s ?p ?o }
                UNION
                { ?o ?p %s }
            }''' % (artifact_uri, artifact_uri)
        try:
            query_results = graph.query(query)
            for attrib_type, uri in query_results:
                # DEBUG
                # print(attrib_type, uri)
                if attrib_type in _attribs:
                    handler = _attribs[attrib_type]
                    handler(artifact, uri)
            # DEBUG
            artifact.printobject()
        except Exception:
            raise

        return artifact

if __name__ == '__main__':
    # import os
    # from rdflib import plugin
    # from rdflib import store
    # ident = URIRef("rdflib_test")
    # uri = Literal(
    #     "sqlite:///%(here)s/development.sqlite" % {"here": os.getcwd()})
    # store = plugin.get("SQLAlchemy", Store)(identifier=ident)
    # plugin.register(
    #     'SQLAlchemy', store.Store,
    #     'rdflib_sqlalchemy.SQLAlchemy', 'SQLAlchemy')
    # graph = Graph('SQLAlchemy', identifier=ident)
    # graph.open(uri)
    graph = Graph()
    graph.parse('execution_artifact.ttl', format='turtle')
    artifact_uri = (
        'http://www.opmw.org/export/resource/'
        'WorkflowExecutionArtifact/291F67EDB8AAD7F18B8C1233C516A739')
    WorkflowExecutionArtifact.parse_from_graph(graph, artifact_uri)
    graph.close()
