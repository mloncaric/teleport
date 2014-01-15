initialize = function()
{
	var states = [loginAnonymously, subscriptions, finalize, processSession];
	
	if(definedStates.initialize)
		states.unshift(definedStates.initialize);
	
	Teleport.queue(states).done(login);
}

function loginAnonymously(state)
{
	if(Meteor.user())
		state.resolve();
	else
	{
		Teleport.setView(definedViews.loading);
		
		Accounts.callLoginMethod(
		{ methodArguments: [{}]
		, userCallback: function(error)
		{
			if(!error)
				state.resolve();
			else
				state.reject(error);
		}});
	}
}

function subscriptions(state)
{
	var subscriptionsCount = 2,
		subscriptionsReady = 0;
	
	var ready = function()
	{
		if(++subscriptionsReady < subscriptionsCount)
			return;
		
		state.resolve();
	}
	
	// TODO: Handle errors
	Meteor.subscribe("tport_users", ready);
	Meteor.subscribe("tport_sessions", ready);
}

function finalize(state)
{
	Teleport.user();
	
	state.resolve();
}

function processSession(state)
{
	var context = Teleport.context;
	
	if(!context.room)
		state.resolve();
	else
	{
		Teleport.setView(definedViews.loading);
		
		return fetchSessionAndSubscribe(state);
	}
}