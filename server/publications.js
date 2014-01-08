Meteor.publish("tport_users", function()
{
	return Users.find();
});

Meteor.publish("tport_sessions", function()
{
	return Sessions.find();
});

Meteor.publish("onlineUsers", function(room)
{
	return OnlineUsers.find({room: room});
});

Meteor.publish("sharedObjects", function(room)
{
	return SharedObjects.find({room: room});
});

// Permissions
SharedObjects.allow(
{ insert: function() { return true; }
, update: function() { return true; }
});