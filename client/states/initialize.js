initialize = function()
{
	var states = [wait, logout, loginAnonymously, subscriptions, processSession];
	
	if(definedStates.initialize)
		states.unshift(definedStates.initialize);
	
	Teleport.queue(states).done(login);
}

function wait(state)
{
	Teleport.setView(definedViews.loading);
	
	Deps.autorun(function(computation) {
		if(Meteor.loggingIn())
			return;
		
		//computation.stop();
		
		state.resolve();
	});
}

function logout(state)
{
	var user = Meteor.user();
	
	if(!user || _.isNumber(user.profile))
	{
		state.resolve();
		
		return;
	}
	
	Teleport.setView(definedViews.loading);
	
	Meteor.logout(function(error)
	{
		if(!error)
			state.resolve();
		else
			state.reject(error);
	});
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
	var handles = [
		Meteor.subscribe("tport_users"),
		Meteor.subscribe("tport_sessions")
	];
	
	Deps.autorun(function(computation) {
		if(!_.every(_.map(handles, function(handle) { return handle.ready(); })))
			return;
		
		//computation.stop();
		
		state.resolve();
	});
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