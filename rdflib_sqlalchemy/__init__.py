# -*- coding: utf-8 -*-
"""SQLAlchemy Store plugin for RDFLib."""
import logging
__author__ = "Graham Higgins"
__version__ = "0.3"


class NullHandler(logging.Handler):
    r"""
    Null handler.

    c.f.
    http://docs.python.org/howto/logging.html#library-config
    and
    http://docs.python.org/release/3.1.3/library/logging.\
    html#configuring-logging-for-a-library
    """

    def emit(self, record):
        """Emit."""
        pass

hndlr = NullHandler()
logging.getLogger("rdflib").addHandler(hndlr)


def registerplugins():
    """
    Register plugins.

    If setuptools is used to install rdflib-sqlalchemy, all the provided
    plugins are registered through entry_points. This is strongly recommended.

    However, if only distutils is available, then the plugins must be
    registed manually.

    This method will register all of the rdflib-sqlalchemy Store plugins.

    """
    from rdflib.store import Store
    from rdflib import plugin

    try:
        x = plugin.get('SQLAlchemy', Store)
        del x
        return  # plugins already registered
    except:
        pass  # must register plugins

    # Register the plugins ...

    plugin.register(
        'SQLAlchemy', Store,
        'rdflib_sqlalchemy.SQLAlchemy', 'SQLAlchemy')
