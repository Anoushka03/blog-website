//jshint esverion:6
const mongoose=require("mongoose");
 mongoose.connect("mongodb://localhost:27017/blogDB",{useNewUrlParser:true,useUnifiedTopology:true});

//user schema
const userSchema={
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
};

const User=module.exports=mongoose.model("user",userSchema);