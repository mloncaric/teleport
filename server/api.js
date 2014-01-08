var Future = Npm.require("fibers/future");

var _methods = {};

Teleport.methods = function(methods)
{
	_methods = _.extend(_methods, methods);
}

Teleport.overrideMethod = function(methodName, withFunction)
{
	_methods[methodName] = _.wrap(_methods[methodName], withFunction);
}

Teleport.getService = function(user)
{
	return Users.findOne({id: user.profile});
}

// Private
Meteor.methods({methodWithContext: methodWithContext});

rooms = {};

Teleport.Context = new Meteor.EnvironmentVariable;

function methodWithContext(context, methodName, methodArguments)
{
	var roomId = context.roomId;
	
	if(roomId)
	{
		context.room = rooms[roomId];
		context.session = Sessions.findOne({room: roomId});
	}
	
	context.meteorUserId = this.userId;
	context.meteorUser = Meteor.users.findOne(context.meteorUserId);
	context.userId = context.meteorUser.profile;
	context.user = Teleport.getService(context.meteorUser);
	
	return Teleport.Context.withValue(context, function()
	{
		return _methods[methodName].apply(context, methodArguments);
	});
}

Teleport.http = function(service, method, path, data)
{
	if(service)
	{
		var headers = {Accept: "application/json", Authorization: "ApiKey " + service.username + ":" + service.apiKey};
		
		if(data)
			data.headers = data.headers ? _.extend(data.headers, headers) : headers;
		else
			data = {headers: headers};
	}
	
	var future = new Future;
	
	HTTP.call(method, path, data, function(error, result)
	{
		if(error)
			RavenLogger.log(error.message);
		
		future.return(!error ? result.data || true : null);
	});
	
	return future.wait();
}

Teleport.link = function(path, query)
{
	var context = Teleport.Context.get();
	
	return URI(context.teleportDomain)
	.segment(path)
	.segment("/")
	.query(query || {})
	.normalize().toString();
}