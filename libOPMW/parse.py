#!/usr/bin/env python
#
# Parse JSON to create ontology-based graph of OPMW experiment workflows
# author: Harshvardhan Pandit
#
# This module will parse the JSON output from the experiment workflow process
# and create a graph of linked objects that can be used to write the ontology.

import json
# import logging
# logger = logging.getLogger()
# handler = logging.StreamHandler()
# logger.addHandler(handler)
# logger.setLevel(logging.ERROR)

# logger.debug('start')


with open('./libOPMW/form.json', 'r') as f:
    _opmw = json.load(f)


def _parse_file(file_name):
    """parse the file and load contents"""
    with open(file_name, 'r') as f:
        return json.load(f)


def _prop_is_list(prop):
    dimension = prop['dimension']
    return dimension == "multi" or int(dimension) > 2


def _prop_ranged_in_opmw(prop):
    prop_range = prop['range']
    if not prop_range:
        return False
    if isinstance(prop_range, list):
        return all([p for p in prop_range if p in _opmw['elements']])
    elif prop_range in _opmw['elements']:
        return True
    return False


def _create_linked_objects(json_data):
    """create and link objects from json"""

    experiment_data = json_data['objects']
    workflow_template = experiment_data[json_data['workflow_template']]

    for obj_label, obj in experiment_data.items():
        # logger.debug('{} in context'.format(obj_label))
        obj['schema'] = _opmw['elements'][obj['type']]
        linked_items = {}
        for link_type, links in obj['links'].items():
            linked_items[link_type] =\
                [experiment_data[linked_item] for linked_item in links]
        obj['links'] = linked_items

        # non_linked_properties = ["id", "type", "schema", "links", "diagram"]
        for prop_label, prop_item in obj.items():
            if prop_label not in obj['schema']['properties']:
                continue

            # prop.dimension == "multi" or >2
            prop_is_list = _prop_is_list(
                obj['schema']['properties'][prop_label])
            # if prop_is_list:
            #     logger.debug('{} is a list'.format(prop_label))
            # else:
            #     logger.debug('{} is singular'.format(prop_label))

            prop_ranged_in_opmw = _prop_ranged_in_opmw(
                obj['schema']['properties'][prop_label])
            # if prop_ranged_in_opmw:
            #     logger.debug('{} is a linked object'.format(prop_label))
            # else:
            #     logger.debug('{} is literal'.format(prop_label))

            if prop_ranged_in_opmw:
                if prop_is_list:
                    obj[prop_label] =\
                        [experiment_data[link] for link in prop_item]
                else:
                    obj[prop_label] = experiment_data[prop_item]
            else:
                obj[prop_label] = prop_item

    return experiment_data, workflow_template


def parse(data):
    """parse the file contents and return linked objects"""

    return _create_linked_objects(data)


if __name__ == '__main__':
    json_data = parse('./op.json')
    # for key, value in json_data.items():
    #     print(key)
    #     print(value)
    #     print()
