Teleport.queue = function(states)
{
	var deferred = jQuery.Deferred(),
		promise = deferred.promise(),
		queue = new Queue(states, deferred);
	
	queue.start();
	
	return promise;
}

function Queue(states, status)
{
	this.states = states;
	this.status = status;
}

Queue.prototype.start = function()
{
	var deferred = jQuery.Deferred();
	
	this.chain(0, deferred);
	
	var self = this;
	
	deferred.promise()
	.done(this.status.resolve)
	.fail(function(error)
	{
		definedStates.error(self.start.bind(self), error);
	});
}

Queue.prototype.chain = function(i, status)
{
	var state = this.states[i];
	
	if(!state)
	{
		status.resolve();
		
		return;
	}
	
	var deferred = jQuery.Deferred(),
		promise = deferred.promise();
	
	var returnedPromise = state(deferred);
	if(returnedPromise && returnedPromise != promise)
		promise = returnedPromise;
	
	var self = this;
	
	promise
	.done(function(data)
	{
		if(data)
			Teleport.context = $.extend(true, Teleport.context, data);
		
		self.chain(i + 1, status);
	})
	.fail(status.reject);
}