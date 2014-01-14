var fs = Npm.require("fs"),
	path = Npm.require("path");

function iterate(currentPath)
{
	var folders = [],
		files = [],
		main = null;
	
	currentPath = path.resolve(currentPath);
	
	fs.readdirSync(currentPath).forEach(function(file)
	{
		var item = path.normalize(path.join(currentPath, file));
		
		if(file == "lib")
			Array.prototype.unshift.apply(folders, iterate(item));
		else if(file == "main.js")
			main = item;
		else if(fs.lstatSync(item).isDirectory())
			Array.prototype.push.apply(folders, iterate(item));
		else
			files.push(item);
	});
	
	if(main)
		files.push(main);
	
	Array.prototype.push.apply(folders, files);
	
	return folders;
}

Package.describe(
{ summary: "Teleport Library"
});

Npm.depends({
  "extend": "1.2.1"
});

Package.on_use(function(api)
{
	api.use(["handlebars", "jquery", "templating"], ["client"]);
	api.use(["underscore", "accounts-base", "deps", "streams", "raven", "uri-js", "momentjs", "ejson"], ["client", "server"]);
	api.use(["http", "webapp", "connect"], "server");
	
	api.add_files(iterate("packages/teleport/lib"), ["client", "server"]);
	
	api.add_files(iterate("packages/teleport/client"), "client");
	
	api.add_files(iterate("packages/teleport/server"), "server");
	
	api.export(["Teleport", "Pinger", "OnlineUsers", "Sessions", "Users"]);
});