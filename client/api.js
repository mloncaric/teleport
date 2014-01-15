Teleport.user = function(reactive)
{
	if(reactive)
		return prepareUser();
	
	return Deps.nonreactive(prepareUser);
}

Teleport.onlineUsers = function(reactive)
{
	if(reactive)
		return prepareOnlineUsers();
	
	return Deps.nonreactive(prepareOnlineUsers);
}

Teleport.session = function(reactive)
{
	if(reactive)
		return prepareSession();
	
	return Deps.nonreactive(prepareSession);
}

Teleport.setRoom = function(value)
{
	if(!value)
	{
		Teleport.context.room = null;
		Teleport.context.session = null;
	}
	
	history.replaceState({}, document.title, location.origin + "/" + (value || ""));
}

// TODO: Optimize

function prepareUser()
{
	var user = Users.findOne({id: Meteor.user().profile});
	if(user)
		Teleport.context.user = user;
	
	return Teleport.context.user;
}

function prepareOnlineUsers()
{
	return OnlineUsers.find().map(function(user)
	{
		return _.extend(user, Users.findOne({id: user.id}));
	});
}

function prepareSession()
{
	var room = Teleport.context.room,
		session = Sessions.findOne({room: room});
	
	if(session)
		Teleport.context.session = new Room(session); // TODO: Move into transform method
	
	return Teleport.context.session;
}