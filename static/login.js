async function login(){
    var username = document.getElementsByTagName('input')['username'].value;
    var password = document.getElementsByTagName('input')['password'].value;
    var req_body = {username:username,password:password};
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
    var username = document.getElementsByTagName('input')['username'].value;
    var password = document.getElementsByTagName('input')['password'].value;
    var con_password = document.getElementsByTagName('input')['con_password'].value;
    if(username==""|password==""){
        document.getElementsByClassName('error')[0].innerHTML="invalid username or password";
        return ;
    }
    if(password==con_password){
    var req_body = {username:username,password:password};
    req_body=JSON.stringify(req_body);
    var response = await fetch('/signup',{  
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: req_body
    })
    response = await response.json();
    if (response.status) window.location.href="/login.html";
    else document.getElementsByClassName('error')[0].innerHTML=response.msg;
    }
    else document.getElementsByClassName('error')[0].innerHTML='password inconsistent';
    
}