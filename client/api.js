Teleport.user = function(reactive)
{
	var user = Users.findOne({id: Meteor.user().profile}, {reactive: reactive});
	
	if(user)
		Teleport.context.user = user;
	
	return Teleport.context.user;
}

Teleport.onlineUsers = function(reactive)
{
	return OnlineUsers.find({}, {reactive: reactive}).map(function(user)
	{
		return _.extend(user, Users.findOne({id: user.id}, {reactive: reactive}));
	});
}

Teleport.session = function(reactive)
{
	var room = Teleport.context.room,
		session = Sessions.findOne({room: room}, {reactive: reactive});
	
	if(session)
		Teleport.context.session = new Room(session, reactive); // TODO: Move into transform method
	
	return Teleport.context.session;
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