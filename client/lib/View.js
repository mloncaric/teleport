Teleport.View = function(template, events, helpers)
{
	this.template = template;
	
	this.visible = false;
	this.show = null;
	this.hide = null;
	
	if(events)
		Template[template].events(events);
	
	if(helpers)
		Template[template].helpers(helpers);
	
	Template[template].rendered = _.bind(function()
	{
		if(this.visible)
			return;
		
		this.visible = true;
		
		this.show && this.show();
	}, this);
	
	Template[template].destroyed = _.bind(function()
	{
		if(!this.visible)
			return;
		
		this.visible = false;
		
		this.hide && this.hide();
	}, this);
}