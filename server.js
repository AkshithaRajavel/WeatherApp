const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Preference = require('./models/preferences');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { response } = require('express');
mongoose.connect('mongodb+srv://akshitha:akshitha@cluster0.4iviwmv.mongodb.net/?retryWrites=true&w=majority')
app=express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));
app.use(cookieParser());
app.set('trust proxy', true)
app.get('/data',async (req,res)=>{
    const ip = req.ip;
    var city = await  fetch(`https://ip.city/api.php?ip=${ip}&key=a3eee3a76ef4c7be6b9de7440f898ddc`);
    city  = await city.json();
    res.json(city);
})
app.get('/data/:city',async (req,res)=>{
    var city = req.params.city;
    var response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=18f3f8149007befb7c68afdce646f455`);
    response=await response.json();
    res.json(response);
})
app.post('/signup',async (req,res)=>{
    const {username,password,confirm_password}=req.body;
    const existing_user = await User.findOne({username:username});
    var response;
    if(existing_user)
        response = {status:0,msg:"user already exists.Login instead"};
    else{
        const new_user = new User({
            username:username,
            password:password
        });
        const new_pref = new Preference({
            userId:new_user._id,
            Preferences:[]
        })
        await new_pref.save();
        await new_user.save();
        response={status:1}
    }
    return res.json(response);
})
app.post('/login',async (req,res)=>{
    const {username,password}=req.body;
    const existing_user = await User.findOne({username:username});
    var response;
    if(!existing_user) {
        response = {status:0,msg:"invalid username"};
        return res.json(response);
    }
    if(existing_user.password!=password) {
        response = {status:0,msg:"invalid password"};
        return res.json(response);
    }
    const token = jwt.sign({
        user: existing_user._id
    },'raven');
    response={status:1};
    res.cookie('token',token);
    res.cookie('userId',existing_user._id);
    res.json(response);
})
app.get('/logout',(req,res)=>{
    res.cookie('token','',{
        expires:new Date(0)
    });
    res.cookie('userId','',{
        expires:new Date(0)
    });
    res.redirect('/');
})
app.get('/pref/get',async (req,res)=>{
    const userId = req.cookies.userId;
    var preferences = await Preference.findOne({userId:userId});
    preferences={preferences:preferences.preferences};
    return res.json(preferences);
})
app.get('/pref/del/:city',async(req,res)=>{
    const city=req.params.city;
    const userId = req.cookies.userId;
    var preferences = await Preference.findOne({userId:userId});
    preferences.preferences = preferences.preferences.filter(
        (pref)=>{return pref!=city}
    );
    await preferences.save();
    res.send();
})
app.get('/pref/add/:city',async(req,res)=>{
    const city=req.params.city;
    const userId = req.cookies.userId;
    var preferences = await Preference.findOne({userId:userId});
    if(preferences.preferences.includes(city)==0){
        preferences.preferences.push(city);
        await preferences.save();
    }
    return res.send();
})
//LISTEN
port = 8000;
app.listen(port,()=>console.log(`server started on port ${port}`));