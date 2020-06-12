//jshint esversion:6
const express=require("express");
const router=express.Router();
const bcrypt=require("bcryptjs");
const expressValidator=require("express-validator");

const flash=require("connect-flash");
//Bring in user model
let User=require("../models/user");
router.get("/register",function(req,res){
    res.render("register");
});

router.use(expressValidator());

//registration process
router.post("/register",function(req,res){
    const name=req.body.name;
    const email=req.body.email;
    const userName=req.body.userName;
    const password=req.body.psw;
    const confirmPassword=req.body.psw2;

    req.checkBody(name,"Name is required").notEmpty();
    req.checkBody(email,"Email is required").notEmpty();
    req.checkBody(email,"Email is not valid").isEmail();
    req.checkBody(userName,"Username is required").notEmpty();
    req.checkBody(password,"Password is required").notEmpty();
    req.checkBody(confirmPassword,"Password do not match").equals(req.body.psw);

    let errors=req.validationErrors();
    if(errors)
    {
        res.render("register",{errors:errors});
    }else{
        let newUser=new User({
            name:name,
            email:email,
            userName:userName,
            password:password
        });
        bcrypt.genSalt(10,function(err,salt){
            bcrypt.hash(newUser.password,salt,function(err,hash){
                if(err){
                    console.log(err);
                    return;
                }
                    newUser.password=hash;
                    newUser.save(function(err){
                        if(err){
                            console.log(err);
                        }else{
                            req.flash("success","You are now registered and can log in");
                            res.redirect("/users/login"); 
                        }
                    });
                    
            });
        });
    }

});
router.get("/login",function(req,res){
    res.render("login");
});
module.exports=router;