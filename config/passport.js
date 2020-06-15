 //jshint esversion:6
const flash        = require('req-flash');
const localStrategy=require("passport-local").Strategy;
const user=require("../models/user");
const config=require("../config/database");
const bcrypt=require("bcryptjs");
//const express=require("express");

const express      = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const session      = require('express-session');

 
const app          = express();
app.use(session({ secret: 'secret',resave:true,saveUninitialized:true }));
app.use(flash());
app.use(cookieParser());




module.exports=function (passport){
    //local strategy
    passport.use("local",new localStrategy({usernameField: 'username',
    passwordField: 'password',passReqToCallBack : true},
        function(username,password,done){
        //match username
        let query={username:username};
        console.log("hello");
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


// const passport = require('passport')
// const LocalStrategy = require('passport-local').Strategy
// const User = require('./model/user')
// const passportJWT = require('passport-jwt')
// const JWTStrategy = passportJWT.Strategy
// const ExtractJWT = passportJWT.ExtractJwt

// passport.use(new LocalStrategy({
//     usernameField: 'userName',
//     passwordField: 'password'
// }, async (userName, password, cb) => {
//     try {
//         let user = await User.findOne({ userName: userName })
//         console.log('passport-login',user)

//         if (!user) return cb(null, false, { message: 'Incorrect username' })

//         await user.comparePassword(password, (err, isMatch) => {
//             if(err) return cb(err)
//             if (!isMatch) return cb(null, false, { message: 'Incorrect password' })

//             return cb(null, user, { message: 'Login successfull' })
//         })


//     } catch (error) {
//         console.log(error)
//         cb(error)
//     }
// }))

// passport.use(new JWTStrategy({
//     jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.JWT_SECRET
// }, async (jwtPayload, cb) => {
//     try {
//         const user = await User.findOne({ _id: jwtPayload.id })
//         cb(null, user)
//     }
//     catch (err) {
//         cb(err)
//     }
// }))