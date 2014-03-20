UI.body.outlet = function()
{
	var name = this.name;
	
	var outlet = Teleport.getOutlet(_.isString(name) ? name : null);
	
	return UI.Each(outlet.render.bind(outlet), UI.block(function() {
		return Template[this.get()].extend({
			data: function() {
				return {};
			}
		});
	}));
};