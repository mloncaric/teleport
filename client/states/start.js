start = function()
{
	var states = [scheduling];
	
	if(definedStates.start)
		states.unshift(definedStates.start);
	
	Teleport.queue(states).done(initialize);
}

function scheduling(state)
{
	if(Teleport.context.room)
	{
		state.resolve();
		
		return;
	}
	
	Teleport.setTemplate(definedViews.scheduling);
	
	return Teleport.queue(
	[ createSession
	, processSession
	]);
}

function createSession(state)
{
	var context = Teleport.context,
		startDate = context.startDate ? context.startDate.toISOString() : null;
	
	Teleport.call("createSession", startDate, function(error, result)
	{
		if(!error && result)
			state.resolve($.extend(result, {sessionCreated: true}));
		else
			state.reject(error);
	});
}

function processSession(state)
{
	var context = Teleport.context;
	
	Teleport.setRoom(context.room);
	
	return fetchSessionAndSubscribe(state);
}