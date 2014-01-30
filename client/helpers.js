// TODO: Add support for named outlets, that way user can control where to show a template
Handlebars.registerHelper("outlet", function(name, options)
{
	var outlet = Teleport.getOutlet(_.isString(name) ? name : null);
	
	return outlet.render();
});

Handlebars.registerHelper("moment", function(value, format)
{
	return moment(value).format(format);
});

Handlebars.registerHelper("room", function()
{
	return Teleport.context.room;
});

Handlebars.registerHelper("user", function()
{
	return Teleport.user();
});

Handlebars.registerHelper("session", function()
{
	return Teleport.session();
});