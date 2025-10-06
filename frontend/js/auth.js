document.addEventListener('DOMContentLoaded',function(){
    const signupForm=document.getElementById('signupForm');
    if(signupForm)
    {
        signupForm.addEventListener('submit',function(e)
    {
        e.preventDefault();
        const email=document.getElementById('email').value;
        const password=document.getElementById('password').value;
        firebase.auth().createUserWithEmailAndPassword(email,password)
        .then((userCredential)=>
        {
            userCredential.user.sendEmailVerification()
            .then(()=>{
                 alert("Signup successful! A verification email has been sent. Please verify your email before logging in.");
            window.location.href="index.html";
            })
            .catch((error)=>
        {
            alert("Failed to send verification mail:"+error.message);
        })
           
        })
        
        .catch((error)=>{
            alert("Oops !! signup failed :("+error.message);
        });
    });
    };
    const loginForm=document.getElementById('loginForm');
    if(loginForm)
    {
        loginForm.addEventListener('submit',(e)=>
        {
            e.preventDefault();
            const email=document.getElementById('email').value;
            const password=document.getElementById('password').value;
            firebase.auth().signInWithEmailAndPassword(email,password).then((userCredential)=>{
                const user=userCredential.user;
                if(user.emailVerified){
                alert("Yay!you have successfully logged in!");
                window.location.href="feed.html";
                }
                else
                {
                    firebase.auth().signOut();
                    alert("Please verify your email before logging in. A verification link has been sent to your email");
                }
            })
            .catch((error)=>alert("Oops!!login failed"));
        })
    }
    window.signInWithGoogle=function()
    {
        const provider=new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then((result)=>
        {
            const user=result.user;
            console.log("Google user logged in:",user);
            window.location.href="feed.html";
        })
        .catch((error)=>
        {
            alert("Google Sign-In failed:"+error.message);
        })
    }
})