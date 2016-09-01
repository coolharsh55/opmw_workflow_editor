# RDF resource
#
# denotes a generic RDF resource with an URI

from collections import Iterable, namedtuple
from rdflib import URIRef


class RDFResource(object):

    RDFProperty = namedtuple('RDFProperty', 'subject object predicate')

    def __init__(self):

        self._uri = None
        self._properties = []

    @property
    def uri(self):
        return self._uri

    @uri.setter
    def uri(self, value):
        if isinstance(value, str):
            self._uri = URIRef(value)
        elif isinstance(value, URIRef):
            self._uri = value
        elif value is None:
            self._uri = None
        else:
            raise ValueError('invalid uri')

    @property
    def properties(self):
        return self._properties

    @properties.setter
    def properties(self, values):
        if not isinstance(values, Iterable):
            raise ValueError('used should be a list')
        _properties = []
        for value in values:
            if isinstance(value, URIRef):
                _properties.append(value)
            else:
                try:
                    _properties.append(URIRef(value))
                except ValueError:
                    raise ValueError('failed to convert property to URI')
        self._properties = _properties
