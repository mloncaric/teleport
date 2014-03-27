initialize = function()
{
	var states = [trackUser];
	
	if(definedStates.initialize)
		states.unshift(definedStates.initialize);
	
	Teleport.queue(states).done(application);
}

function trackUser(state)
{
	Teleport.setTemplate(definedViews.loading);
	
	if(Teleport.context.readOnly)
	{
		state.resolve();
		
		return;
	}
	
	var stream = Meteor.connection._stream;
	/*stream.CONNECT_TIMEOUT = 5000;
	stream.RETRY_EXPONENT = 1;
	stream.RETRY_MAX_TIMEOUT = 30000;*/
	
	stream.on("message", function(message)
	{
		message = JSON.parse(message);
		
		if(message.msg == "connected")
			_trackUser(message.session);
	});
	
	return _trackUser(Meteor.connection._lastSessionId);
}

function _trackUser(clientId)
{
	var deferred = jQuery.Deferred();
	
	Teleport.call("trackUser", clientId, function(error, result)
	{
		if(!error && result)
			deferred.resolve();
		else
			deferred.reject(error);
	});
	
	return deferred.promise();
}

pingStream.on("ping", function(data)
{
	pingStream.emit("pong", data);
});