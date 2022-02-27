import json

from web3 import Web3
# web3.py instance
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

from solc import compile_files
# compile all contract files
contracts = compile_files(['voting/contracts/SimpleVoting.sol'])
contract = list(contracts.values())[0]

from solc import link_code
def deploy_contract(contract_interface):
    # Instantiate and deploy contract
    contract = w3.eth.contract(
        abi=contract_interface['abi'],
        bytecode=contract_interface['bin']
    )
    # Get transaction hash from deployed contract
    tx_hash = contract.constructor().transact({'from': w3.eth.accounts[1]})

    # Get tx receipt to get contract address
    tx_receipt = w3.eth.getTransactionReceipt(tx_hash)
    return tx_receipt['contractAddress']

contract_address = deploy_contract(contract)

# add abi(application binary interface) and transaction reciept in json file
with open('app/data.json', 'w') as outfile:
    data = {
       "abi": contract['abi'],
       "contract_address": deploy_contract(contract)
    }
    json.dump(data, outfile, indent=4, sort_keys=True)