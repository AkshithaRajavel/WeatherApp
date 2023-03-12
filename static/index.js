"use strict";
function api_callback(response){
    if(response.cod!=200){
        document.getElementById("status").innerHTML=`Invalid region`;
        return;
    }
    document.getElementById("status").innerHTML='5 Days Forecast';
    document.getElementById("city_details").innerHTML=`
        <div><h1>City Name</h1><h2>${response.city.name}</h2></div>
        <div><h1>Latitude</h2><h2>${response.city.coord.lat}</h2></div>
        <div><h1>Longitude</h1><h2>${response.city.coord.lon}</h2></div>`
    var data={};
    function rec(res){
        var data = new Object();
        for(var i in res){
            if(typeof(res[i])!='object')data[i]=res[i];
            else data = {...data,...rec(res[i])};
        }
        return data;
    }
    for(var i of response['list']){
        var info = rec(i);
        [date,time] = info["dt_txt"].split(" ");
        if((date in data)==0)data[date]={};
        data[date][time]=info;
    };
    var forecast = (date,time,icon)=>`
    <div id='${date}_${time}' class='${date}'>
        <h3>${time}</h3>
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png">
        <div><h1>Weather</h1><h3 class="api_res description"></h3></div>
        <div><h1>Temperature</h1><h3 class="api_res temp"></h3></div>
        <div><h1>Humidity</h1><h3 class="api_res humidity"></h3></div>
        <div><h1>Pressure</h1><h3 class="api_res pressure"></h3></div>
        <div><h1>Wind Angle</h1><h3 class="api_res deg"></h3></div>
        <div><h1>Wind Speed</h1><h3 class="api_res speed"></h3></div>
        </div>
    `
    var day_cnt=0,time_cnt=0;
    document.getElementById("forecast_5days").innerHTML="";
    for(var date in data){
        document.getElementById("forecast_5days").innerHTML+=`<div id='${date}'></div>`
        document.getElementById(`${date}`).innerHTML+=`<h2>${date}</h2>`;
        document.getElementById(`${date}`).innerHTML+='<div class="select_time"></div>'
        var time_cnt=0;
        for(var time in data[date]){
            document.getElementsByClassName("select_time")[day_cnt].innerHTML+=`<button
             onclick=switch_time('${date}','${time}')>${time}</button>`
            document.getElementById(`${date}`).innerHTML+=forecast(date,time,data[date][time].icon);
    
            var d = document.getElementById(`${date}_${time}`);
            for(var i of d.getElementsByClassName('api_res'))
            i.innerHTML = data[date][time][i.className.split(" ")[1]];
            if(time_cnt>0)d.style.display='none';
            time_cnt++;
        }
        day_cnt++;
    }
}
function switch_time(date,time){
    for(var t of document.getElementsByClassName(date)){
        if(t.id==`${date}_${time}`)t.style.display='';
        else t.style.display='none';
    }
}
function get_weather(city){
    fetch(`/data/${city}`)
    .then((response)=>response.json())
    .then(api_callback)
}
function get_city(ip){
    fetch(`https://ip.city/api.php?ip=${ip}&key=a3eee3a76ef4c7be6b9de7440f898ddc`)
    .then((response)=>response.json())
    .then((data)=>{
        var city=data.city;
        get_weather(city)
    })
}
function get_ip(){
    fetch('https://api.ipify.org')
    .then((response)=>response.text())
    .then((ip)=> get_city(ip))
}
async function add_pref(){
    if(document.cookie==""){
    document.getElementsByClassName('error')[0].innerText="Login to add preferences";
    return;}
    var city=document.getElementsByTagName('input')['preference'].value;
    city = city.toLowerCase();
    await fetch(`/pref/add/${city}`);
    disp_pref();
}
async function del_pref(city){
    await fetch(`/pref/del/${city}`);
    disp_pref();
}
async function disp_pref(){
    var cities = await fetch('/pref/get');
    cities=await cities.json();
    cities=cities.preferences
    document.getElementById("preferences").innerHTML="";
    for(var city of cities){
    var preference=`<div id='preference'><button onclick='get_weather("${city}")'>${city}
    </button><button onclick='del_pref("${city}")'>X</button></div>`
    document.getElementById("preferences").innerHTML+=preference;
    }
}
document.addEventListener('DOMContentLoaded',()=>{
    if(document.cookie==""){
        document.getElementById('in-out').innerText='LOGIN';
        document.getElementById('in-out').href="/login.html";
    }
    else {
        document.getElementById('in-out').innerText='LOGOUT';
        document.getElementById('in-out').href="/logout";
        disp_pref();
    }
    //get_ip();
});