Teleport.View = function(template, options)
{
	this.template = template;
	this.options = options;
	
	this.context = _.omit(options, ["reactive", "events", "helpers", "data", "init", "show", "hide"]);
	
	this.visible = false;
	
	if(options.events)
		Template[template].events(options.events);
	
	if(options.helpers)
		Template[template].helpers(options.helpers);
	
	if(options.data)
		_.extend(Template[template], options.data);
	
	if(_.isFunction(options.init))
		options.init.call(this.context);
	
	Template[template].rendered = _.bind(this.show, this);
	Template[template].destroyed = _.bind(this.hide, this);
}

Teleport.View.prototype.show = function()
{
	if(this.visible)
		return;
	
	this.visible = true;
	
	if(_.isFunction(this.options.reactive))
		this.computation = Deps.autorun(_.bind(this.options.reactive, this));
	
	if(_.isFunction(this.options.show))
		this.options.show.call(this.context);
}

Teleport.View.prototype.hide = function()
{
	if(!this.visible)
		return;
	
	this.visible = false;
	
	if(_.isFunction(this.options.hide))
		this.options.hide.call(this.context);
	
	if(this.computation)
	{
		this.computation.stop();
		this.computation = null;
	}
}