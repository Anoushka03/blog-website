//jshint esversion:6
const flash = require("connect-flash");
const passport=require("passport");
const bcrypt = require("bcryptjs");
const expressValidator = require("express-validator");
const emailCheck=require("email-check");
const express      = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const app          = express();
const User = require("../models/user");
 
app.use(cookieParser());
app.use(session({ secret: 'secret' ,resave:true,saveUninitialized:true}));
app.use(flash());








let name_error="",email_error="",userName_error="",password_error="",confirmPassword_error="";
let exists_error="";
let valid;


router.get("/register", function (req, res) {
    res.render("register",{name_error:"",email_error:"",userName_error:"",
        password_error:"",confirmPassword_error:"",exists_error:""});
});

router.use(expressValidator());

//registration process
router.post("/register", function (req, res) {
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
router.get("/login", function (req, res) {
    res.render("login",{userName_error:"",password_error:""});
});

//login process
router.post("/login",function(req,res){
    let userName=req.params.userName;
    let password=""+req.params.psw;
    User.findOne({userName:userName},function(err,foundUser){
        if(!err)
        {
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function(err, isMatch) {
                    if (err) {
                      throw err
                    } else if (!isMatch) {

                        res.render("login",{userName_error:"",password_error:"Password do not match"});
                    } else {
                      res.render("compose",{user_id:foundUser._id});
                    }
                  })
               
            }
            else{
                res.render("login",{userName_error:"username does not exists",password_error:""});
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
          return res.redirect('/');
        }
      });
    }
  });
module.exports = router;