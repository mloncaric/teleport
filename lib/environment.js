Teleport = {};

Users = new Meteor.Collection("tport_users");
Sessions = new Meteor.Collection("tport_sessions");

SharedObjects = new Meteor.Collection("tport_sharedObjects", {
    transform: function(item) {
		item.data = EJSON.parse(item.data);
		
        return item;
    }
});

OnlineUsers = new Meteor.Collection("room_onlineUsers");

pingStream = new Meteor.Stream("ping");