//jshint esversion:6
const localStrategy=require("passport-local").Strategy;
const user=require("../models/user");
const config=require("../config/database");
const bcrypt=require("bcryptjs");
//const express=require("express");

const express      = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const flash        = require('req-flash');
 
const app          = express();
 
app.use(cookieParser());
app.use(session({ secret: 'secret',resave:true,saveUninitialized:true }));
app.use(flash());


module.exports=function(passport){
    //local strategy
    passport.use("local",new localStrategy({usernameField: 'username',
    passwordField: 'password',passReqToCallBack : true},
        function(username,password,done){
        //match username
        let query={username:username};
        user.findOne(query,function(err,foundUser){
            if(err)
            {
                throw err;
            }
            if(!foundUser)
            {
                return done(null ,false,{message:"no user found"});
            }

            //match password
            bcrypt.compare(password,foundUser.password,function(err,isMatch){
                if(err)
                {
                    throw err;
                }
                if(isMatch){
                    return done(null,foundUser);
                }
                else{
                    return done(null,false,{message:"wrong password"});
                }
            });
        });
    }));
    passport.serializeUser(function(foundUser, done) {
        done(null, foundUser.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, foundUser) {
          done(err, foundUser);
        });
      });
}