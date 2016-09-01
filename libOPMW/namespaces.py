# namespace manager
#
# declare namespaces for common use across libOPMW

from rdflib import Graph
from rdflib.namespace import Namespace, NamespaceManager
import rdflib

# redundant namespaces defined in the rdflib module
RDF = rdflib.RDF
RDFS = rdflib.RDFS
OWL = rdflib.OWL
XSD = rdflib.XSD
FOAF = rdflib.FOAF
SKOS = rdflib.SKOS
DOAP = rdflib.DOAP
DC = rdflib.DC
DCTERMS = rdflib.DCTERMS

# adding namespaces from document to the RDF graph
PROV = Namespace("http://www.w3.org/ns/prov#")
OPMW = Namespace('http://www.opmw.org/ontology/')
NS = Namespace("http://purl.org/net/opmv/ns#")
VANN = Namespace("http://purl.org/vocab/vann/")
OPMO = Namespace("http://openprovenance.org/model/opmo#")
PPLAN = Namespace("http://purl.org/net/p-plan#")
OPMV = Namespace("http://purl.org/net/opmv/ns#")

# declare namespace manager
# the namespace manager makes it easy to write URIs
# by binding a namespace with a variable, it acts like a python dictionary
# referencing objects and URIs under the namespace is the same as key-value
# namespace.key will translate to http://uri-of-namespace/key
# or http://uri-of-namespace#key if it is a literal
namespace_manager = NamespaceManager(Graph())
namespace_manager.bind('opmw', OPMW, override=False)
namespace_manager.bind('prov', PROV, override=False)
namespace_manager.bind('ns', NS, override=False)
namespace_manager.bind('opmo', OPMO, override=False)
namespace_manager.bind('vann', VANN, override=False)
namespace_manager.bind('p-plan', PPLAN, override=False)
namespace_manager.bing('opmv', OPMV, override=False)
