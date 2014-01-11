// TODO: Hook with Teleport.View - events should fire only when view is visible
// Get rid of Session dependencies

Teleport.SharedObject = function(name)
{
	if(!name)
		return null;
	
	var sharedObject = sharedObjects[name];
	
	if(!sharedObject)
	{
		sharedObject = sharedObjects[name] = new SharedObject(name);
		
		Teleport.call("createSharedObject", name);
	}
	
	return sharedObject;
}

Deps.autorun(function()
{
	SharedObjects.find().forEach(function(item)
	{
		var sharedObject = sharedObjects[item.name];
		
		if(!sharedObject)
			sharedObjects[item.name] = new SharedObject(item.name, item);
		else
			syncObject(sharedObject, item);
	});
});

function syncObject(sharedObject, item)
{
	sharedObject.synced = true;
	sharedObject._id = item._id;
	
	var pendingData = sharedObject.pendingData;
	if(pendingData)
	{
		sharedObject.pendingData = null;
		
		updateData(sharedObject, pendingData);
		
		return;
	}
	
	if(_.isEqual(item.data, sharedObject.data))
		return;
	
	sharedObject.data = item.data;
	
	Session.set("sharedObject_" + sharedObject.name, item.data);
	
	if(_.isEqual(item.data, {}))
		_.each(sharedObject.resetHandlers, function(handler) { handler(); });
	
	if(!_.isEmpty(item.data))
		_.each(sharedObject.syncHandlers, function(handler) { handler(); });
}

var sharedObjects = {};

function SharedObject(name, item)
{
	this.name = name;
	this._id = null;
	this.data = null;
	this.synced = !!item;
	this.syncHandlers = [];
	this.resetHandlers = [];
	
	this.pendingData = null;
	
	if(item)
	{
		this._id = item._id;
		this.data = item.data;
		
		Session.set("sharedObject_" + name, item.data);
	}
}

SharedObject.prototype.getData = function(reactive)
{
	if(reactive)
	{
		var item = Session.get("sharedObject_" + this.name);
		
		if(item)
			return item;
	}
	
	return this.data;
}

SharedObject.prototype.get = function(key)
{
	if(!this.data)
		return null;
	
	return _.clone(this.data[key]);
}

SharedObject.prototype.set = function(key, value)
{
	var data = {};
	data[key] = value;
	
	updateData(this, data);
}

SharedObject.prototype.reset = function()
{
	this.pendingData = null;
	
	if(this._id)
		SharedObjects.update({_id: this._id}, {$set: {data: {}}});
}

SharedObject.prototype.on = function(event, handler)
{
	if(event == "sync")
	{
		this.syncHandlers.push(handler);
		
		if(this.synced && !_.isEmpty(this.data))
			handler();
	}
	else if(event == "reset")
		this.resetHandlers.push(handler);
}

function updateData(sharedObject, data)
{
	if(sharedObject._id)
		SharedObjects.update({_id: sharedObject._id}, {$set: {data: data}});
	else
		sharedObject.pendingData = $.extend(true, sharedObject.pendingData || {}, data);
}