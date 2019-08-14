const mongoose = require ('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email : {type: String, unique : true, trim : true, required : true},
    password : {type : String, trim: true, required : true },
    cus_id : {type : String},
    sub_id : {type : String},
    suscribtion : {type : String, default: false},
})

const User = mongoose.model('user', UserSchema);

module.exports = User;