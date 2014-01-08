WebApp.connectHandlers
.use(connect.cookieParser())
.use(function(request, response, next)
{
	response.setHeader("X-UA-Compatible", "chrome=1");
	
	next();
});

WebApp.categorizeRequest = _.wrap(WebApp.categorizeRequest, function(categorizeRequest, request)
{
	var cookies = request.cookies,
		cookie = Meteor.settings.cookies.session,
		authToken = cookie in cookies ? cookies[cookie] : null;
	
	var result = categorizeRequest(request);
	result.authToken = authToken;
	
	return result;
});

WebApp.addHtmlAttributeHook(function(request)
{
	if(!request.authToken)
		return null;
	
	return "authToken=\"" + request.authToken + "\"";
});

Accounts.registerLoginHandler(function(options)
{
	// TODO: Check
	options.generateLoginToken = true;                                                                           // 552
    return Accounts.insertUserDoc(options, {});
});

/*Meteor.onConnection(function(connection)
{
	console.log(this, connection);
});*/