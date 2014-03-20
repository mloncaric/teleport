Outlet = function(name)
{
	this.name = name || "";
	
	this.dict = new ReactiveDict;
	
	this.defaultTemplate = null;
}

Outlet.prototype.isEmpty = function()
{
	return !_.size(this.dict.get("templates"));
}

Outlet.prototype.hasTemplate = function(template)
{
	return _.contains(this.dict.get("templates"), template);
}

Outlet.prototype.setDefaultTemplate = function(template)
{
	var defaultTemplate = this.defaultTemplate;
	
	if(defaultTemplate)
	{
		if(template == defaultTemplate)
			return;
		
		this.defaultTemplate = null;
		
		this.removeTemplate(defaultTemplate);
	}
	
	this.defaultTemplate = template;
	
	if(this.isEmpty())
		this.setTemplate(template);
}

Outlet.prototype.setTemplates = function(templates)
{
	if(_.isEmpty(templates))
		this.setTemplate(null);
	else
		this.dict.set("templates", templates);
}

Outlet.prototype.setTemplate = function(template)
{
	if(this.defaultTemplate && !template)
		template = this.defaultTemplate;
	
	this.dict.set("templates", template ? [template] : null);
}

Outlet.prototype.addTemplate = function(template)
{
	var templates = this.dict.get("templates") || [];
	
	if(_.contains(templates, template))
		return;
	
	templates.push(template);
	
	this.dict.set("templates", templates);
}

Outlet.prototype.removeTemplate = function(template)
{
	var templates = this.dict.get("templates") || [];
	
	if(!_.contains(templates, template))
		return;
	
	templates.splice(_.indexOf(templates, template), 1);
	
	this.setTemplates(templates);
}

Outlet.prototype.render = function()
{
	var templates = this.dict.get("templates") || [];
	
	console.log("render", this.name, templates);
	
	return templates;
}