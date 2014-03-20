// IE...
if(!location.origin)
	location.origin = location.protocol + "//" + location.hostname;

Teleport.setTemplate = function(template, outletName)
{
	if(!template)
		return;
	
	var outlet = Teleport.getOutlet(outletName);
	
	outlet.setTemplate(template);
}

var outlets = {};
Teleport.getOutlet = function(name)
{
	name = name || "_";
	
	var outlet = outlets[name];
	
	if(outlet)
		return outlet;
	
	return outlets[name] = new Outlet(name);
}

// TODO: Use autorun and deps
Teleport.setState = function(state)
{
	if(state in states)
		states[state]();
}

var states =
{ boot: boot
, login: login
, start: start
, initialize: initialize
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
{ loading: "default_loading"
, notFound: "default_notFound"
, scheduling: "default_scheduling"
, application: "default_application"
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
	
	Teleport.setState("boot");
}

// Event handlers
function messageHandler(event)
{
	var data = event.data;
	
	if(!data.tool)
		return;
	
	clearTimeout(timeoutId);
	
	Teleport.context.tool = data.tool;
	Teleport.context.teleportDomain = data.teleportDomain;
	Teleport.context.user = data.user;
	
	kickoff();
}

Meteor.startup(function()
{
	timeoutId = setTimeout(kickoff, 2000);
});