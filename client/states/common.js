fetchSessionAndSubscribe = function(state)
{
	return Teleport.queue([fetchSession, subscriptions, updateSession]);
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
	var room = Teleport.context.room;
	
	var handles = [
		Meteor.subscribe("onlineUsers", room),
		Meteor.subscribe("sharedObjects", room)
	];
	
	Deps.autorun(function() {
		if(!_.every(_.map(handles, function(handle) { return handle.ready(); })))
			return;
		
		state.resolve();
	});
}

function updateSession(state)
{
	Teleport.session();
	
	state.resolve();
}