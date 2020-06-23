//jshint esversion:6
const express=require("express");
const router=express.Router();

let Post = require('../models/post');
// User Model
let User = require('../models/user');

router.get("/posts/compose",function(req,res){
    res.render("compose");
});


router.post("/posts/compose", function (req, res) {

    const post = new Post({
        title: req.body.postTitle,
        post: req.body.postBody,
        userID:req.user._id
    });
    console.log(req.user._id);
    post.save(function (err) {
        if (!err) 
        {
            Post.find({userID:req.user._id}, function (err, posts) {
                if (!err) {
                    console.log( (posts));
                    res.render("home", {blogs: posts});
                }
            });
        }
    });


});
module.exports=router;