initialize = function()
{
	var states = [logout, loginAnonymously, subscriptions, processSession];
	
	if(definedStates.initialize)
		states.unshift(definedStates.initialize);
	
	Teleport.queue(states).done(login);
}

function logout(state)
{
	var user = Meteor.user();
	
	if(!user || _.isNumber(user.profile))
	{
		state.resolve();
		
		return;
	}
	
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
	
	Deps.autorun(function() {
		if(!_.every(_.map(handles, function(handle) { return handle.ready(); })))
			return;
		
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