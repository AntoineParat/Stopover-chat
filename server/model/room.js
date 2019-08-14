const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const RoomSchema = new Schema({
    name: { type: String, unique: true, trim: true},
    type : {type: String, trim: true},
    users: [],
    ban : [],
    blocked : [],
    messages: [],
    admin: {type : String, trim: true},
    adminIp : {type : String, trim: true},
    password : {type : String, trim: true },
    createdAt: {type: Date,  expires: 43200}, //86400 expires in 24h 
    expiration : {type : Date}
},
);

const Room = mongoose.model('room', RoomSchema);

module.exports = Room;