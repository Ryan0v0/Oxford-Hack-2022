# Simple Voting Web Interface (An Oxford-Hack-2022 Project)

## Project Description

**Fully decentralized NFT ticket system towards Metaverse: Next generation Seatlab business model**

### Inspiration

Democracy is the fundamental bedrock in our societies, but it has been increasingly encroached in recent years following appalling reports of voter frauds and election tampering. Coming from the firm position of upholding such values, we came up with a voting-based system for not just political elections but also a ticketing aid-system for public life as well.

Additionally, we have some consultations with the seatlab. ![img](https://res.cloudinary.com/devpost/image/fetch/s--DKkdhf8Q--/c_limit,f_auto,fl_lossy,q_auto:eco,w_900/https://tva1.sinaimg.cn/large/e6c9d24egy1gzsamevwzcj216r0u0mzv.jpg)

Furthermore, based on the literature review of the NFT system, we want a fully decentralized NFT system, which provides advantages such as transparency and security. Finally, based on the challenge description, we want the new infrastructure based for equality.

### What it does

In short, it is a peak of the ecology of future life powered by dapp systems concerning both the public and social life. In our app, we have two roles, admins and usual voters. At the start of the voting process, the admin will add the voters individually and start the proposal registration phase. The voters will then submit their proposals along with a short description for voting. The admin will then orchestrate the system into the next stage, which is the voting phase. The voters will be able to cast their vote in this phase and the admin would tally them in the end. At the end of the entire voting, a ranking of projects based on their votes gained will be displayed to every voter. Every action throughout the process is fully decentralised and witnessed by transactions in the blockchain to ensure the transparency of the voting process.

The system comparison is as follows. Start with the existing system. ![img](https://res.cloudinary.com/devpost/image/fetch/s--MmftRIwC--/c_limit,f_auto,fl_lossy,q_auto:eco,w_900/https://tva1.sinaimg.cn/large/e6c9d24egy1gzsamhtn9oj218g0rqmzo.jpg)

New system is as follows. In introducing the ticket generation and ticket voting in the domain. ![img](https://res.cloudinary.com/devpost/image/fetch/s--l2DzuEZC--/c_limit,f_auto,fl_lossy,q_auto:eco,w_900/https://tva1.sinaimg.cn/large/e6c9d24egy1gzsamid28aj218g0n6mzi.jpg)

### How we built it

![img](https://res.cloudinary.com/devpost/image/fetch/s--hiC7AXaq--/c_limit,f_auto,fl_lossy,q_auto:eco,w_900/https://tva1.sinaimg.cn/large/e6c9d24egy1gzsamg33a7j21080u00x4.jpg) We implemented a voting contract. The main problems of electronic voting is how to assign voting rights to the correct persons and how to prevent manipulation. We shows how delegated voting can be done so that vote counting is automatic and completely transparent at the same time.

The idea is to create one contract per ballot, providing a short name for each option. Then the creator of the contract who serves as chairperson will give the right to vote to each address individually.

The persons behind the addresses can then choose to either vote themselves or to delegate their vote to a person they trust.

At the end of the voting time, our system will return the proposal with the largest number of votes.

In summary, three steps are included as follows. ![img](https://res.cloudinary.com/devpost/image/fetch/s--VEY3BRpM--/c_limit,f_auto,fl_lossy,q_auto:eco,w_900/https://tva1.sinaimg.cn/large/e6c9d24egy1gzsamlrk6zj218g0s7di7.jpg)

### Challenges we ran into

Since none of the members had come into contact with web3/dapp development, the learning curve at the start was slightly daunting, but once we got hang of it, our development agility quickly ramped up and we managed to come up with innovative ideas based on current implementations. Integration with known APIs (MetaMask, for instance) was also quite time-consuming due to environment incompatibility issues, but the trials do look promising.

### Accomplishments that we're proud of

- Built an end-to-end dApp system.
- Founded on our baseline implementation, we devised an epistemic electoral system based on plural voting systems
- that have been proven, in certain aspects, a strong candidate of replacement for some of the existing democratic procedures.
- Built a further perspective extension of a ticketing system inspired by SeatLab, which brought the democratic process outside the political sector.
- Learned a TON about dApp development and practical web development in an agile workflow.
- Made it till the very end :)))

### What we learned

- Blockchain empowered system design
- dApp development
- Solidity development
- Building end-to-end decentralised voting applications
- Integration with existing crypto systems
- Resolving complex environmental issues
- That late night development turns out to be efficient

### What's next

- Deployment.
- Adding Support for more ERC20 tokens.
- Dynamic Pricing to mitigate effect of fluctuating price of eth.
- Adding Support for multiple event admins.
- Optimizing UI and UX.

### Directory Structure

- SimpleVotingUI is the latest working copy that is integrating the backend written using Solidty with the frontend using HTML+JavaScript
- VotingApp is the latest version that is integrating flask with a plainer version of the frontend. It would support more functionalities in the future.

## Setup

### VotingApp with Flask and Solidity
1. Make sure you are running on `Linux` or `Mac`
2. Install Solidity Compiler `solc=0.4.24`, this could be done using the tool `solc-select` so:
    ```
   pip3 install solc-select
   solc-select install 0.4.24
   solc-select use 0.4.24
   ```
3. Now install other relevant python libraries (including `Flask`):
   ```
   pip3 install solc
   pip3 install py-solc
   pip3 install web3
   pip3 install flask
   pip3 install python-dotenv
   ```
4. Change to the VotingApp directory and run the app:
   ```
   cd /path/to/VotingApp
   flask run
   ```
### VotingApp with Solidity only

- With appropriate dependencies installed, we first run `ganache > transactions.txt` and the terminal shows a list of available accounts on the ad-hoc blockchain.
- On another terminal, we run `truffle migrate --reset` to compile the \*.sol programs and transfer them onto our blockchain, which will be prompted in the transactions.txt file if successful.
- Finally, copy the generated \*.json files from ./build/contracts directory into the frontend ./contracts directory.

### SimpleVotingUI

- Frontend implementation for voting system, where `admin.html` corresponds to the administrator management page and `voter.html` the voters' proposal, display, and voting page. The `login.html` page is work in process.
- With updated \*.json files from ./contracts folder, we can simply run `node webserver.js` to start the local server
