var _retry = null;
error = function(retry)
{
	_retry = retry;
	
	Teleport.setTemplate("default_error");
}

Template.default_error = Template.default_error.extend({
	events: {
		"click button": function() {
			_retry();
		}
	}
});