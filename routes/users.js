//jshint esversion:6
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const expressValidator = require("express-validator");
const validator=require("email-validator");
//const { sanitizeBody } = require('express-validator/filter');

const flash = require("connect-flash");

let name_error="",email_error="",userName_error="",password_error="",confirmPassword_error="";
let valid;
//Bring in user model
let User = require("../models/user");
router.get("/register", function (req, res) {
    res.render("register",{name_error:"",email_error:"",userName_error:"",
        password_error:"",confirmPassword_error:""});
});

router.use(expressValidator());

//registration process
router.post("/register", function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const userName = req.body.userName;
    const password = req.body.psw;
    const confirmPassword = req.body.psw2;

    //validation
    valid="true";
    if(name==="")
    {
        name_error="Please enter your name";
        valid="false";
    }
    if(validator.validate(email)===false)
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
        password_error:password_error,confirmPassword_error:confirmPassword_error});
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
                }
            });

        });
    });
    }
});
router.get("/login", function (req, res) {
    res.render("login");
});
module.exports = router;