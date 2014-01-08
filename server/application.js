process.env.NODE_ENV = "production";

var EventEmitter = Npm.require("events").EventEmitter;
Teleport.events = new EventEmitter;

RavenLogger.initialize({server: "http://86a64bffb4bf4a268487bcaa5f720669:de4fcc9b326b48e4a0118872a2fd1a2e@sentry.teleporthq.com/5"});

Teleport.events.on("startup", function(clients)
{
	OnlineUsers.remove({});
});