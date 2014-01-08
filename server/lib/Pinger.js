var EventEmitter = Npm.require("events").EventEmitter;

var pingers = {};

Pinger = function(room)
{
	this.room = room;
	
	this.running = false;
	this.pingId = 0;
	this.timeoutId = 0;
	
	this.numUsers = 0;
	this.users = {};
	
	pingers[room] = this;
	
	EventEmitter.call(this);
}

Pinger.prototype.__proto__ = EventEmitter.prototype;

Pinger.prototype.add = function(id)
{
	++this.numUsers;
	this.users[id] = new Averager;
	
	if(this.numUsers > 1)
		return;
	
	this.run();
}

Pinger.prototype.remove = function(id)
{
	--this.numUsers;
	delete this.users[id];
	
	if(this.numUsers > 0)
		return;
	
	this.stop();
}

Pinger.prototype.run = function()
{
	if(this.running)
		return;
	
	this.running = true;
	
	this.execute();
}

Pinger.prototype.stop = function()
{
	if(!this.running)
		return;
	
	this.running = false;
	
	Meteor.clearTimeout(this.timeoutId);
}

Pinger.prototype.execute = function()
{
	this.timeoutId = Meteor.setTimeout(this.intervalHandler.bind(this), 5000);
}

// Event handlers
Pinger.prototype.intervalHandler = function()
{
	var rtt = NaN;
	
	if(this.pingId)
	{
		for(var id in this.users)
		{
			rtt = this.users[id].roundCurrent;
			
			if(!rtt)
				continue;
			
			this.emit("interval", this.pingId, id, rtt);
		}
	}
	
	pingStream.emit("ping", {id: ++this.pingId, room: this.room, startTime: new Date().getTime()});
	
	this.execute();
}

pingStream.on("pong", function(data)
{
	var difference = new Date().getTime() - data.startTime,
		pinger = pingers[data.room];
	
	console.log(data.id + ". Client", this.userId, "ping was:", difference, "ms");
	
	/*if(data.id != pinger.pingId)
		return;*/
	
	pinger.users[this.userId].roundAverage(difference);
});

// Permissions
pingStream.permissions.read(function(userId, eventName)
{
	return true;
});