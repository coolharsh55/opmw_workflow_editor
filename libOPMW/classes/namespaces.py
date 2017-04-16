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
SKOS = Namespace('http://www.w3.org/2004/02/skos/core#')
DOAP = Namespace('http://usefulinc.com/ns/doap#')
FOAF = Namespace('http://xmlns.com/foaf/0.1/')
DC = Namespace('http://purl.org/dc/elements/1.1/')
DCTERMS = Namespace('http://purl.org/dc/terms/')
VOID = Namespace('http://rdfs.org/ns/void#')

# adding namespaces from document to the RDF graph
PROV = Namespace("http://www.w3.org/ns/prov#")
OPMW = Namespace('http://www.opmw.org/ontology/')
OPMV = Namespace('http://purl.org/net/opmv/ns#')
NS = Namespace("http://purl.org/net/opmv/ns#")
VANN = Namespace("http://purl.org/vocab/vann/")
OPMO = Namespace("http://openprovenance.org/model/opmo#")
PPLAN = Namespace("http://purl.org/net/p-plan#")

this_project = Namespace("http://lvh.me/directed-study/harsh/")

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
namespace_manager.bind('skos', SKOS, override=False)
namespace_manager.bind('doap', DOAP, override=False)
namespace_manager.bind('foaf', FOAF, override=False)
namespace_manager.bind('dc', DC, override=False)
namespace_manager.bind('dcterms', DCTERMS, override=False)
namespace_manager.bind('void', VOID, override=False)
namespace_manager.bind('opmv', OPMV, override=False)
namespace_manager.bind('this_project', this_project, override=False)
