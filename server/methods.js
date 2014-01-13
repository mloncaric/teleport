Teleport.methods(
{ fetchUser: fetchUser
, loginUser: loginUser
, loginGuest: loginGuest
, createSession: createSession
, fetchSession: fetchSession
, trackUser: trackUser
, createSharedObject: createSharedObject
, updateSharedObject: updateSharedObject
, resetSharedObject: resetSharedObject
});

function fetchUser(authToken)
{
	if(authToken)
	{
		var data = Teleport.http(null, "GET", Teleport.link("auth/session", {sessionid: authToken}));
		
		if(data)
			return updateUser(this.meteorUserId, data, true);
		
		return null;
	}
	
	return this.user;
}

function loginUser(data)
{
	if(!data)
		return null;
	
	return updateUser(this.meteorUserId, data);
}

function loginGuest(name)
{
	if(!name)
		return null;
	
	var data = createUser(name);
	
	if(!data)
		return null;
	
	return updateUser(this.meteorUserId, data, true);
}

function createSession(startDate)
{
	var data = Teleport.http
	( this.user
	, "POST"
	, Teleport.link("now/api/v1/instant_session")
	, {data: {start_date: startDate}}
	);
	
	if(!data)
		return null;
	
	return {room: data.access_key, shortLink: data.short_link};
}

function fetchSession()
{
	var data = Teleport.http
	( null
	, "GET"
	, Teleport.link(["sessions/api/v1/session_info", this.roomId])
	);
	
	if(!data)
		return null;
	
	updateUser(data.owner.id, data.owner, true);
	
	var session = updateSession(data, this.roomId),
		room = this.room;
	
	if(!room)
	{
		rooms[this.roomId] = room = new Room(this.roomId, {sessionId: session.id});
		
		room.on("connected", function(meteorUserId)
		{
			OnlineUsers.insert({id: Meteor.users.findOne(meteorUserId).profile, room: this.roomId});
		}.bind(this));
		
		room.on("disconnected", function(meteorUserId)
		{
			OnlineUsers.remove({id: Meteor.users.findOne(meteorUserId).profile, room: this.roomId});
		}.bind(this));
		
		Teleport.events.emit("room", room, session);
	}
	
	return	{ session: session
			, onlineUsersCount: room.numUsers
			};
}

function trackUser(clientId)
{
	var client = Meteor.server.sessions[clientId];
	
	if(!client)
		return false;
	
	this.room.trackUser(client);
	
	return true;
}

function createSharedObject(name)
{
	if(!SharedObjects.findOne({room: this.roomId, name: name}))
		SharedObjects.insert({room: this.roomId, name: name, data: {}});
	
	return true;
}

function updateSharedObject(name, data)
{
	var sharedObject = SharedObjects.findOne({room: this.roomId, name: name});
	
	if(!sharedObject)
		return false;
	
	SharedObjects.update({_id: sharedObject._id}, {$set: {data: data}});
	
	return true;
}

function resetSharedObject(name)
{
	var sharedObject = SharedObjects.findOne({room: this.roomId, name: name});
	
	if(!sharedObject)
		return false;
	
	SharedObjects.update({_id: sharedObject._id}, {$set: {data: {}}});
	
	return true;
}

// Login
function createUser(guestName)
{
	var data = Teleport.http
	( null
	, "POST"
	, Teleport.link("api/v1/auth/anonymous")
	, {data: {first_name: guestName}}
	);
	
	if(!data)
		return null;
	
	return _.extend(data, {name: guestName, avatar: "/default-avatar.png", is_anonymous: true});
}

function updateUser(meteorUserId, data, process)
{
	if(process)
	{
		data =
		{ id: data.id
		, username: data.username
		, apiKey: data.api_key
		, name: data.name
		, avatar: data.avatar || data.avatar_url
		, anonymous: data.is_anonymous
		};
		
		if(!data.apiKey)
			delete data.apiKey;
	}
	else
		delete data._id;
 	
	var user = Users.findOne({id: data.id});
	
	Meteor.users.update(meteorUserId, {$set: {profile: data.id}});
	
	if(!user)
	{
		Users.insert(data);
		
		return data;
	}
	
	Users.update({id: data.id}, {$set: data});
	
	return _.extend(user, data);
}

function updateSession(data, room)
{
	data =
	{ id: data.id
	, name: data.name
	, room: room
	, mode: data.mode
	, ownerId: data.owner.id
	, statusCode: data.status
	, status: data.status_name
	, shortLink: data.short_link
	, instantSession: data.type == "instant session"
	, participants: _.map(data.participants, function(user) { return user.id; })
	, maxParticipants: data.max_participants
	, createdAt: new Date(data.created_at)
	, startDate: new Date(data.start_date)
	, endDate: new Date(data.end_date)
	};
 	
	var session = Sessions.findOne({id: data.id});
	
	if(!session)
	{
		Sessions.insert(data);
		
		return data;
	}
	
	Sessions.update({id: data.id}, {$set: data});
	
	return _.extend(session, data);
}