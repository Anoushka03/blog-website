//jshint esversion:6
const bcrypt = require("bcryptjs");
const express      = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const User = require("../models/user");
const Post=require("../models/post");
const _=require("lodash");
const mongoose=require("mongoose");
const MongoDBStore = require('connect-mongodb-session')(session);
const app=express();
var store=new MongoDBStore( require("../config/database"));
const path = require('path');
const multer=require("multer"); 

var storage=multer.diskStorage({
    destination:"./public/uploads/",
    filename:(req,file,cb)=>{
        cb(null,file.filename+"_"+Date.now()+path.extname(file.originalname));
    }
});


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

var upload=multer({
    storage:storage
}).single("file");

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
                        password: password,
                        img:"default-image-png.png"
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
                    
                        req.session.userID=foundUser._id;
                        //console.log("login"+req.session.userID);
                        //return res.redirect("/users/compose");
                        //res.render("compose",{username:foundUser.userName,title_edit:"",body_edit:""});
                        Post.find({userID:foundUser._id}, function (err, posts) {
                            if (!err) {
                                console.log(foundUser.img);
                                res.render("dashboard", {blogs: posts,username:foundUser.userName,searches:"",title_error:"",img_name:foundUser.img,img_error:""});
                            }
                        });
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
                    title: _.toLower(req.body.postTitle),
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
                                res.render("dashboard", {blogs: posts,username:foundUser.userName,searches:"",title_error:"",img_name:foundUser.img,img_error:""});
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
                        //console.log(foundUser.image);
                        res.render("dashboard", {blogs: posts,username:foundUser.userName,searches:"",title_error:"",img_name:foundUser.img,img_error:""});
                    }
                });
                
            }
        }
    });
});

router.post("/dashboard",upload,function(req,res)
{
    let exts=[".png",".jpeg",".jpg",".gif"];
    let search=req.body.search;
    let searchBar=req.body.searchBar;
    let title_error="";
    let flag=0;
    let img_error="";
    console.log(req.file+" image");
    let image=req.file;
    //console.log(req.body.upload+ "upload");
    if(image!=undefined)
    {
        image=req.file.filename;
        let ext=_.toLower(path.extname(image));
        
        if(exts.includes(ext,0)===false)
        {
            flag=1;
        }
        //console.log(ext+" extension");
    }
    //console.log(image+" image");
    
    // if(search!=undefined)
    // {
        
    //     User.findOne({_id:req.session.userID},function(err,foundUser){
    //         if(!err)
    //         {
    //             if(foundUser)
    //             {
    //                 if(image!=undefined && flag===0)
    //                 {
    //                     foundUser.img=image;
    //                     foundUser.save(function(err){
    //                         if(err)
    //                         {
    //                             throw err;
    //                         }
    //                     });
    //                 }
    //                 Post.find({userID:foundUser._id}, function (err, posts) {
    //                     if (!err) 
    //                     {
    //                         Post.find({title:_.toLower(search)},function(err,foundTitle){
    //                             if(!err)
    //                             {
    //                                 if(foundTitle)
    //                                 {
    //                                     if(foundTitle.length===0)
    //                                     {
    //                                         title_error="title doesn't exists";
    //                                     }

    //                                     res.render("dashboard",{blogs:posts,username:foundUser.userName,searches:foundTitle,title_error:title_error,img_name:foundUser.img,img_error:""});
    //                                 }
                                   
    //                             }
    //                         });
    //                     }
                            
                         
    //                 });
                    
    //             }
    //         }
    //     });   
    // }
    // else
    // {
    //     User.findOne({_id:req.session.userID},function(err,foundUser){
    //         if(!err)
    //         {
    //             if(foundUser)
    //             {
    //                 if(image!=undefined && flag===0)
    //                 {
    //                     foundUser.img=image;
    //                     foundUser.save(function(err){
    //                         if(err)
    //                         {
    //                             throw err;
    //                         }
    //                     });
    //                 }
    //                     Post.find({userID:foundUser._id}, function (err, posts) {
    //                         if (!err) 
    //                         {
    //                             if(flag===1)
    //                             {
    //                                 img_error="invalid file type";
    //                             }
    //                             res.render("dashboard",{blogs:posts,username:foundUser.userName,searches:"",title_error:"",img_name:foundUser.img,img_error:img_error});   
    //                         }
                                
    //                     });
                    
    //             }
    //         }
    //     });
    // }

    
    if(req.body.upload==="Upload" && flag===0)
    {
        User.findOne({_id:req.session.userID},function(err,foundUser){
            if(!err)
            {
                if(foundUser)
                {
                    //if(image!=undefined && flag===0)
                    //{
                        foundUser.img=image;
                        foundUser.save(function(err){
                            if(err)
                            {
                                throw err;
                            }
                        });
                    //}
                        Post.find({userID:foundUser._id}, function (err, posts) {
                            if (!err) 
                            {
                                
                                res.render("dashboard",{blogs:posts,username:foundUser.userName,searches:"",title_error:"",img_name:foundUser.img,img_error:img_error});   
                            }
                                
                        });
                    
                }
            }
        });   
    }
    else if(req.body.remove==="Remove")
    {
        User.findOne({_id:req.session.userID},function(err,foundUser){
            if(!err)
            {
                if(foundUser)
                {
                    //if(image!=undefined && flag===0)
                    //{
                        foundUser.img="default-image-png.png";
                        foundUser.save(function(err){
                            if(err)
                            {
                                throw err;
                            }
                        });
                    //}
                        Post.find({userID:foundUser._id}, function (err, posts) {
                            if (!err) 
                            {
                                
                                res.render("dashboard",{blogs:posts,username:foundUser.userName,searches:"",title_error:"",img_name:foundUser.img,img_error:img_error});   
                            }
                                
                        });
                    
                }
            }
        });
    }
    else if(searchBar==="Search")
    {
        User.findOne({_id:req.session.userID},function(err,foundUser){
            if(!err)
            {
                if(foundUser)
                {
                    // if(image!=undefined && flag===0)
                    // {
                    //     foundUser.img=image;
                    //     foundUser.save(function(err){
                    //         if(err)
                    //         {
                    //             throw err;
                    //         }
                    //     });
                    // }
                    Post.find({userID:foundUser._id}, function (err, posts) {
                        if (!err) 
                        {
                            Post.find({title:_.toLower(search)},function(err,foundTitle){
                                if(!err)
                                {
                                    if(foundTitle)
                                    {
                                        if(foundTitle.length===0)
                                        {
                                            title_error="title doesn't exists";
                                        }

                                        res.render("dashboard",{blogs:posts,username:foundUser.userName,searches:foundTitle,title_error:title_error,img_name:foundUser.img,img_error:""});
                                    }
                                   
                                }
                            });
                        }
                            
                         
                    });
                    
                }
            }
        });
    }
    else
    {
        res.redirect("/users/dashboard");
    }

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
                                        res.render("dashboard",{blogs:found,username:foundUser.userName,searches:"",title_error:"",img_name:foundUser.img,img_error:""});

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