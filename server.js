const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Preference = require('./models/preferences');
const jwt = require('jsonwebtoken');
const { response } = require('express');
mongoose.connect('mongodb+srv://akshitha:akshitha@cluster0.4iviwmv.mongodb.net/?retryWrites=true&w=majority')
app=express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));
app.get('/data/:city',(req,res)=>{
    this.res=res;
    function respond(data){
        this.res.send(data);
    }
    respond=respond.bind(this);
    var city = req.params.city;
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=18f3f8149007befb7c68afdce646f455`)
    .then((response)=>response.json())
    .then(respond);
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
    res.cookie('token',token).json(response);
})
app.get('/logout',(req,res)=>{
    res.cookie('token','',{
        expires:new Date(0)
    }).redirect('/');
})
app.get('/pref/get',async (req,res)=>{
    const userId = "640db962098f28f4bdf00cb9";
    var preferences = await Preference.findOne({userId:userId});
    preferences={preferences:preferences.preferences};
    return res.json(preferences);
})
app.get('/pref/del/:city',async(req,res)=>{
    const city=req.params.city;
    const userId = "640db962098f28f4bdf00cb9";
    var preferences = await Preference.findOne({userId:userId});
    preferences.preferences = preferences.preferences.filter(
        (pref)=>{return pref!=city}
    );
    await preferences.save();
    res.send();
})
app.get('/pref/add/:city',async(req,res)=>{
    const city=req.params.city;
    const userId = "640db962098f28f4bdf00cb9";
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