// let's peep that page query and bust out the right form like a boss.
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

if (params.page == "login") {
    switchForms(0)
} else if (params.page == "register") {
    switchForms(1)
} else if (params.page == "confirm_email") {
    switchForms(2)
} else if (params.page == "confirm_identity") {
    switchForms(3)
}


// Let's switch it up and bounce between these forms like it's no big thang
function switchForms(index) {
    const forms = document.querySelectorAll(".form-wrapper")
    forms.forEach(form => {
        form.classList.remove("form-wrapper_selected")
    })
    forms[index].classList.add("form-wrapper_selected")
}


const registerLinkElm = document.querySelector(".register-link")
const loginLinkElm = document.querySelector(".login-link")
const resendEmailLinkElm = document.querySelector(".resend-link")
const nextRegisterBtnElm = document.querySelector(".form-wrapper_signup .btn")
const loginBtnElm = document.querySelector(".form-wrapper_login .btn")
const createAccountBtnElm = document.querySelector(".form-wrapper_identity .btn")

registerLinkElm.addEventListener("click", e => {
    e.preventDefault()
    switchForms(1)
})

loginLinkElm.addEventListener("click", e => {
    e.preventDefault()
    switchForms(0)
})

// ################ LOGIN #####################

loginBtnElm.addEventListener("click", async () => {
    const emailInputElm = document.querySelector(".login-email-input")
    const email = APP.inputValidator(emailInputElm, "Dosen't look like an email", APP.VALIDATORS.email)

    const passwordInputElm = document.querySelector(".login-password-input")
    const password = APP.inputValidator(passwordInputElm, "Passowrd cant't be empty", APP.VALIDATORS.empty)

    if (email === false || password === false) return

    const data = await APP.fetch("user/login", {
        method: "POST",
        body: { email, password }
    })

    if (!data.success) {
        if (data.field == "email")
            APP.inputValidator(emailInputElm, data.message)
        else if (data.field == "password")
            APP.inputValidator(passwordInputElm, data.message)

        return
    }


    // save the token to use it else where
    localStorage.setItem("token", data.data.token)


    // redirect to home page
    window.location.href = window.location.origin

})



// ################ register #####################
nextRegisterBtnElm.addEventListener("click", async () => {
    // switchForms(2)
    const emailInputElm = document.querySelector(".signup-email-input")
    const email = APP.inputValidator(emailInputElm, "Dosen't look like an email", APP.VALIDATORS.email)

    const passwordInputElm = document.querySelector(".signup-password-input")
    const password = APP.inputValidator(passwordInputElm, "Passowrd cant't be empty", APP.VALIDATORS.empty)

    const usernameInputElm = document.querySelector(".signup-username-input")
    const username = APP.inputValidator(usernameInputElm, "User name cant't be empty", APP.VALIDATORS.empty)

    if (email === false || password === false || username === false) return

    const data = await APP.fetch("user", {
        method: "POST",
        body: { email, password, username }
    })

    if (!data.success) {
        if (data.field == "email")
            APP.inputValidator(emailInputElm, data.message)
        else if (data.field == "password")
            APP.inputValidator(passwordInputElm, data.message)
        else if (data.field == "username")
            APP.inputValidator(usernameInputElm, data.message)
        return
    }


    // log in
    const loginRequest = await APP.fetch("user/login", {
        method: "POST",
        body: { email, password }
    })

    localStorage.setItem("token", loginRequest.data.token)


    const confirmEmailRequest = await APP.fetch("user/send/confirmation/email", {
        query: {
            url: "http://127.0.0.1:5500/pages/login.html?page=confirm_identity"
        }
    })
    console.log(confirmEmailRequest)

    // redirect to home page
    switchForms(2)
})


// ################ resend email #####################
resendEmailLinkElm.addEventListener("click", async (e) => {
    e.preventDefault()
    const confirmEmailRequest = await APP.fetch("user/send/confirmation/email", {
        query: {
            url: "http://127.0.0.1:5500/pages/login.html?page=confirm_identity"
        }
    })
    console.log(confirmEmailRequest)
})


// ################## create account ####################
createAccountBtnElm.addEventListener("click", async (e) => {
    const phoneInputElm = document.querySelector(".identity-phone-input")
    const phone = APP.inputValidator(phoneInputElm, "Dosen't look like an email", APP.VALIDATORS.empty)

    const natioanlNumberInputElm = document.querySelector(".identity-national-number-input")
    const nationalNumber = APP.inputValidator(natioanlNumberInputElm, "Passowrd cant't be empty", APP.VALIDATORS.empty)
   
    if (phone === false || nationalNumber === false) return

    const data = await APP.fetch("user", {
        method: "PUT",
        body: {
            phone,
            nationalNumber
        }
    })
    
    console.log(data)
    
    window.location.href = window.location.origin
})

APP.init(()=>{})