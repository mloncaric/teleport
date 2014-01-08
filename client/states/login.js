login = function()
{
	var states = [fetchUser];
	
	if(definedStates.login)
		states.push(definedStates.login);
	else
		Teleport.context.guestName = "Guest";
	
	states.push(loggingIn);
	
	Teleport.queue(states).done(start);
}

function fetchUser(state)
{
	var context = Teleport.context;
	
	if(context.user)
	{
		state.resolve();
		
		return;
	}
	
	Teleport.setView(definedViews.loading);
	
	Teleport.call("fetchUser", context.authToken, function(error, result)
	{
		if(error)
			state.reject();
		else
		{
			if(result)
				state.resolve(result);
			else
				state.resolve();
		}
	});
}

function loggingIn(state)
{
	var context = Teleport.context;
	
	if(!context.guestName && !context.pendingUser)
	{
		state.resolve();
		
		return;
	}
	
	Teleport.setView(definedViews.loading);
	
	if(context.guestName)
		Teleport.call("loginGuest", context.guestName, function(error, result)
		{
			if(error || !result)
				state.reject(error);
			else
				state.resolve({user: result});
		});
	else
		Teleport.call("loginUser", context.pendingUser, function(error, result)
		{
			if(error || !result)
				state.reject(error);
			else
				state.resolve({user: result});
		});
}