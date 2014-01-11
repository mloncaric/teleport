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
	return Users.findOne({id: Meteor.user().profile}) || Teleport.context.user;
}

function prepareOnlineUsers()
{
	return _.map
	( OnlineUsers.find().fetch()
	, function(user) { return _.extend(user, Users.findOne({id: user.id})); }
	);
}

var sessions = {};
function prepareSession()
{
	var room = Teleport.context.room;
	
	if(room in sessions)
		return sessions[room];
	
	var data = Sessions.findOne({room: room});
	
	if(!data)
		return null;
	
	return sessions[room] = new Room(data);
}