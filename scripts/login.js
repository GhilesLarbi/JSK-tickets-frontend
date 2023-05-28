APP.addNavbar("..")
APP.initial()
APP.isLogedIn()

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
const sendEmailBtnElm = document.querySelector(".send-email-btn")
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


    loginBtnElm.setAttribute("disabled", "true")
    const waitNot = new APP.Notification("Please wait...", "loading")
    waitNot.push()

    let endPoint = "user"
    if (params.actor == "admin") endPoint = "admin" 

    const data = await APP.fetch(`${endPoint}/login`, {
        method: "POST",
        body: { email, password }
    })


    waitNot.pop()
    loginBtnElm.removeAttribute("disabled")

    if (!data.success) {
        if (data.field == "email")
            APP.inputValidator(emailInputElm, data.message)
        else if (data.field == "password")
            APP.inputValidator(passwordInputElm, data.message)

        return
    }


    // save the token to use it else where
    if (endPoint == "admin") {
        localStorage.setItem("adminToken", data.data.token)

        const pagesIndex = window.location.pathname.indexOf("/pages")
        window.location.href = window.location.origin + window.location.pathname.slice(0, pagesIndex) + "/pages/dashboard.html"
        // window.location.href = window.location.href.replace("login.html", "dashboard.html")
    }
    else {
        localStorage.setItem("token", data.data.token)
        const pagesIndex = window.location.pathname.indexOf("/pages")
        window.location.href = window.location.origin + window.location.pathname.slice(0, pagesIndex)
        // window.location.href = window.location.href.replace("/pages/login.html", "")
    }
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


    nextRegisterBtnElm.setAttribute("disabled", "true")
    const waitNot = new APP.Notification("Please wait...", "loading")
    waitNot.push()


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

        waitNot.pop()
        nextRegisterBtnElm.removeAttribute("disabled")
        return
    }


    // log in
    const loginRequest = await APP.fetch("user/login", {
        method: "POST",
        body: { email, password }
    })

    localStorage.setItem("token", loginRequest.data.token)

    waitNot.pop()
    nextRegisterBtnElm.removeAttribute("disabled")

    // redirect to home page
    switchForms(2)
})


// ################ resend email #####################
sendEmailBtnElm.addEventListener("click", async (e) => {
    sendEmailBtnElm.setAttribute("disabled", "true")
    const waitNot = new APP.Notification("Please wait...", "loading")
    waitNot.push()

    const confirmEmailRequest = await APP.fetch("user/send/confirmation/email", {
        query: {
            url: `${window.location.origin}${window.location.pathname}?page=confirm_identity`
        }
    })

    let intervalCount = 60
    const interval = setInterval(() => {
        sendEmailBtnElm.childNodes[0].textContent = `Wait ${intervalCount}s to resend`
        intervalCount = intervalCount - 1
        if (intervalCount < 0) {
            sendEmailBtnElm.childNodes[0].textContent = `resend email`
            sendEmailBtnElm.removeAttribute("disabled")
            clearInterval(interval)
        }
    }, 1000);
    



    waitNot.pop()

    if (!confirmEmailRequest.success) {
        const errNot = new APP.Notification(confirmEmailRequest.message, "false")
        errNot.push()
        errNot.popAfter(3000)
        console.log(confirmEmailRequest)
        
    } else {
        const successNot = new APP.Notification(confirmEmailRequest.message, "true")
        successNot.push()
        successNot.popAfter(3000)
    }
})


// ################## create account ####################
createAccountBtnElm.addEventListener("click", async (e) => {
    const phoneInputElm = document.querySelector(".identity-phone-input")
    const phone = APP.inputValidator(phoneInputElm, "Dosen't look like an email", APP.VALIDATORS.empty)

    const natioanlNumberInputElm = document.querySelector(".identity-national-number-input")
    const nationalNumber = APP.inputValidator(natioanlNumberInputElm, "Passowrd cant't be empty", APP.VALIDATORS.empty)

    if (phone === false || nationalNumber === false) return


    createAccountBtnElm.setAttribute("disabled", "true")
    const waitNot = new APP.Notification("Please wait...", "loading")
    waitNot.push()



    const data = await APP.fetch("user", {
        method: "PUT",
        body: {
            phone,
            nationalNumber
        }
    })


    waitNot.pop()
    createAccountBtnElm.removeAttribute("disabled")

    if (!data.success) {
        if (data.field == "phone") 
            APP.inputValidator(phoneInputElm, data.message)
        else if (data.field == "nationalNumber") 
            APP.inputValidator(natioanlNumberInputElm, data.message)
        else {
            const errNot = new APP.Notification(data.message, "false")
            errNot.push()
            errNot.popAfter(3000)
        }
        return
    }

    const pagesIndex = window.location.pathname.indexOf("/pages")
    window.location.href = window.location.origin + window.location.pathname.slice(0, pagesIndex)
    // window.location.href = window.location.href.replace("/pages/login.html", "")
})