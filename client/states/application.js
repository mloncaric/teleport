application = function()
{
	var states = [trackUser, main];
	
	if(definedStates.application)
		states.unshift(definedStates.application);
	
	Teleport.queue(states);
}

function trackUser(state)
{
	Teleport.setView(definedViews.loading);
	
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

function main(state)
{
	if(definedViews.application)
		Teleport.setView(definedViews.application);
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