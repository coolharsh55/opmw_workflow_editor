#!/usr/bin/env python
#
# OPMW pretty print and JSON
# author: Harshvardhan Pandit
#
# This file parses the OPMW owl file
# to generate a JSON file representation of OPMW
#
# This will also print OPMW to the console as TEXT
# override by commenting out the print statement in print

import json
from rdflib import Graph
from rdflib.namespace import RDF, RDFS, OWL
from rdflib.namespace import Namespace, NamespaceManager
from rdflib.namespace import split_uri


# def print(*args, **kwargs):
#     # override (replace) print function to make turning off print easy
#     __builtins__.print(*args)


def _ns_lookup(ele):
    # split the object and look up its uri and return
    # namespace + name
    # ele is a URI from the OWL file
    e0, e1 = split_uri(ele)
    return namespaces[e0], e1


# OPMW types are the OPMW classes
opmw_types = []

# this will hold the OPMW json representation
# export to file at end
opmw_json = {}

# line dividers for pretty output
line_divider_small = '-' * 40
line_divider = 2 * line_divider_small

xml_types = {
    'http://www.w3.org/2001/XMLSchema#int': 'int',
    'http://www.w3.org/2001/XMLSchema#anyURI': 'URI',
    'http://www.w3.org/2001/XMLSchema#string': 'string',
    'http://www.w3.org/2001/XMLSchema#dateTime': 'datetime'
}

# adding namespaces from document to the RDF graph
opmw = Namespace('http://www.opmw.org/ontology/')
namespace_manager = NamespaceManager(Graph())
namespace_manager.bind('opmw', opmw, override=False)
terms = Namespace("http://purl.org/dc/terms/")
namespace_manager.bind('terms', terms, override=False)
foaf = Namespace("http://xmlns.com/foaf/0.1/")
namespace_manager.bind('foaf', foaf, override=False)
vann = Namespace("http://purl.org/vocab/vann/")
namespace_manager.bind('vann', vann, override=False)
ns = Namespace("http://purl.org/net/opmv/ns#")
namespace_manager.bind('ns', ns, override=False)
owl = Namespace("http://www.w3.org/2002/07/owl#")
namespace_manager.bind('owl', owl, override=False)
dc = Namespace("http://purl.org/dc/elements/1.1/")
namespace_manager.bind('dc', dc, override=False)
owl2xml = Namespace("http://www.w3.org/2006/12/owl2-xml#")
namespace_manager.bind('owl2xml', owl2xml, override=False)
opmo = Namespace("http://openprovenance.org/model/opmo#")
namespace_manager.bind('opmo', opmo, override=False)
prov = Namespace("http://www.w3.org/ns/prov#")
namespace_manager.bind('prov', prov, override=False)
pplan = Namespace("http://purl.org/net/p-plan#")
namespace_manager.bind('p-plan', pplan, override=False)

# parsing graph from opmw OWL file
# http://www.opmw.org/model/OPMW/opmw3.1.owl
g = Graph()
g.parse('./opmw.owl')
g.namespace_manager = namespace_manager
namespaces = {str(uri): name for name, uri in g.namespaces()}

# show all namespaces in document
for key, value in namespaces.items():
    print(value, key)
print(line_divider)


# Extract only OPMW elements from the graph,
# we are only interested in generating OPMW classes.
# Since this is the OPMW class file, the only classes will be from OPMW.
# Thus, the triples query is constructed where rdf:type is object=owl:class
for s, p, o in g.triples((None, RDF.type, OWL.Class)):
    try:
        # the URI contains the OPMW URI + class name
        # We split it using the split_uri method
        # Since there may be other classes, this is enclosed in a try
        # This may not be the best way to do things,
        # but I do not know of any other way.
        # I've basically read and used RDFLib for the first time today.
        base, ele = split_uri(s)
    except Exception as e:
        continue
    # If the class uri is OPMW, then we save it and the entire URI
    if base == opmw:
        opmw_types.append(s)

# This is construction of the data properties
# This also pretty prints the ontology on the console
for ele in opmw_types:
    # prints the OPMW classname
    # We need to split the URI and get only the classname
    ele_uri, ele_name = split_uri(ele)
    ele_ns = 'opmw:{}'.format(ele_name)
    ele_json = {
        'uri': ele,
        'label': ele_name
    }
    opmw_json[ele_ns] = ele_json
    ele_attribs = {}
    ele_json['attributes'] = ele_attribs
    print(ele_ns)

    # get all attributes where this class is the subject
    for s, p, o in g.triples((ele, None, None)):
        # We will ignore comments since they contain only examples in this case
        if p == RDFS.comment:
            pass
        # Labels are handled differently,
        # since their objects are string literals
        elif p == RDFS.label:
            p0, p1 = _ns_lookup(p)
            ele_attribs['{}:{}'.format(p0, p1)] = {
                'ns': p0,
                'label': p1,
                'value': o
            }
            print('{}:{} "{}"'.format(p0, p1, o))
        # For all other elements, we print their schema and name
        else:
            p0, p1 = _ns_lookup(p)
            o0, o1 = _ns_lookup(s)
            ele_attribs['{}:{}'.format(p0, p1)] = {
                'ns': p0,
                'label': p1,
                'value': o
            }
            print('{}:{} {}:{}'.format(p0, p1, o0, o1))
    print(line_divider_small)
    # We then iterate through all the properties where class is the object
    ele_properties = {}
    ele_json['properties'] = ele_properties
    ele_relations = {}
    ele_json['relations'] = ele_relations
    for s, p, o in g.triples((None, None, ele)):
        try:
            # some literals may remain (there's one nasty string in the file)
            # If it's not from a recognised namespace, ignore it
            s0, s1 = split_uri(s)
            if s0 not in namespaces.keys():
                continue
            prop_name = '{}:{}'.format(*_ns_lookup(s))
            print('Property', prop_name)
            prop_attrib = {}
        except Exception as e:
            continue
        # Get all the attributes of this property
        # Where the property (subject) retrieved from previous query
        # Becomes the subject of this query
        for s, p, o in g.triples((s, None, None)):
            # we need a try block to catch that nasty string in the file
            # It cannot be split (it's an object)
            p_0, p_1 = split_uri(p)
            p0 = namespaces[p_0]
            try:
                o_0, o_1 = split_uri(o)
            except Exception as e:
                continue
            # ignore comments, they contain examples
            if p == RDFS.comment:
                pass
            elif p == RDFS.label:
                prop_attrib['{}:{}'.format(p0, p_1)] = {
                    'ns': p0,
                    'label': p_1,
                    'value': o,
                }
                print('{}:{} "{}"'.format(p0, p_1, o))
            else:
                prop_attrib['{}:{}'.format(p0, p_1)] = {
                    'ns': p0,
                    'label': p_1,
                    'value': o,
                }
                print('{}:{} {}:{}'.format(
                    namespaces[p_0], p_1, namespaces[o_0], o_1))
        print(line_divider_small)
        prop_range = prop_attrib.get('rdfs:range', None)
        if prop_range is None:
            ele_properties[prop_name] = prop_attrib
        elif prop_range['value'] == ele:
            ele_relations[prop_name] = prop_attrib
        else:
            ele_properties[prop_name] = prop_attrib
    print(line_divider)
print()

# export the opmw json to file
# the indent is for pretty print
with open('opmw.json', 'w') as fp:
    json.dump(opmw_json, fp, indent=4)

# format opmw into json for creating forms
form_json = {}

for ele_name, ele in opmw_json.items():
    label = ele['label']
    print(label)
    ele_json = {'label': label, 'properties': {}, 'relations': {}}
    for prop_name, prop in ele['properties'].items():
        print(prop_name)
        if 'rdfs:label' in prop.keys():
            prop_label = prop['rdfs:label']['value']
        else:
            prop_label = prop_name
        print('label', prop_label)
        prop_json = {'label': prop_label}
        if 'rdfs:range' in prop.keys():
            prop_type = str(prop['rdfs:range']['value'])
            if xml_types.get(prop_type, False):
                prop_type = xml_types[prop_type]
                prop_field = 'text'
            else:
                p0, p1 = _ns_lookup(prop_type)
                prop_type = '{}:{}'.format(p0, p1)
                prop_field = 'select'
            print('range', prop_type)
            print('input', prop_field)
        else:
            prop_type = None
            prop_field = None
        ele_json['properties'][prop_name] = {
            'info': prop_label,
            'range': prop_type,
            'input': prop_field
        }
        print(line_divider_small)

    for rel_name, rel in ele['relations'].items():
        print(rel_name)
        if 'rdfs:label' in rel.keys():
            rel_label = rel['rdfs:label']['value']
        else:
            rel_label = rel_name
        print('label', rel_label)
        rel_json = {'label': rel_label}
        if 'rdfs:domain' in rel.keys():
            rel_type = str(rel['rdfs:domain']['value'])
            p0, p1 = _ns_lookup(rel_type)
            rel_type = '{}:{}'.format(p0, p1)
            rel_field = 'select'
            print('domain', rel_type)
            print('input', rel_field)
        else:
            rel_type = None
            rel_field = None
        ele_json['relations'][rel_name] = {
            'info': rel_label,
            'domain': rel_type,
            'input': rel_field
        }
        print(line_divider_small)

    form_json[ele_name] = ele_json
    print(line_divider)

with open('form.json', 'w') as fp:
    json.dump(form_json, fp, indent=4)
