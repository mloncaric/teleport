Teleport.parallel = function(methods)
{
	return function(state) {
		var context = {};
		
		var resolver = _.after(methods.length, function() {
			state.resolve(context);
		});

		_.each(methods, function(method) {
			wrap(method)
			.done(function(data) {
				if(data)
					context = $.extend(true, context, data);

				resolver();
			})
			.fail(state.reject);
		});
	};
}

function wrap(method)
{
	var state = new $.Deferred();
	
	return method(state) || state.promise();
}