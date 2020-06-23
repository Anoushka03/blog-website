// jshint esversion:6
const mongoose = require("mongoose");

const postsSchema = mongoose.Schema({
    title: String,
    post: String,
    userID:String
});

module.exports=Post=mongoose.model("posts",postsSchema);

