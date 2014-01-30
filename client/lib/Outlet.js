Outlet = function(name)
{
	this.name = name || "";
	
	this.dict = new ReactiveDict;
	this.views = [];
	this.viewMap = {};
	
	this.defaultView = null;
}

Outlet.prototype.isEmpty = function()
{
	var views = this.dict.get("views");
	
	return !views || !views.length;
}

Outlet.prototype.hasView = function(view)
{
	var views = this.dict.get("views");
	
	return views && views.indexOf(view.template) > -1;
}

Outlet.prototype.setDefaultView = function(view)
{
	var defaultView = this.defaultView;
	
	if(defaultView)
	{
		if(view && view.template && defaultView.template)
			return;
		
		this.defaultView = null;
		
		this.removeView(defaultView);
	}
	
	this.defaultView = view;
	
	if(view && this.isEmpty())
		this.setView(view);
}

Outlet.prototype.setViews = function(views)
{
	if(this.defaultView && _.isEmpty(views))
		views = [this.defaultView];
	
	var viewKeys = _.map(views, function(view) {
		return view.template;
	});
	
	_.each(this.viewMap, function(view, key) {
		if(viewKeys.indexOf(key) > -1)
			return;
		
		view.hide();
	});
	
	this.viewMap = _.object(_.map(views, function(view) {
		return [
			view.template,
			view
		];
	}));
	
	this.dict.set("views", viewKeys);
}

Outlet.prototype.setView = function(view)
{
	if(this.defaultView && !view)
		view = this.defaultView;
	
	if(view)
		delete this.viewMap[view.template];
	
	_.each(this.viewMap, function(view) {
		view.hide();
	});
	
	this.viewMap = {};
	
	if(view)
		this.viewMap[view.template] = view;
	
	this.dict.set("views", view ? [view.template] : null);
}

Outlet.prototype.addView = function(view)
{
	var views = this.dict.get("views") || [];
	
	if(views.indexOf(view.template) > -1)
		return;
	
	this.viewMap[view.template] = view;
	
	views.push(view.template);
	
	this.dict.set("views", views);
}

Outlet.prototype.removeView = function(view)
{
	var views = this.dict.get("views") || [];
	
	if(!views || views.indexOf(view.template) < 0)
		return;
	
	view.hide();
	
	delete this.viewMap[view.template];
	
	views.splice(views.indexOf(view.template), 1);
	
	if(this.defaultView && _.isEmpty(views))
		views = [this.defaultView.template];
	
	this.dict.set("views", views);
}

Outlet.prototype.render = function()
{
	var views = this.dict.get("views") || [];
	
	if(_.isEqual(this.views, views))
		return this.cache ? new Handlebars.SafeString(this.cache) : undefined;
	
	this.views = views;
	
	console.log("render", this.name, views);
	
	var options = {
		fn: function(view) {
			return Spark.createLandmark({constant: true}, function() {
				return Template[view]();
			});
			
			return Spark.isolate(Template[view]);
		},
		inverse: function() {
			return "";
		}
	};
	
	return new Handlebars.SafeString(this.cache = Handlebars._default_helpers.each(views, options));
	
	return new Handlebars.SafeString(this.cache = Spark.createLandmark({constant: true}, function() {
		return Handlebars._default_helpers.each(views, options);
	}));
}

