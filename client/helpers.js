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
	return Teleport.user(true);
});

Handlebars.registerHelper("session", function()
{
	return Teleport.session(true);
});

Handlebars.registerHelper("owner", function()
{
	return Teleport.owner(true);
});