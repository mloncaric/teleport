UI.registerHelper("outlet", function() {
	var name = this.name;

	var outlet = Teleport.getOutlet(_.isString(name) ? name : null);

	return UI.Each(outlet.render.bind(outlet), UI.block(function() {
		return Template[this.get()].extend({
			data: function() {
				return {};
			}
		});
	}));
});

UI.registerHelper("readOnly", function() {
	return Teleport.context.readOnly;
});

UI.registerHelper("moment", function(value, format)
{
	return moment(value).format(format);
});

UI.registerHelper("room", function()
{
	return Teleport.context.room;
});

UI.registerHelper("user", function()
{
	return Teleport.user(true);
});

UI.registerHelper("session", function()
{
	return Teleport.session(true);
});

UI.registerHelper("owner", function()
{
	return Teleport.owner(true);
});