Room = function(data, reactive)
{
	this.id = data.id;
	this.name = data.name;
	this.room = data.room;
	this.shortLink = data.shortLink;
	this.instantSession = data.instantSession;
	this.mode = data.mode;
	this.accessNumber = data.accessNumber;
	
	this.opentokId = data.opentokId;
	
	this.ownerId = data.ownerId;
	this.owner = Users.findOne({id: data.ownerId}, {reactive: reactive});
	
	this.statusCode = data.statusCode;
	this.status = data.status;
	
	this.maxParticipants = data.maxParticipants;
	this.participants = _.map(data.participants, function(userId) { return Users.findOne({id: userId}, {reactive: reactive}); });
	
	this.createdAt = moment(data.createdAt);
	this.startDate = moment(data.startDate);
	this.endDate = moment(data.endDate);
}

Room.prototype.duration = function()
{
	return (this.endDate.valueOf() - this.startDate.valueOf()) / 1000;
}