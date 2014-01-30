Teleport.View = function(template, options)
{
	this.template = template;
	this.options = options || {};
	
	this.context = _.omit(this.options, ["subscriptions", "sharedObjects", "events", "helpers", "data", "init", "show", "hide"]);
	
	this.visible = false;
	
	if(this.options.events)
		Template[template].events(this.options.events);
	
	if(this.options.helpers)
		Template[template].helpers(this.options.helpers);
	
	if(this.options.data)
		_.extend(Template[template], this.options.data);
	
	if(_.isFunction(this.options.init))
		this.options.init.call(this.context);
	
	Template[template].rendered = _.bind(this.show, this);
	Template[template].destroyed = _.bind(this.hide, this);
}

Teleport.View.prototype.show = function()
{
	if(!this.visible)
	{
		this.visible = true;
		
		if(_.isFunction(this.options.subscriptions))
			//this.options.subscriptions.call(this.context);
			this.subscriptionsComputation = Deps.autorun(_.bind(this.options.subscriptions, this.context));
		
		var sharedObjects = this.options.sharedObjects;
		if(sharedObjects)
		{
			if(_.isFunction(sharedObjects))
				this.options.sharedObjects = sharedObjects = sharedObjects.call(this.context);
			
			_.each(sharedObjects, function(sharedObject)
			{
				sharedObject.activate();
			});
		}
		
		console.log(this.template, "show");
		
		if(_.isFunction(this.options.show))
			this.options.show.call(this.context);
	}
	
	console.log(this.template, "rendered");
	
	if(_.isFunction(this.options.rendered))
		this.options.rendered.call(this.context);
}

Teleport.View.prototype.hide = function()
{
	if(!this.visible)
		return;
	
	this.visible = false;
	
	console.log(this.template, "hide");
	
	if(_.isFunction(this.options.hide))
		this.options.hide.call(this.context);
	
	if(this.subscriptionsComputation)
	{
		this.subscriptionsComputation.stop();
		this.subscriptionsComputation = null;
	}
	
	_.each(this.options.sharedObjects, function(sharedObject)
	{
		sharedObject.deactivate();
	});
}

Teleport.View.prototype.get = function(key)
{
	return this.context[key];
}

Teleport.View.prototype.set = function(key, value)
{
	return this.context[key] = value;
}

Teleport.View.prototype.call = function(methodName)
{
	var method = this.context[methodName];
	
	if(!_.isFunction(method))
		return;
	
	return method.apply(this.context, Array.prototype.slice.call(arguments, 1));
}