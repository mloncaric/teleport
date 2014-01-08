var EventEmitter = Npm.require("events").EventEmitter;

var Clients = new Meteor.Collection("room_clients");

Room = function(id, userFields)
{
	this.id = id;
	this.userFields = userFields || {};
	
	this.numUsers = 0;
	this.users = {};
	
	EventEmitter.call(this);
}

Room.prototype.__proto__ = EventEmitter.prototype;

Room.prototype.trackUser = function(client)
{
	var userId = client.userId;
	
	if(!(userId in this.users))
	{
		++this.numUsers;
		this.users[userId] = new User(this);
	}
	
	if(!this.users[userId].has(client))
		this.users[userId].add(client);
}

Room.prototype.connected = function(userId)
{
	this.emit("connected", userId);
}

Room.prototype.disconnected = function(userId)
{
	this.emit("disconnected", userId);
}

function User(room)
{
	this.room = room;
	
	this.numClients = 0;
	this.clients = {};
}

User.prototype.has = function(client)
{
	return !!Clients.findOne(
	{ clientId: client.id
	, userId: client.userId
	, room: this.room.id
	});
}

User.prototype.add = function(client)
{
	var clientId = client.id,
		userId = client.userId,
		self = this;
	
	++this.numClients;
	this.clients[clientId] = client;
	
	Clients.insert(_.extend({clientId: clientId, userId: userId, room: this.room.id}, this.room.userFields));
	
	console.log(userId + " with session " + clientId + " logged in - " + this.room.id);
	
	client.socket.on("close", Meteor.bindEnvironment
	( function()
	{
		self.remove.bind(self)(clientId);
	}
	, function(error)
	{
		
	}));
	
	if(this.numClients > 1)
		return;
	
	this.room.connected(userId);
}

User.prototype.remove = function(clientId)
{
	delete this.clients[clientId];
	--this.numClients;
	
	var client = Clients.findOne({clientId: clientId});
	Clients.remove({clientId: clientId});
	
	var userId = client.userId;
	
	console.log(userId + " with session " + clientId + " logged out - " + client.room);
	
	if(this.numClients > 0)
		return;
	
	this.room.disconnected(userId);
	
	delete this.room.users[userId];
	--this.room.numUsers;
}

Meteor.startup(function()
{
	Teleport.events.emit("startup", Clients.find().fetch());
	
	Clients.remove({});
});