from app import app, db
from app.models import House, Appliance, Usage


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'House': House, 'Appliance': Appliance, 'Usage': Usage}
