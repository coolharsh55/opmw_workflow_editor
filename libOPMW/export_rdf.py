#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Export RDF
# author: Harshvardhan Pandit
#
# Exports OPMW linked objects to RDF format
# Uses RDFLib to export ontology
#
# Format of linked objects:
# template: workflow template object
# data: OPMW defined objects
#

import os
from rdflib import Graph
from rdflib import plugin
from rdflib import store
from rdflib import URIRef, Literal  # BNode
from rdflib.namespace import Namespace, NamespaceManager
from rdflib.namespace import RDF, RDFS, XSD

ident = URIRef("rdflib_test")
uri = Literal(
    "sqlite:///%(here)s/development.sqlite" % {"here": os.getcwd()})
# store = plugin.get("SQLAlchemy", Store)(identifier=ident)
plugin.register(
    'SQLAlchemy', store.Store,
    'rdflib_sqlalchemy.SQLAlchemy', 'SQLAlchemy')

# parse is used to link objects flattened in JSON
# from . import parse

# get data by parsing the json from browser-based workflow editor

# declare a new RDF graph
# graph = Graph()

# declare namespace manager
# the namespace manager makes it easy to write URIs
# by binding a namespace with a variable, it acts like a python dictionary
# referencing objects and URIs under the namespace is the same as key-value
# namespace.key will translate to http://uri-of-namespace/key
# or http://uri-of-namespace#key if it is a literal
namespace_manager = NamespaceManager(Graph())

# adding namespaces from document to the RDF graph
opmw = Namespace('http://www.opmw.org/ontology/')
namespace_manager.bind('opmw', opmw, override=False)

# foaf = Namespace("http://xmlns.com/foaf/0.1/")
# namespace_manager.bind('foaf', foaf, override=False)

# vann = Namespace("http://purl.org/vocab/vann/")
# namespace_manager.bind('vann', vann, override=False)

# ns = Namespace("http://purl.org/net/opmv/ns#")
# namespace_manager.bind('ns', ns, override=False)

# owl = Namespace("http://www.w3.org/2002/07/owl#")
# namespace_manager.bind('owl', owl, override=False)

dc = Namespace("http://purl.org/dc/elements/1.1/")
namespace_manager.bind('dc', dc, override=False)

dcterms = Namespace("http://purl.org/dc/terms/")
namespace_manager.bind('dcterms', dcterms, override=False)

# owl2xml = Namespace("http://www.w3.org/2006/12/owl2-xml#")
# namespace_manager.bind('owl2xml', owl2xml, override=False)

# opmo = Namespace("http://openprovenance.org/model/opmo#")
# namespace_manager.bind('opmo', opmo, override=False)

prov = Namespace("http://www.w3.org/ns/prov#")
namespace_manager.bind('prov', prov, override=False)

# pplan = Namespace("http://purl.org/net/p-plan#")
# namespace_manager.bind('p-plan', pplan, override=False)

# CUSTOM NAMESPACE - DOES NOT EXIST
# used to declare objects that need an URI (supposed to be accessed)
this_project = Namespace("http://lvh.me/directed-study/harsh/")
namespace_manager.bind('this_project', this_project, override=False)


def _graph_with_namespace():
    graph = Graph()
    graph.namespace_manager = namespace_manager
    return graph


# the graph for everything
master_graph = _graph_with_namespace()


def _serialize_turtle(graph, filename):
    filename = './this_project_' + filename + '.ttl'
    with open(filename, 'wb') as f:
        f.write(graph.serialize(format='turtle'))
        print('created', filename)


def graph_workflow_template(template):
    graph = _graph_with_namespace()
    # add the workflow template using it's label as the identifier
    n_template = this_project[template['rdfs:label']]
    graph.add((n_template, RDF.type, opmw.WorkflowTemplate))
    graph.add((n_template, RDF.type, prov.Plan))
    # label
    graph.add((n_template, RDFS.label, Literal(template['rdfs:label'])))
    # contributors
    for contributor in template['dcterms:contributor']:
        graph.add((n_template, dcterms.contributor, URIRef(contributor)))
    # documentation
    graph.add((
        n_template, opmw.hasDocumentation,
        Literal(template['opmw:hasDocumentation'])))
    # diagram
    graph.add((
        n_template, opmw.hasTemplateDiagram,
        URIRef(template['opmw:hasTemplateDiagram'])))
    # created in
    graph.add((
        n_template, opmw.createdInWorkflowSystem,
        URIRef(template['opmw:createdInWorkflowSystem'])))
    # native system template
    graph.add((
        n_template, opmw.hasNativeSystemTemplate,
        URIRef(template['opmw:hasNativeSystemTemplate'])))
    # links
    for link_type, link_items in template['links'].items():
        uri = opmw[link_type.split(':')[1]]
        for link_item in link_items:
            graph.add((
                URIRef(link_item),
                uri, n_template))

    return graph


def graph_parameter(parameter):
    graph = _graph_with_namespace()
    n_parameter = this_project[parameter['rdfs:label']]
    graph.add((n_parameter, RDF.type, opmw.ParameterVariable))
    graph.add((n_parameter, RDF.type, opmw.WorkflowTemplateArtifact))
    # label
    graph.add((n_parameter, RDFS.label, Literal(parameter['rdfs:label'])))
    # dimensionality
    graph.add((
        n_parameter, opmw.hasDimensionality,
        Literal(parameter['opmw:hasDimensionality'], datatype=XSD.int)))
    # template
    graph.add((
        n_parameter, opmw.isParameterOfTemplate,
        this_project[parameter['opmw:isParameterOfTemplate']]))
    # links
    for link_type, link_items in parameter['links'].items():
        uri = opmw[link_type.split(':')[1]]
        for link_item in link_items:
            graph.add((
                URIRef(this_project[link_item]),
                uri, n_parameter))

    return graph


def graph_variable(variable):
    graph = _graph_with_namespace()
    n_variable = this_project[variable['rdfs:label']]
    graph.add((n_variable, RDF.type, opmw.ParameterVariable))
    graph.add((n_variable, RDF.type, opmw.WorkflowTemplateArtifact))
    # label
    graph.add((n_variable, RDFS.label, Literal(variable['rdfs:label'])))
    # dimensionality
    graph.add((
        n_variable, opmw.hasDimensionality,
        Literal(variable['opmw:hasDimensionality'], datatype=XSD.int)))
    # template
    graph.add((
        n_variable, opmw.isVariableOfTemplate,
        this_project[variable['opmw:isVariableOfTemplate']]))
    # is generated by
    if variable['opmw:isGeneratedBy']:
        graph.add((
            n_variable, opmw.isGeneratedBy,
            this_project[variable['opmw:isGeneratedBy']]))
    # links
    for link_type, link_items in variable['links'].items():
        uri = opmw[link_type.split(':')[1]]
        for link_item in link_items:
            graph.add((
                URIRef(this_project[link_item]),
                uri, n_variable))

    return graph


def graph_step(step):
    graph = _graph_with_namespace()
    n_step = this_project[step['rdfs:label']]
    graph.add((n_step, RDF.type, opmw.WorkflowTemplateProcess))
    # label
    graph.add((n_step, RDFS.label, Literal(step['rdfs:label'])))
    # uses
    if step['opmw:uses']:
        for item in step['opmw:uses']:
            graph.add((
                n_step, opmw.uses,
                this_project[item]))
    # template
    graph.add((
        n_step, opmw.isStepOfTemplate,
        this_project[step['opmw:isStepOfTemplate']]))
    # links
    for link_type, link_items in step['links'].items():
        uri = opmw[link_type.split(':')[1]]
        for link_item in link_items:
            graph.add((
                URIRef(this_project[link_item]),
                uri, n_step))

    return graph


type_mappings = {
    'opmw:WorkflowTemplate': graph_workflow_template,
    'opmw:ParameterVariable': graph_parameter,
    'opmw:DataVariable': graph_variable,
    'opmw:WorkflowTemplateProcess': graph_step
}


def append_graph(graph_item):
    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    graph += graph_item
    graph.close()


def get_experiments(label):
    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    experiments = list(graph.subjects(RDF.type, opmw.WorkflowTemplate))
    graph.close()
    return experiments


def sparql_query(query):
    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    try:
        results = list(graph.query(query))
    except Exception as e:
        error = str(e)
        return None, error
    finally:
        graph.close()
    return results, None
