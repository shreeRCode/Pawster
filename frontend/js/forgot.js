document.addEventListener('DOMContentLoaded',function()
{
    const forgotForm=document.getElementById('forgotPasswordForm');
    if(forgotForm)
    {
        forgotForm.addEventListener('submit',function(e)
    {
        e.preventDefault();
        const email=document.getElementById('resetEmail').value;
        firebase.auth().sendPasswordResetEmail(email).then(()=>
        {
            alert("Password reset link sent! Please check your email(including spam folder).")
            forgotForm.reset();
        })
        .catch((error)=>
        {
            alert("Error: " + error.message);
        })

    })
    }
})