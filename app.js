//jshint esversion:6
const flash = require("connect-flash");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const expressValidator = require("express-validator");

const config=require("./config/database");
//const passport=require("passport");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

let blogs = [];
let i = 0;
const app = express();

app.set('view engine', 'ejs');
app.use(session({ secret: 'secret',resave:true,saveUninitialized:true }));
// app.use(passport.initialize());
// app.use(passport.session());

// app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const postsSchema = mongoose.Schema({
    title: String,
    post: String,
    userID:String
});
const Post = mongoose.model("post", postsSchema);

app.get("/",function(req,res){
    res.render("welcome");
})
app.get("/home", function (req, res) {
    let id=req.body.user_id;
    Post.find({userID:id}, function (err, posts) {
        if (!err) {
            console.log(typeof (posts));
            res.render("home", {homeContent: homeStartingContent, blogs: posts,user_id:id});
        }
    });

    
});


// app.get("/about", function (req, res) {
//     res.render("about", {aboutContent: aboutContent,});
// });

// app.get("/contact", function (req, res) {
//     res.render("contact", {contactContent: contactContent});
// });

app.get("/compose", function (req, res) {
    res.render("compose",{user_id:req.body.user_id});
});


app.get("/posts/:postID", function (req, res) {


    Post.findOne({_id: req.params.postID}, function (err, foundPost) {


        res.render("post", {postTitle: foundPost.title, postContent: foundPost.post});

    });


});


app.post("/compose", function (req, res) {

    const post = new Post({
        title: req.body.postTitle,
        post: req.body.postBody,
        userID:req.body.user_id
    });
    post.save(function (err) {
        if (!err) {
            res.redirect("/home");
        }
    });


});





//route files
let users = require("./routes/users");
app.use("/users", users);


mongoose.connect("mongodb://localhost:27017/blogDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(3000, function () {
        console.log("Server started on port 3000");
    });
}).catch(err => {
    console.log(err)
})