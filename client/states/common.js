fetchSessionAndSubscribe = function(state)
{
	return Teleport.queue([fetchSession, subscriptions, finalize]);
}

function fetchSession(state)
{
	Teleport.call("fetchSession", function(error, result)
	{
		if(!error)
		{
			if(result)
				state.resolve(result);
			else
				Teleport.setView(definedViews.notFound);
		}
		else
			state.reject(error);
	});
}

function subscriptions(state)
{
	var room = Teleport.context.room,
		subscriptionsCount = 2,
		subscriptionsReady = 0;
	
	var ready = function()
	{
		if(++subscriptionsReady < subscriptionsCount)
			return;
		
		state.resolve();
	}
	
	// TODO: Handle errors
	Meteor.subscribe("onlineUsers", room, ready);
	Meteor.subscribe("sharedObjects", room, ready);
}

function finalize(state)
{
	Teleport.session();
	
	state.resolve();
}