Teleport.user = function(reactive)
{
	var meteorUser = Meteor.user();
	
	var user = Users.findOne({id: meteorUser ? meteorUser.profile : undefined}, {reactive: reactive});
	
	if(user)
		Teleport.context.user = user;
	
	return Teleport.context.user;
}

Teleport.onlineUsers = function(reactive)
{
	return OnlineUsers.find({}, {reactive: reactive}).map(function(item) {
		return _.extend(item, _.omit(Users.findOne({id: item.id}, {reactive: reactive}), "_id"));
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

Teleport.owner = function(reactive)
{
	var user = Teleport.user(reactive),
		session = Teleport.session(reactive);
	
	if(!user || !session)
		return null;
	
	return user.id == session.ownerId;
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