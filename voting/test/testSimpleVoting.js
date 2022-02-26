const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', function(accounts) {   
    contract('SimpleVoting.startProposalsRegistration - onlyAdministrator modifier ', 
    function(accounts) {
     it("The voting administrator should be able to end the proposal registration session only after it has started", 
       async function() {
       //arrange 
       let simpleVotingInstance = await SimpleVoting.deployed();
       let votingAdministrator = await simpleVotingInstance.administrator();
                    
       let nonVotingAdministrator = web3.eth.accounts[1];     
                                           
       try {
            //act
            await simpleVotingInstance.startProposalsRegistration(

              );
            assert.isTrue(false);
       }
       catch(e) {
            //assert
            assert.isTrue(votingAdministrator != nonVotingAdministrator);
            assert.equal(e, "Error: VM Exception while processing transaction: revert - the caller of this function must be the administrator");
       }
     });
  });
    

  contract('SimpleVoting.endProposalRegistration - onlyAdministrator modifier ', 
    function(accounts) {
     it("The voting administrator should be able to end the proposal registration session only after it has started", 
       async function() {
       //arrange 
       let simpleVotingInstance = await SimpleVoting.deployed();
       let votingAdministrator = await simpleVotingInstance.administrator();
                    
       let nonVotingAdministrator = web3.eth.accounts[1];     
                                           
       try {
            //act
            await simpleVotingInstance.endProposalsRegistration(

              );
            assert.isTrue(false);
       }
       catch(e) {
            //assert
            assert.isTrue(votingAdministrator != nonVotingAdministrator);
            assert.equal(e, "Error: VM Exception while processing transaction: revert - the caller of this function must be the administrator");
       }
     });
  });
     
  contract('SimpleVoting.endProposalRegistration - onlyDuringProposalsRegistration modifier', 
    function(accounts) {
     it("An account that is not the voting administrator must not be able to end the proposal registration session", 
       async function() {
       //arrange 
       let simpleVotingInstance = await SimpleVoting.deployed();
       let votingAdministrator = await simpleVotingInstance.administrator();

       try {
         //act
            await simpleVotingInstance.endProposalsRegistration(
              {from: votingAdministrator});
            assert.isTrue(false);
       }
       catch(e) {
            //assert
            assert.equal(e, "Error: VM Exception while processing transaction: revert - this function can be called only during proposals registration");
       }
     });                                   
  });

  contract('SimpleVoting.endProposalRegistration - successful', 
    function(accounts) {
     it("An account that is not the voting administrator must not be able to end the proposal registration session", 
       async function() {
       //arrange 
       let simpleVotingInstance = await SimpleVoting.deployed();
       let votingAdministrator = await simpleVotingInstance.administrator();

       await simpleVotingInstance.startProposalsRegistration(
          {from: votingAdministrator});
       let workflowStatus = await simpleVotingInstance.getWorkflowStatus();
       let expectedWorkflowStatus = 1;

       assert.equal(workflowStatus.valueOf(), expectedWorkflowStatus, 
          "The current workflow status does not correspond to proposal registration session started"); 

       //act
       await simpleVotingInstance.endProposalsRegistration(
         {from: votingAdministrator});
       let newWorkflowStatus = await simpleVotingInstance
         .getWorkflowStatus();
       let newExpectedWorkflowStatus = 2;
                    
       //assert
       assert.equal(newWorkflowStatus.valueOf(), newExpectedWorkflowStatus,
         "The current workflow status does not correspond to proposal registration session ended");

       });
     });
});

