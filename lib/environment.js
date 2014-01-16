Teleport = {};

Users = new Meteor.Collection("teleport_users");
Sessions = new Meteor.Collection("teleport_sessions");

SharedObjects = new Meteor.Collection("teleport_sharedObjects", {
    transform: function(item) {
		item.data = EJSON.parse(item.data);
		
        return item;
    }
});

OnlineUsers = new Meteor.Collection("room_onlineUsers");

pingStream = new Meteor.Stream("ping");