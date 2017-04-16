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


def serialize_entire_graph(filename):
    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    filename = './export/this_project_' + filename + '.ttl'
    with open(filename, 'wb') as f:
        f.write(graph.serialize(format='turtle'))
        print('created', filename)
    graph.close()


def serialize_graph(graph, filename):
    filename = './export/' + filename + '.ttl'
    with open(filename, 'wb') as f:
        f.write(graph.serialize(format='turtle'))
        print('created', filename)


def graph_workflow_template(data):
    template = data['template']
    graph = _graph_with_namespace()
    # add the workflow template using it's label as the identifier
    n_template = this_project[template['properties']['rdfs:label']]
    graph.add((n_template, RDF.type, opmw.WorkflowTemplate))
    graph.add((n_template, RDF.type, prov.Plan))
    # label
    graph.add((
        n_template, RDFS.label, Literal(template['properties']['rdfs:label'])))
    # version
    graph.add((
        n_template, opmw.versionNumber, Literal(
            template['properties']['opmw:versionNumber'])))
    # contributors
    for contributor in template['properties']['dcterms:contributors']:
        graph.add((
            n_template, dcterms.contributor,
            URIRef(
                this_project['people/{}'.format(
                    contributor.replace(' ', '-'))])))
    # documentation
    graph.add((
        n_template, opmw.hasDocumentation,
        Literal(template['properties']['opmw:hasDocumentation'])))
    # diagram
    graph.add((
        n_template, opmw.hasTemplateDiagram,
        URIRef(this_project['images/{}'.format(template['image'])])))
    # created in
    graph.add((
        n_template, opmw.createdInWorkflowSystem,
        URIRef(template['properties']['opmw:createdInWorkflowSystem'])))
    # native system template
    # graph.add((
    #     n_template, opmw.hasNativeSystemTemplate, None))
    # links

    # for link_type, link_items in template['links'].items():
    #     uri = opmw[link_type.split(':')[1]]
    #     for link_item in link_items:
    #         graph.add((
    #             URIRef(this_project[link_item]),
    #             uri, n_template))

    return graph


def graph_workflow_template_variation(data):
    template = data['template']
    graph = _graph_with_namespace()
    # add the workflow template using it's label as the identifier
    n_template = this_project[template['properties']['rdfs:label']]
    graph.add((n_template, RDF.type, opmw.WorkflowTemplate))
    graph.add((n_template, RDF.type, prov.Plan))
    # label
    graph.add((
        n_template, RDFS.label, Literal(template['properties']['rdfs:label'])))
    # contributors
    for contributor in template['properties']['dcterms:contributors']:
        graph.add((
            n_template, dcterms.contributor,
            URIRef(
                this_project['people/{}'.format(
                    contributor.replace(' ', '-'))])))
    # documentation
    graph.add((
        n_template, opmw.hasDocumentation,
        Literal(template['properties']['opmw:hasDocumentation'])))
    # diagram
    graph.add((
        n_template, opmw.hasTemplateDiagram,
        URIRef(this_project['images/{}'.format(template['image'])])))
    # created in
    graph.add((
        n_template, opmw.createdInWorkflowSystem,
        URIRef(template['properties']['opmw:createdInWorkflowSystem'])))
    graph.add((
        n_template, this_project['isVariationOf'], URIRef(data['base_template'])))
    # native system template
    # graph.add((
    #     n_template, opmw.hasNativeSystemTemplate, None))
    # links

    # for link_type, link_items in template['links'].items():
    #     uri = opmw[link_type.split(':')[1]]
    #     for link_item in link_items:
    #         graph.add((
    #             URIRef(this_project[link_item]),
    #             uri, n_template))

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
    # for link_type, link_items in parameter['links'].items():
    #     uri = opmw[link_type.split(':')[1]]
    #     for link_item in link_items:
    #         graph.add((
    #             URIRef(this_project[link_item]),
    #             uri, n_parameter))

    return graph


def graph_variable(variable):
    graph = _graph_with_namespace()
    n_variable = this_project[variable['rdfs:label']]
    graph.add((n_variable, RDF.type, opmw.DataVariable))
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
    # for link_type, link_items in variable['links'].items():
    #     uri = opmw[link_type.split(':')[1]]
    #     for link_item in link_items:
    #         graph.add((
    #             URIRef(this_project[link_item]),
    #             uri, n_variable))

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
    # for link_type, link_items in step['links'].items():
    #     uri = opmw[link_type.split(':')[1]]
    #     for link_item in link_items:
    #         graph.add((
    #             URIRef(this_project[link_item]),
    #             uri, n_step))

    return graph


type_mappings = {
    'opmw:WorkflowTemplate': graph_workflow_template,
    'opmw:WorkflowTemplateVariation': graph_workflow_template_variation,
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


def check_template_exists(label):
    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    try:
        query = '''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            SELECT ?label
            WHERE {
              ?s rdfs:label "%s" .
              ?s a  <http://www.opmw.org/ontology/WorkflowTemplate>
            }''' % label
        results = list(graph.query(query))
        if len(results) > 0:
            return True
        return False
    except Exception:
        return False
    finally:
        graph.close()


def get_template(label):

    def get_component_query(component, relation, template_uri):
        return '''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX opmw: <http://www.opmw.org/ontology/>
            SELECT ?uri ?label
            WHERE {
              ?uri a opmw:%s .
              ?uri opmw:%s <%s> .
              ?uri rdfs:label ?label .
            }''' % (component, relation, template_uri)

    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    try:
        query = '''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX opmw: <http://www.opmw.org/ontology/>
            SELECT ?uri
            WHERE {
              ?uri rdfs:label "%s" .
              ?uri a  opmw:WorkflowTemplate
            }''' % label
        template_uri = list(graph.query(query))
        if len(template_uri) == 0:
            raise Exception('template URI cannot be found')
        template_uri = template_uri[0][0]
        print(template_uri)

        query = get_component_query(
            'DataVariable', 'isVariableOfTemplate', template_uri)
        data_vars = list(graph.query(query))
        print(data_vars)

        query = get_component_query(
            'ParameterVariable', 'isParameterOfTemplate', template_uri)
        parameters = list(graph.query(query))
        print(parameters)

        query = get_component_query(
            'WorkflowTemplateProcess', 'isStepOfTemplate', template_uri)
        steps = list(graph.query(query))
        print(steps)

        return template_uri, data_vars, parameters, steps

    except Exception:
        pass
    finally:
        graph.close()


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


def list_workflows():
    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    try:
        query = '''
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            SELECT ?label
            WHERE {
              ?s rdfs:label ?label .
              ?s a  <http://www.opmw.org/ontology/WorkflowTemplate>
            }'''
        results = list(graph.query(query))
    except Exception:
        return None
    finally:
        graph.close()
    return results


def get_graph():
    graph = Graph('SQLAlchemy', identifier=ident)
    graph.open(uri, create=True)
    return graph
