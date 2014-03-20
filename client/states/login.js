login = function()
{
	var states = [fetchUser, updateUser];
	
	if(definedStates.login)
		states.push(definedStates.login);
	
	states.push(loggingIn);
	
	Teleport.queue(states).done(start);
}

function fetchUser(state)
{
	var context = Teleport.context;
	
	if(context.user)
	{
		state.resolve({fetchUserSkipped: true});
		
		return;
	}
	
	Teleport.setTemplate(definedViews.loading);
	
	Teleport.call("fetchUser", context.authToken, function(error, result)
	{
		if(error)
			state.reject();
		else
		{
			if(result)
				state.resolve({fetchedUser: result});
			else
				state.resolve();
		}
	});
}

// TODO: Move to server
function updateUser(state)
{
	if(!Teleport.context.fetchUserSkipped)
	{
		var currentUser = Teleport.user(),
			fetchedUser = Teleport.context.fetchedUser;
		
		delete Teleport.context.fetchedUser;
		
		if(currentUser)
		{
			if(!fetchedUser && !currentUser.anonymous)
				Teleport.context.user = null;
		}
		
		if(fetchedUser)
			Teleport.context.user = fetchedUser;
	}
	
	state.resolve();
}

function loggingIn(state)
{
	var context = Teleport.context;
	
	Teleport.setTemplate(definedViews.loading);
	
	if(context.user)
	{
		Teleport.call("loginUser", context.user, function(error, result)
		{
			if(error || !result)
				state.reject(error);
			else
				state.resolve({user: result});
		});
	}
	else
		Teleport.call("loginGuest", context.guestName || "Guest", function(error, result)
		{
			if(error || !result)
				state.reject(error);
			else
				state.resolve({user: result});
		});
}