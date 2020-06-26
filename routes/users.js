//jshint esversion:6
const bcrypt = require("bcryptjs");
const express      = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const User = require("../models/user");
const Post=require("../models/post");
const mongoose=require("mongoose");
const MongoDBStore = require('connect-mongodb-session')(session);
const app=express();
var store=new MongoDBStore( require("../config/database"));

//middleware
router.use(cookieParser());
router.use(session({ secret: 'secret' ,resave:true,saveUninitialized:true,name:"sid",
cookie:
{
    path:"/",
    maxAge:60*60*60*2,
    sameSite:true,
    secure:"production"
},
store:store
}));

const redirectLogin=(req,res,next)=>{
    if((!req.session.userID)===true){
        //console.log(!req.session.userID+" hello");
        res.redirect("/users/login");
    }
    else{
        next();
    }
};

const redirectHome=(req,res,next)=>{
    if((!req.session.userId)){
        next();
        //res.redirect("/users/compose");
    }
    else
    {
        //console.log(!req.session.userID+" redirectHome ");
        res.redirec("/users/compose");
        //next();
    }
};









let name_error="",email_error="",userName_error="",password_error="",confirmPassword_error="";
let exists_error="";
let valid;

router.get("/",function(req,res){
    const{ userID}=req.session;
    //console.log(req.session+"ha"+userID);
    res.render("welcome");
})

router.get("/register",redirectHome, function (req, res) {
    res.render("register",{name_error:"",email_error:"",userName_error:"",
        password_error:"",confirmPassword_error:"",exists_error:""});
});



//registration process
router.post("/register",redirectHome, function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const userName = req.body.userName;
    const password = ""+req.body.psw;
    const confirmPassword =""+ req.body.psw2;

    //validation
    valid="true";
    if(name==="")
    {
        name_error="Please enter your name";
        valid="false";
    }
    
    if(email==="")
    {
        email_error="Please enter valid email address";
        valid="false";
    }
    if(userName==="")
    {
        userName_error="Please enter username";
        valid="false";
    }
    if(password==="")
    {
        password_error="Please enter password";
        valid="false";
    }
    if(confirmPassword!=password)
    {
        confirmPassword_error="Passwords do not match";
        valid="false";
    }


    if(valid==="false")
    {
        res.render("register",{name_error:name_error,email_error:email_error,userName_error:userName_error,
        password_error:password_error,confirmPassword_error:confirmPassword_error,exists_error:exists_error});
    }
    else
    {
        User.findOne({email:email},function(err,foundUser){
            if(!err){
                console.log(foundUser);
                if(foundUser){
                    res.render("register",{name_error:name_error,email_error:email_error,userName_error:userName_error,
                        password_error:password_error,confirmPassword_error:confirmPassword_error,exists_error:"User already exists"});
                }
                else{
                    let newUser = new User({
                        name: name,
                        email: email,
                        userName: userName,
                        password: password
                    });
                    
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(newUser.password, salt, function (err, hash) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            newUser.password = hash;
                            
                            newUser.save(function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    req.session.userID=newUser._id;
                                    console.log(req.session.userID+"reg");
                                    //req.flash("success", "You are now registered and can log in");
                                    res.redirect("/users/login");
                                    //res.render("login",{userName_error:"",password_error:""});
                                }
                            });
                            // newUser.save();
                            // res.redirect("/users/login");
                        });
                    });
                }
            }
        });

    }
});

//loginn form
router.get("/login",redirectHome, function (req, res) {
    res.render("login",{email_error:"",password_error:""});
});

//login process
router.post("/login",redirectHome, function(req,res){
    let email=req.body.email;
    let password=""+req.body.psw;
    User.findOne({email:email},function(err,foundUser){
        if(!err)
        {
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function(err, isMatch) {
                    if (err) {
                      throw err
                    } else if (!isMatch) {

                        res.render("login",{email_error:"",password_error:"Password do not match"});
                    } else {
                    //   res.render("compose");
                        req.session.userID=foundUser._id;
                        //console.log("login"+req.session.userID);
                        //return res.redirect("/users/compose");
                        res.render("compose",{username:foundUser.userName,title_edit:"",body_edit:""});
                    }
                  })
               
            }
            else{
                res.render("login",{email_error:"user does not exists",password_error:""});
            }
        }

    });


});

router.get("/compose",redirectLogin,function(req,res){
    User.findOne({_id:req.session.userID},function(err,foundUser){
        if(!err)
        {
            if(foundUser)
            {
                Post.find({userID:foundUser._id}, function (err, posts) {
                    if (!err) {
                        //console.log( (posts));
                        res.render("compose", {username: foundUser.userName,title_edit:"",body_edit:""});
                    }
                });   
            }
        }
    });

    
});

router.post("/compose", function (req, res) {
     
    User.findOne({_id:req.session.userID},function(err,foundUser){
        if(!err)
        {
            if(foundUser)
            {
                //console.log("found "+foundUser._id);
                const post = new Post({
                    title: req.body.postTitle,
                    post: req.body.postBody,
                    userID:foundUser._id
                });
                //console.log(req.session.userId+"compose");
                post.save(function (err) {
                    if (!err) 
                    {
                        Post.find({userID:foundUser._id}, function (err, posts) {
                            if (!err) {
                                //console.log( (posts));
                                res.render("dashboard", {blogs: posts,username:foundUser.userName});
                            }
                        });
                    }
                });

            }
        }
    });



});

router.get("/dashboard",function(req,res){
    User.findOne({_id:req.session.userID},function(err,foundUser){
        if(!err)
        {
            if(foundUser)
            {
                Post.find({userID:foundUser._id}, function (err, posts) {
                    if (!err) {
                        //console.log( (posts));
                        res.render("dashboard", {blogs: posts,username:foundUser.userName});
                    }
                });   
            }
        }
    });
});

router.get("/posts/:postID", function (req, res) {

    User.findOne({_id:req.session.userID},function(err,foundUser){
        if(!err)
        {
            if(foundUser)
            {
                Post.findOne({_id:req.params.postID},function(err,foundPost){
                    if(foundPost)
                    {
                        res.render("post",{postTitle:foundPost.title,postContent:foundPost.post,postID:foundPost._id});   
                    }
                });
            }
        }
    });
});

router.post("/posts/:postID/delete",function(req,res){
    User.findOne({_id:req.session.userID},function(err,foundUser){
        if(!err)
        {
            if(foundUser)
            {
                Post.findByIdAndDelete({_id:req.params.postID},function(err,foundPost){
                    if(!err)
                    {
                        if(foundPost)
                        {
                            Post.find({userID:foundUser._id},function(err,found){
                                if(!err)
                                {
                                    if(found)
                                    {
                                        res.render("dashboard",{blogs:found,username:foundUser.userName});

                                    }
                                }
                            });
                        }
                    }
                    
                });

            }
        }
    });

});

router.post("/posts/:postID/edit",function(req,res){
    let title="",body="";
    User.findOne({_id:req.session.userID},function(err,foundUser){
        if(!err)
        {
            if(foundUser)
            {
                Post.findByIdAndDelete({_id:req.params.postID},function(err,foundPost){
                    if(!err)
                    {
                        if(foundPost)
                        {
                            title=foundPost.title;
                            body=foundPost.post;
                            console.log(title+" "+body);
                            res.render("compose", {username: foundUser.userName,title_edit:title,body_edit:body});
                            //res.render("compose", {username: foundUser.userName,title_edit:foundPost.title,body_edit:foundPost.post});
                        }
                    }
                    
                });
                //res.render("compose", {username: foundUser.userName,title_edit:title,body_edit:body});
            }
        }
    });

});


//logout process
router.get('/logout', function(req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        } else {
            res.clearCookie("sid");
            return res.redirect('/users/');
        }
      });
    }
  });
module.exports = router;