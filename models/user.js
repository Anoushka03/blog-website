//jshint esverion:6
const mongoose = require("mongoose");

//user schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        //required: true
    },
    email: {
        type: String,
        //required: true
    },
    userName: {
        type: String,
        //required: true
    },
    password: {
        type: String,
        //required: true
    },
    img:String
});

//const User = mongoose.model("user", userSchema);

module.exports = User=mongoose.model("user", userSchema);