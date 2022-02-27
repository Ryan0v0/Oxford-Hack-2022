var SimpleVoting;

var voterRegisteredEvent;
var proposalsRegistrationStartedEvent;
var proposalsRegistrationEndedEvent;
var proposalRegisteredEvent;
var votingSessionStartedEvent;
var votingSessionEndedEvent;
var votedEvent;
var votesTalliedEvent;
var workflowStatusChangeEvent;

var web3 = new Web3('ws://localhost:8545');

window.onload = function() {
	$.getJSON("./contracts/SimpleVoting.json", function(json) {
	    SimpleVoting = TruffleContract( json );
	    
		SimpleVoting.setProvider(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
		
		SimpleVoting.deployed()
		.then(instance => { 
			instance.VoterRegisteredEvent(function(error, result) {
			  if (!error)
				$("#voterRegistrationMessage").html('Voter successfully registered');
			  else
				console.log(error);
		    })});
		
		SimpleVoting.deployed()
		.then(instance => instance.ProposalsRegistrationStartedEvent(function(error, result) {
			  if (!error)
				$("#proposalsRegistrationMessage").html('The proposals registration session has started');
			  else
				console.log(error);
		    }));	

		SimpleVoting.deployed()
		.then(instance => instance.ProposalsRegistrationEndedEvent(function(error, result) {
			  if (!error)
				$("#proposalsRegistrationMessage").html('The proposals registration session has ended');
			  else
				console.log(error);
		    })			  
	    );			
		
		SimpleVoting.deployed()
		.then(instance => instance.ProposalRegisteredEvent(function(error, result) {
			  if (!error)
			  {
				$("#proposalRegistrationMessage").html('The proposal has been registered successfully');
				loadProposalsTable();
			  }
			  else
				console.log(error);
		    })		  
	    );	

		SimpleVoting.deployed()
		.then(instance => instance.VotingSessionStartedEvent(function(error, result) {
			  if (!error)
				$("#votingSessionMessage").html('The voting session session has started');
			  else
				console.log(error);
		    }));	
		
		SimpleVoting.deployed()
		.then(instance => instance.VotingSessionEndedEvent(function(error, result) {
			  if (!error)
				$("#votingSessionMessage").html('The voting session session has ended');
			  else
				console.log(error);
		    })			  
	    );		

		SimpleVoting.deployed()
		.then(instance => instance.VotedEvent(function(error, result) {
			  if (!error)
				$("#voteConfirmationMessage").html('You have voted successfully');
			  else
				console.log(error);
		    })		  
	    );		

		SimpleVoting.deployed()
		.then(instance => instance.VotesTalliedEvent(function(error, result) {
			  if (!error)
		      {
			     $("#votingTallyingMessage").html('Votes have been tallied');
			     loadResultsTable();
		      }
			  else
				console.log(error);
		    })	  
	    );			
		
	    SimpleVoting.deployed()
		.then(instance => instance.WorkflowStatusChangeEvent(function(error, result) {
			  if (!error)
				refreshWorkflowStatus();
			  else
				console.log(error);
		    })		  
	);		
	   
	    refreshWorkflowStatus();
	});
}

function refreshWorkflowStatus()
{		
	SimpleVoting.deployed()
	.then(instance => instance.getWorkflowStatus())
	.then(workflowStatus => {
		var workflowStatusDescription;
		
		switch(workflowStatus.toString())
		{
			case '0':
				workflowStatusDescription = "Registering Voters";		
				break;
			case '1':
				workflowStatusDescription = "Proposals registration Started";
				break;
			case '2':
				workflowStatusDescription = "Proposals registration Ended";
				break;
			case '3':
				workflowStatusDescription = "Voting session Started";
				break;
			case '4':
				workflowStatusDescription = "Voting session Ended";
				break;
			case '5':
				workflowStatusDescription = "Votes have been tallied";
				break;	
			default:
				workflowStatusDescription = "Unknown status";
		}
				
		$("#currentWorkflowStatusMessage").html(workflowStatusDescription);
	});
}

function unlockAdmin()
{
	$("#adminMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	var adminPassword = $("#adminPassword").val();
	
	var result = web3.eth.personal.unlockAccount(adminAddress, adminPassword, 180);//unlock for 3 minutes
	if (result){
		$("#adminMessage").html('The account has been unlocked');
		console.log("done");}
	else
		$("#adminMessage").html('The account has NOT been unlocked');
}

function unlockVoter()
{
	$("#voterMessage").html('');
	
	var voterAddress = $("#voterAddress").val();
	var voterPassword = $("#voterPassword").val();

	// var web3 = new Web3('ws://localhost:8545');
	var result = web3.eth.personal.unlockAccount(voterAddress, voterPassword, 180);//unlock for 3 minutes
	if (result)
		$("#voterMessage").html('The account has been unlocked');
	else
		$("#voterMessage").html('The account has NOT been unlocked');
}

function registerVoter() {
	
	$("#voterRegistrationMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	var voterToRegister = $("#voterAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.isRegisteredVoter(voterToRegister))
				.then(isRegisteredVoter => {
					if (isRegisteredVoter)
						$("#voterRegistrationMessage").html('The voter is already registered');					    
					else
					{
						return SimpleVoting.deployed()
							.then(instance => instance.getWorkflowStatus())
							.then(workflowStatus => {
								if (workflowStatus > 0)
									$("#voterRegistrationMessage").html('Voters registration has already ended');					    
								else
								{
									SimpleVoting.deployed()
									   .then(instance => instance.registerVoter(voterToRegister, {from:adminAddress, gas:200000}))
									   .catch(e => $("#voterRegistrationMessage").html(e));
								}
							});
					}
				});
		}
		else
		{
			$("#voterRegistrationMessage").html('The given address does not correspond to the administrator');
		}
	});
}

function checkVoterRegistration() {
	
	$("#registrationVerificationMessage").html('');
	
	var address = $("#address").val();	
	
	SimpleVoting.deployed()
	.then(instance => instance.isRegisteredVoter(address))
	.then(isRegisteredVoter =>  {
		if (isRegisteredVoter)
				$("#registrationVerificationMessage").html('This is a registered voter');
			 else
				$("#registrationVerificationMessage").html('This is NOT a registered voter');
	});
}

function startProposalsRegistration() {
	
	$("#proposalsRegistrationMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus > 0)
						$("#proposalsRegistrationMessage").html('The proposals registration session has already been started');					    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.startProposalsRegistration({from:adminAddress, gas:200000}))
						   .catch(e => $("#proposalsRegistrationMessage").html(e));
					}
				});
		}
		else
		{
			$("#proposalsRegistrationMessage").html('The given address does not correspond to the administrator');
		}
	});	
}

function endProposalsRegistration() {
	
	$("#proposalsRegistrationMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 1)
						$("#proposalsRegistrationMessage").html('The proposals registration session has not started yet');
					else if (workflowStatus > 1)
						$("#proposalsRegistrationMessage").html('The proposals registration session has already been ended');				    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.endProposalsRegistration({from:adminAddress, gas:200000}))
						   .catch(e => $("#proposalsRegistrationMessage").html(e));
					}
				});
		}
		else
		{
			$("#proposalsRegistrationMessage").html('The given address does not correspond to the administrator');
		}
	});	
}

function startVotingSession() {
	
	$("#votingSessionMessage").html('');	
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 2)
						$("#votingSessionMessage").html('The proposals registration session has not ended yet');
					else if (workflowStatus > 2)
						$("#votingSessionMessage").html('The voting session has already been started');					    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.startVotingSession({from:adminAddress, gas:200000}))
						   .catch(e => $("#votingSessionMessage").html(e));
					}
				});
		}
		else
		{
			$("#votingSessionMessage").html('The given address does not correspond to the administrator');
		}
	});		
}

function endVotingSession() {
	
	$("#votingSessionMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 3)
						$("#votingSessionMessage").html('The voting session has not started yet');
					else if (workflowStatus > 3)
						$("#votingSessionMessage").html('The voting session has already ended');					    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.endVotingSession({from:adminAddress, gas:200000}))
						   .catch(e => $("#votingSessionMessage").html(e));
					}
				});
		}
		else
		{
			$("#votingSessionMessage").html('The given address does not correspond to the administrator');
		}
	});
}

function tallyVotes() {
	
	$("#votingTallyingMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 4)
						$("#votingTallyingMessage").html('The voting session has not ended yet');		
					else if (workflowStatus > 4)
						$("#votingTallyingMessage").html('Votes have already been tallied');				    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.tallyVotes({from:adminAddress, gas:200000}))
						   .catch(e => $("#votingTallyingMessage").html(e));
					}
				});
		}
		else
		{
			$("#votingTallyingMessage").html('The given address does not correspond to the administrator');
		}
	});	
}

function registerProposal() {
	
	$("#proposalRegistrationMessage").html('');
	
	var voterAddress = $("#voterAddress").val();
	var proposalDescription = $("#proposalDescription").val();
	// var proposalProfile = $("proposalProfile").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isRegisteredVoter(voterAddress))
	.then(isRegisteredVoter =>  {		
		if (isRegisteredVoter)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 1)
						$("#proposalRegistrationMessage").html('The proposal registration session has not started yet');
					else if (workflowStatus > 1)
						$("#proposalRegistrationMessage").html('The proposal registration session has already ended');				    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.registerProposal(proposalDescription, {from:voterAddress, gas:200000}))
						   .catch(e => $("#proposalRegistrationMessage").html(e));
					}
				});
		}
		else
		{
			$("#proposalRegistrationMessage").html('You are not a registered voter. You cannot register a proposal.');
		}
	});			
}


function loadProposalsTable() {
	
	SimpleVoting.deployed()
	.then(instance => instance.getProposalsNumber())
	.then(proposalsNumber => {
		console.log(proposalsNumber)
		var innerHtml = "<tr><td><b>Proposal Id</b></td><td><b>Description</b></td>";
		
		j = 0;
		for (var i = 0; i < proposalsNumber; i++) {
			getProposalDescription(i)
			.then(description => {
				innerHtml = innerHtml + "<tr><td>" + (j++) + "</td><td>" + description + "</td></tr>" + SimpleVoting.deployed().proposals[i].voteCount + "</td></tr>";
				$("#proposalsTable").html(innerHtml);
			});
		}
    });		
}

function getProposalDescription(proposalId)
{
    return SimpleVoting.deployed()
	  .then(instance => instance.getProposalDescription(proposalId));
}

function pluralVote() {
	$("#voteConfirmationMessage").html('');
	
	var voterAddress = $("#voterAddress").val();
	var proposalId = $("#proposalId").val();
    var numVotes = $("#numVotes").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isRegisteredVoter(voterAddress))
	.then(isRegisteredVoter =>  {		
		if (isRegisteredVoter)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 3)
						$("#voteConfirmationMessage").html('The voting session has not started yet');
					else if (workflowStatus > 3)
						$("#voteConfirmationMessage").html('The voting session has already ended');				    
					else
					{
						SimpleVoting.deployed()
							.then(instance => instance.getProposalsNumber())
							.then(proposalsNumber => {
								if (proposalsNumber == 0)
								{
									$("#voteConfirmationMessage").html('The are no registered proposals. You cannot vote.');
								}
								else if (parseInt(proposalId) >= proposalsNumber)
								{
									$("#voteConfirmationMessage").html('The specified proposalId does not exist.');
								}							
								else 
								{
									SimpleVoting.deployed()
									   .then(instance => instance.pluralVote(proposalId, numVotes, {from:voterAddress, gas:200000}))
									   .catch(e => $("#voteConfirmationMessage").html(e));
								}
							});
					}
				});
		}
		else
		{
			$("#proposalRegistrationMessage").html('You are not a registered voter. You cannot register a proposal.');
		}
	});					
}


function loadResultsTable() {

	SimpleVoting.deployed()
		.then(instance => instance.getWorkflowStatus())
		.then(workflowStatus => {
			if (workflowStatus == 5)
			{
				var innerHtml = "<tr><td><b>Winning Proposal</b></td><td></td></tr>";
				
				SimpleVoting.deployed()
				   .then(instance => instance.getWinningProposalId())
				   .then(winningProposalId => {
					   innerHtml = innerHtml + "<tr><td><b>Id:</b></td><td>" + winningProposalId +"</td></tr>";
					   
					   SimpleVoting.deployed()
				       .then(instance => instance.getWinningProposalDescription())
					   .then(winningProposalDescription => {
						   innerHtml = innerHtml +  "<tr><td><b>Description:</b></td><td>" + winningProposalDescription  +"</td></tr>";
						    
						   SimpleVoting.deployed()
				           .then(instance => instance.getWinningProposaVoteCounts())
					       .then(winningProposalVoteCounts => {
						           innerHtml = innerHtml +  "<tr><td><b>Votes count:</b></td><td>" + winningProposalVoteCounts  +"</td></tr>";
								   
								   $("#resultsTable").html(innerHtml);
						   });
					   });
				   });
			}
		});
}