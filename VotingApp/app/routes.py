import json

from flask import render_template

from app import app
from web3 import Web3

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
w3.eth.defaultAccount = w3.eth.accounts[1]

# Get stored abi and contract_address
with open("data.json", 'r') as f:
    datastore = json.load(f)
    abi = datastore["abi"]
    contract_address = datastore["contract_address"]


@app.route('/voter')
def voter():
    # Create the contract instance with the newly-deployed address
    voting = w3.eth.contract(address=contract_address, abi=abi)
    filter = voting.events.VoterRegisteredEvent.createFilter(address=contract_address)
    print(filter.get_new_entries())

    return app.send_static_file("voter.html")


@app.route('/admin')
def admin():
    # Create the contract instance with the newly-deployed address
    voting = w3.eth.contract(address=contract_address, abi=abi)
    # print(voting.events.VoterRegisteredEvent.createFilter())

    return app.send_static_file("admin.html")
