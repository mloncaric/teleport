application = function()
{
	var states = [];
	
	if(definedStates.application)
		states.push(definedStates.application);
	
	Teleport.queue(states).done(start);
}