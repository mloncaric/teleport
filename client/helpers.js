Handlebars.registerHelper("outlet", function()
{
	var templateName = Session.get("tport-view");
	
	if(!(templateName in Template))
		return;
	
	return new Handlebars.SafeString(Template[templateName]());
});

Handlebars.registerHelper("moment", function(value, format)
{
	return moment(value).format(format);
});