const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Preference = require('./models/preferences');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require("nodemailer");
const { response } = require('express');
async function middleware(req,res,next){
    var token = req.cookies.token;
    try{
        var token_data = jwt.verify(token,'raven');
        const existing_user=await User({email:token_data.email});
        if(!existing_user)return res.json({status:0});
    }
    catch(error){
        return res.json({status:0});
    }
    req.cookies.email = token_data.email;
        next();
}
async function sendEmail(email,link,link_text){
    try{
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, 
            auth: {
              user: "2407akshi@gmail.com", 
              pass: "cltlofxoxvjslklb", 
            },
          });
          let info = await transporter.sendMail({
            from: '2407akshi@gmail.com', 
            to: email, 
            subject: "WeatherApp support", 
            html: `<a href=${link}>Click to ${link_text}</a>`,
          });
          var response= 1
    }
    catch(error){
        var response = 0;
    }
    return response;
}
mongoose.connect('mongodb+srv://akshitha:akshitha@cluster0.4iviwmv.mongodb.net/?retryWrites=true&w=majority')
app=express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));
app.use(cookieParser());
app.use('/pref',middleware);
app.set('trust proxy', true);
app.get('/data/lat-lon/:lat/:lon',async (req,res)=>{
    const lat=req.params.lat,lon=req.params.lon;
    var response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=18f3f8149007befb7c68afdce646f455`);
    response=await response.json();
    res.json(response);
})
app.get('/data/city/:city',async (req,res)=>{
    var city = req.params.city;
    var response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=18f3f8149007befb7c68afdce646f455`);
    response=await response.json();
    res.json(response);
})
app.post('/signup',async (req,res)=>{
    const {email,password,confirm_password}=req.body;
    const existing_user = await User.findOne({email:email});
    var response;
    if(existing_user)
        response = {status:0,msg:"user already exists.Login instead"};
    else{
        const token = jwt.sign({
            email: email,
            password:password
        },'raven');
        var status=sendEmail(email,`https://63a6-13-115-202-88.jp.ngrok.io/verify/${token}`,"verify email");
        if (status) response={status:1,msg:"Verification Link sent"}
        else response={status:0,msg:"Invalid Email"}
    }
    return res.json(response);
})
app.get('/verify/:token',async(req,res)=>{
    const token=req.params.token;
    try{
    const token_data = jwt.verify(token,'raven');
    const existing_user = await User.findOne({email:token_data.email});
    if(existing_user)return res.send("<h1>Email verified</h1>");
    const new_user = new User({
        email:token_data.email,
        password:token_data.password
    });
    const new_pref = new Preference({
        email:new_user.email,
        Preferences:[]
    })
    await new_pref.save();
    await new_user.save();
}
    catch(error){
        return res.send("<h1>Email verification Failed</h1>")
    }
    return res.send("<h1>Email verified</h1>");
})
app.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    const existing_user = await User.findOne({email:email});
    var response;
    if(!existing_user) {
        response = {status:0,msg:"Email not registered"};
        return res.json(response);
    }
    if(existing_user.password!=password) {
        response = {status:0,msg:"invalid password"};
        return res.json(response);
    }
    const token = jwt.sign({
        email:email
    },'raven');
    response={status:1};
    res.cookie('token',token);
    res.json(response);
})
app.get('/logout',(req,res)=>{
    res.cookie('token','',{
        expires:new Date(0)
    });
    res.redirect('/');
})
app.post('/forgotps',async (req,res)=>{
    const email = req.body.email;
    const existing_user = await User.findOne({email:email});
    var response;
    if(existing_user){
        const token = jwt.sign({
            email:email
        },'raven');
        const status=sendEmail(email,`https://63a6-13-115-202-88.jp.ngrok.io/resetps/${token}`,"reset password");
        if(status)response={status:1,msg:"Reset link sent."}
        else response={status:0,msg:"Invalid Email"}
    }
    else response={status:0,msg:"Unregistered Email"}
    res.json(response);
})
app.get('/resetps/:token',async(req,res)=>{
    try{
        const token=req.params.token;
        const token_data=jwt.verify(token,'raven');
        return res.cookie('token',token).redirect('/resetps.html');
    }
    catch(error){return res.send("<h1>Invalid Link</h1>")};
    });
app.post('/setps',async(req,res)=>{
    var response;
    try{
        const token=req.cookies.token;
        const token_data=jwt.verify(token,'raven');
        const email = token_data.email;
        const password=req.body.password;
        var existing_user = await User.findOne({email:email});
        existing_user.password=password;
        existing_user.save();
        response={status:1,msg:"Password reset successful"};
    }
    catch(error){
        response= {status:0,msg:"Password Reset Failed"};
    }
    res.json(response);
    });
app.get('/pref/get',async (req,res)=>{
    const email = req.cookies.email;
    var preferences = await Preference.findOne({email:email});
    preferences={status:1,email:email,cities:preferences.preferences};
    return res.json(preferences);
})
app.get('/pref/del/:city',async(req,res)=>{
    const city=req.params.city;
    const email = req.cookies.email;
    var preferences = await Preference.findOne({email:email});
    preferences.preferences = preferences.preferences.filter(
        (pref)=>{return pref!=city}
    );
    await preferences.save();
    res.json({status:1});
})
app.get('/pref/add/:city',async(req,res)=>{
    const city=req.params.city;
    const email = req.cookies.email;
    var preferences = await Preference.findOne({email:email});
    if(preferences.preferences.includes(city)==0){
        preferences.preferences.push(city);
        await preferences.save();
    }
    res.json({status:1});
})
//LISTEN
port = 8000;
app.listen(port,()=>console.log(`server started on port ${port}`));