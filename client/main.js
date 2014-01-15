// IE...
if(!location.origin)
	location.origin = location.protocol + "//" + location.hostname;

var currentView = null;

Teleport.setView = function(view)
{
	if(!view)
		return;
	
	if(currentView)
	{
		if(view.template == currentView.template)
			return;
		
		currentView.hide();
	}
	
	currentView = view;
	
	Session.set("tport-view", view.template);
}

Teleport.setState = function(state)
{
	if(state in states)
		states[state]();
}

var states =
{ initialize: initialize
, login: login
, start: start
, application: application
};

Teleport.call = function(name)
{
	var args = Array.prototype.slice.call(arguments, 1),
		callback = null;
	
	if(args.length && typeof args[args.length - 1] === "function")
		callback = args.pop();
	
	var context =
	{ roomId: Teleport.context.room
	, teleportDomain: Teleport.context.teleportDomain
	};
	
    return Meteor.apply("methodWithContext", [context, name, args], callback);
}

Teleport.context =
{ room: location.pathname.replace(/\//g, "")
, authToken: $("html").attr("authToken")
, teleportDomain: Meteor.settings.public.server
};

definedStates =
{ error: error
};

Teleport.defineStates = function(states)
{
	definedStates = _.extend(definedStates, states);
}

definedViews =
{ loading: loadingView
, notFound: notFoundView
, scheduling: schedulingView
, application: applicationView
};

Teleport.defineViews = function(views)
{
	definedViews = _.extend(definedViews, views);
}

addEventListener("message", messageHandler, false);

var timeoutId = 0;

Teleport.kickoff = function()
{
	clearTimeout(timeoutId);
	
	kickoff();
}

function kickoff()
{
	removeEventListener("message", messageHandler, false);
	
	Teleport.setState("initialize");
}

// Event handlers
function messageHandler(event)
{
	var data = event.data;
	
	if(!data.tool)
		return;
	
	clearTimeout(timeoutId);
	
	Teleport.context.teleportDomain = data.teleportDomain;
	Teleport.context.user = data.user;
	
	kickoff();
}

Meteor.startup(function()
{
	timeoutId = setTimeout(kickoff, 2000);
});