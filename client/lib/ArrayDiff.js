Teleport.ArrayDiff = function(idFunction)
{
	this.idFunction = idFunction;
	
	this.syncedDataMap = {};
}

// TODO: Optimize :), Improve support for moved items
Teleport.ArrayDiff.prototype.sync = function(data)
{
	if(!_.isArray(data))
		return null;
	
	var self = this;
	
	var dataMap = _.object(_.map(data, function(value, index) {
		return [
			self.idFunction(value),
			{value: value, index: index}
		];
	}));
	
	var syncedDataKeys = _.keys(self.syncedDataMap),
		dataKeys = _.keys(dataMap),
		removedKeys = _.difference(syncedDataKeys, dataKeys),
		addedKeys = _.filter(dataKeys, function(key) { return !_.contains(syncedDataKeys, key); }),
		changedKeys = _.filter(_.intersection(syncedDataKeys, dataKeys), function(key) { return !_.isEqual(self.syncedDataMap[key], dataMap[key]); });
	
	var result = {
		removed: _.map(removedKeys, function(key) { return self.syncedDataMap[key]; }),
		added: _.map(addedKeys, function(key) { return dataMap[key]; }),
		changed: _.map(changedKeys, function(key) { return {old: self.syncedDataMap[key], new: dataMap[key]}; })
	};
	
	self.syncedDataMap = dataMap;
	
	return result;
}