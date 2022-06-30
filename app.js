//jshint esversion:6
require('dotenv').config();   // for env variables
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); // to encrypt our data


mongoose.connect('mongodb://localhost:27017/userDB');
 
//creating new schema for userDB
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// const secret = "Thisisourlittlesecret."; // creating a secret key that is used to encrypt our database

console.log(process.env.API_KEY); // will print the content of API_KEY which is in .env file

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password'] });    // adding encrypt as a plugin to our schema and pass over secret as JS object and this before mongoose model because we are passing userSchema as a parameters to create new mongoose model

//creating new collection 'users' in userDB
const User = new mongoose.model("User", userSchema);

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", function(req,res){
    res.render('home');
});

app.get("/login", function(req,res){
    res.render('login');
});

app.get("/register", function(req,res){
    res.render('register');
});


app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save(function(err){    // here behind mongoose encryption will encrypt our password field
        if(err){
            console.log(err);
        }else{
            res.render("secrets");   // will render secrets page only from register and login route
        }
    });
});

app.post("/login", function(req, res){
    const userName = req.body.username;
    const password = req.body.password;
    
    User.findOne({email: userName}, function(err,userFound){  // here mongoose encryption will decrypt our password field
        if(!err){
            if(userFound){
                if(password == userFound.password){
                    res.render("secrets");
                }else{
                    console.log("Wrong password");
                }
            }else{
                console.log("User not found");
            }
        }else{
            console.log(err);
        }
    });
    
});








app.listen(3000, function(){
    console.log("Server started at 3000")
});