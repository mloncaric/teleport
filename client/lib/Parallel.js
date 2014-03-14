Teleport.parallel = function(methods)
{
	return function(state) {
		var methodsExecuted = 0,
			methodsCount = 4,
			context = {};

		_.each(methods, function(method) {
			wrap(method)
			.done(function(data) {
				if(data)
					context = $.extend(true, context, data);

				if(++methodsExecuted == methodsCount)
					state.resolve(context);
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