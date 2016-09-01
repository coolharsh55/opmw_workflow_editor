# graph.py
#
# using RDF graph
# stored as SQLite using SQLAlchemy

import os
from rdflib import Graph
from rdflib import plugin
from rdflib import store
from rdflib import URIRef, Literal  # BNode

import namespaces

GRAPH_IDENT = URIRef("rdflib_test")
GRAPH_URI = Literal(
    "sqlite:///%(here)s/development.sqlite" % {"here": os.getcwd()})
plugin.register(
    'SQLAlchemy', store.Store,
    'rdflib_sqlalchemy.SQLAlchemy', 'SQLAlchemy')


def namespaced_graph():
    graph = Graph()
    graph.namespace_manager = namespaces.namespace_manager
    return graph


class GraphWrapper(object):
    def __enter__(self):
        self.graph = Graph('SQLAlchemy', identifier=GRAPH_IDENT)
        self.graph.open(GRAPH_URI, create=True)
        return self.graph

    def __exit__(self, type, value, traceback):
        self.graph.close()
