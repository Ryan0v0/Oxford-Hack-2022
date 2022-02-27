# Simple Voting Web Interface (An Oxford-Hack-2022 Project)

## Directory Structure

- SimpleVotingUI is the latest working copy that is integrating the backend written using Solidty with the frontend using HTML+JavaScript
- VotingApp is the latest version that is integrating flask with a plainer version of the frontend. It would support more functionalities in the future.

## Setup
### SimpleVotingUI

### VotingApp
1. Make sure you are running on `Linux` or `Mac`
2. Install Solidity Compiler `solc=0.4.24`, this could be done using the tool `solc-select` so:
    ```
   sudo apt-get install solc-select
   solc-select install 0.4.24
   solc-select use 0.4.24
   ```
3. Now install other relevant python libraries (including `Flask`):
   ```
   pip3 install solc, py-solc
   pip3 install web3
   pip3 install Flask
   pip3 install dot-env
   ```
4. Change to the VotingApp directory and run the app:
   ```
   cd /path/to/VotingApp
   flask run
   ```