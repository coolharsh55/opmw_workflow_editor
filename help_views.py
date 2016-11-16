from flask import Blueprint, render_template

help_views = Blueprint('help_views', __name__, url_prefix='/help')


@help_views.route('/')
def index():
    return render_template('help/index.html')
