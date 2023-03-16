async function login(){
    var email = document.getElementsByTagName('input')['email'].value;
    var password = document.getElementsByTagName('input')['password'].value;
    var req_body = {email:email,password:password};
    req_body=JSON.stringify(req_body);
    var response = await fetch('/login',{  
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: req_body
    })
    response = await response.json();
    if (response.status) window.location.href="/";
    else document.getElementsByClassName('error')[0].innerHTML=response.msg;
    
}
async function signup(){
    var email = document.getElementsByTagName('input')['email'].value;
    var password = document.getElementsByTagName('input')['password'].value;
    var con_password = document.getElementsByTagName('input')['con_password'].value;
    if(email==""){
        document.getElementsByClassName('error')[0].innerHTML="email is a required field";
        return ;
    }
    if(password==""){
        document.getElementsByClassName('error')[0].innerHTML="password is a required field";
        return ;
    }
    if(con_password==""){
        document.getElementsByClassName('error')[0].innerHTML="confirm password is a required field";
        return ;
    }
    if(password==con_password){
    var req_body = {email:email,password:password};
    req_body=JSON.stringify(req_body);
    var response = await fetch('/signup',{  
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: req_body
    })
    response = await response.json();
    document.getElementsByClassName('error')[0].innerHTML=response.msg;
    }
    else document.getElementsByClassName('error')[0].innerHTML='password inconsistent';
}
async function forgotps(){
    var email = document.getElementsByTagName('input')['email'].value;
    if(email==""){
        document.getElementsByClassName('error')[0].innerHTML="email is a required field";
        return ;
    }
    var req_body = {email:email};
    req_body=JSON.stringify(req_body);
    var response = await fetch('/forgotps',{  
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: req_body
    })
    response = await response.json();
    document.getElementsByClassName('error')[0].innerHTML=response.msg;
}
async function resetps(){
    var password = document.getElementsByTagName('input')['password'].value;
    var con_password = document.getElementsByTagName('input')['con_password'].value;
    if(password==""){
        document.getElementsByClassName('error')[0].innerHTML="password is a required field";
        return ;
    }
    if(con_password==""){
        document.getElementsByClassName('error')[0].innerHTML="confirm password is a required field";
        return ;
    }
    if(password==con_password){
    var req_body = {password:password};
    req_body=JSON.stringify(req_body);
    var response = await fetch('/setps',{  
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: req_body
    })
    response = await response.json();
    document.getElementsByClassName('error')[0].innerHTML=response.msg;
    }
    else document.getElementsByClassName('error')[0].innerHTML='password inconsistent';
}