var sharedObjects = {};

Teleport.SharedObject = function(name, options)
{
	this.name = name;
	this.options = options || {};
	
	this.context = _.omit(this.options, ["reset", "sync", "init"]);
	
	this.active = false;
	
	var instances = sharedObjects[name];
	
	if(!instances)
		sharedObjects[name] = [this];
	else
		instances.push(this);
	
	if(_.isFunction(this.options.init))
		this.options.init.call(this.context);
}

Teleport.SharedObject.prototype.get = function(key)
{
	if(!this.data)
		return null;
	
	return _.clone(this.data[key]);
}

Teleport.SharedObject.prototype.set = function(key, value)
{
	var data = {};
	data[key] = value;
	
	return this.setMany(data);
}

Teleport.SharedObject.prototype.setMany = function(data)
{
	if(!data)
		return null;
	
	var deferred = jQuery.Deferred();
	
	Teleport.call("updateSharedObject", this.name, data, function(error, result)
	{
		if(!error && result)
			deferred.resolve();
		else
			deferred.reject(error);
	});
	
	return deferred.promise();
}

Teleport.SharedObject.prototype.reset = function()
{
	var deferred = jQuery.Deferred();
	
	Teleport.call("resetSharedObject", this.name, function(error, result)
	{
		if(!error && result)
			deferred.resolve();
		else
			deferred.reject(error);
	});
	
	return deferred.promise();
}

Teleport.SharedObject.prototype.sync = function(data, force)
{
	if(!force && _.isEqual(data, this.data))
		return;
	
	this.data = data;
	
	if(!this.active)
		return;
	
	if(_.isFunction(this.options.reset) && _.isEqual(data, {}))
		this.options.reset.call(this.context);
	
	if(_.isFunction(this.options.sync) && !_.isEmpty(data))
		this.options.sync.call(this.context);
}

Teleport.SharedObject.prototype.activate = function()
{
	if(this.active)
		return;
	
	this.active = true;
	
	if(!this.data)
		Teleport.call("createSharedObject", this.name);
	else
		this.sync(this.data, true);
}

Teleport.SharedObject.prototype.deactivate = function()
{
	if(!this.active)
		return;
	
	this.active = false;
}

Deps.autorun(function()
{
	SharedObjects.find().forEach(function(item)
	{
		_.each(sharedObjects[item.name], function(sharedObject)
		{
			sharedObject.sync(item.data);
		});
	});
	
	var item = null;
	for(var name in sharedObjects)
	{
		item = SharedObjects.findOne({name: name});
		
		if(!item)
			Teleport.call("createSharedObject", name);
	}
});