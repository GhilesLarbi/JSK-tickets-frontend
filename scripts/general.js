const APP = (function () {
    const HOSTNAME = "https://stadium-tickets-api.onrender.com"
    // const HOSTNAME = "http://127.0.0.1:3000"


    let notificationsElm
    let uniqueNotificationId = 0
    let retryBtnElm






    // #################### Notification #############################
    function Notification(message, type) {
        this.message = message
        this.type = type
        this.id = uniqueNotificationId
        uniqueNotificationId += 1
    }

    Notification.prototype.push = function () {
        const not = document.createElement("div")
        not.classList.add("notification")

        not.setAttribute("data-notification-id", this.id)

        if (this.type === "loading") {
            not.classList.add("notification_loading")
        } else if (this.type === "true") {
            not.classList.add("notification_true")
        } else if (this.type === "false") {
            not.classList.add("notification_false")
        }


        not.innerHTML = `
            <div class="notification-icons">
                <i class="fas fa-spinner notification-icon notification-icon_loading"></i>
                <i class="fa-solid fa-check notification-icon notification-icon_true"></i>
                <i class="fa-solid fa-xmark notification-icon notification-icon_false"></i>
            </div>
            <p class="notification-message">${this.message}</p>
        `

        notificationsElm.appendChild(not)
        not.style.height = not.clientHeight + "px"
    }


    Notification.prototype.pop = function () {
        const not = notificationsElm.querySelector(`.notification[data-notification-id="${this.id}"]`)
        not.classList.add("notification_pop")
        setTimeout(() => {
            not.classList.add("notification_remove")
            setTimeout(() => {
                not.remove()
            }, 100);
        }, 500);
    }

    Notification.prototype.popAfter = function (time) {
        setTimeout(() => {
            this.pop()
        }, time);
    }







    // this function runs on every page
    async function initial() {


        // add notifications
        notificationsElm = document.createElement("div")
        notificationsElm.classList.add("notifications")
        document.body.appendChild(notificationsElm)


        // Yo, let's load up this sick theme.
        if (localStorage.getItem("theme") === "dark") switchTheme("dark")

        // Let's slap on a 'no internet' overlay to the page, just in case the Wi-Fi dips out.
        // One thin', if you add the template directly, the event listeners straight up stop working.
        // So, brace yourself for some janky code, my dude.

        const noInternetTemplate = `
            <div class="container">
                <h1 class="text-heading">Can't reach the API at the moment</h1>
                <p class="text-body">We apologize, but it seems that we are unable to connect to the API at the moment. Please
                    check your internet connection and try again later. If the problem persists, please contact support for further
                    assistance.</p>
            
                <button class="btn btn_primary">Retry <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `

        const noInternetOverlayElm = document.createElement("div")
        noInternetOverlayElm.classList.add("overlay")
        noInternetOverlayElm.innerHTML = noInternetTemplate

        document.body.appendChild(noInternetOverlayElm)
        retryBtnElm = document.querySelector(".overlay .btn")



        // let's add some wait-for-click promise functionality up in here.
        retryBtnElm.waitForClick = function () {
            return new Promise((resolve) => {
                this.addEventListener("click", () => {
                    resolve();
                })
            })
        }




        // check if the token is valid
        if (localStorage.getItem("token")) {
            const userRequest = await fetch("user")

            if (!userRequest.success) localStorage.removeItem("token")
            else {
                document.body.classList.add("loged-in")
                const userLogedNot = new Notification("You loged in", "true")
                userLogedNot.push()
                userLogedNot.popAfter(2000)
            }
        }

        // add some listeners
        addListeners()
    }

    // fire up the initial function
    initial()


    function addListeners() {
        // ################################ input ################################### 
        document.querySelectorAll(".input").forEach((inputElm, index) => {
            // When the value changes, we gotta ditch that error class from the input 
            inputElm.addEventListener("input", (e) => {
                inputElm.classList.remove("input_error")
            })

            // Click on '.input' and we'll auto-magically focus on that cowboy.
            inputElm.addEventListener("click", (e) => {
                inputElm.children[1].focus()
            })

            // We need to add a focus class to all the '.input' elements
            inputElm.children[1].addEventListener("focus", () => {
                inputElm.classList.add("input_focus")
            })

            // When we're done, let's take off that focus class from all the '.input' elements
            inputElm.children[1].addEventListener("focusout", () => {
                inputElm.classList.remove("input_focus")
            })
        })

        // ############################# switch theme button ##############################
        const switchThemeBtnElm = document.querySelector(".switch-theme-btn")
        if (switchThemeBtnElm) switchThemeBtnElm.addEventListener("change", switchTheme)



        // ############################# show user dropdown ################################
        const primaryHeaderAccountElm = document.querySelector(".primary-header-account ")
        if (primaryHeaderAccountElm) primaryHeaderAccountElm.addEventListener("click", (e) => {
            e.preventDefault()
            primaryHeaderAccountElm.parentElement.classList.toggle("primary-header-user_showdrop")
        })


        // ############################# disconnect ################################
        const disconnectBtnElm = document.querySelector(".dropdwon-link_logout")
        if (disconnectBtnElm) disconnectBtnElm.addEventListener("click", (e) => {
            e.preventDefault()
            localStorage.removeItem("token")
            window.location.reload()
        })


        // ############################## fixed header ##############################
        const primaryHeaderElm = document.querySelector(".primary-header")

        if (primaryHeaderElm) {
            const primaryHeaderHeight = primaryHeaderElm.offsetHeight

            document.addEventListener("scroll", e => {
                if (window.pageYOffset > primaryHeaderHeight && window.pageYOffset < 900) {
                    primaryHeaderElm.classList.add("primary-header_hide")
                } else {
                    primaryHeaderElm.classList.remove("primary-header_hide")
                }

                if (window.pageYOffset > 450) {
                    document.body.classList.add("fixed-header")
                    document.body.style.paddingTop = primaryHeaderHeight + "px"
                } else {
                    document.body.classList.remove("fixed-header")
                    document.body.style.paddingTop = "0px"
                }
            })
        }
    }


    // let's drop a function in here to switch up the theme.
    function switchTheme(theme) {
        if (theme === "dark") {
            document.documentElement.classList.add("dark-theme")
            localStorage.setItem("theme", "dark")
            document.querySelector(".switch-theme-btn").checked = true
        } else if (theme === "light") {
            document.documentElement.classList.remove("dark-theme")
            localStorage.setItem("theme", "light")
            document.querySelector(".switch-theme-btn").checked = false
        } else {
            // Let's toggle that thing  if none of the above parameters are given
            if (document.documentElement.classList.contains("dark-theme")) return switchTheme("light")
            else return switchTheme("dark")
        }

        const themeNot = new Notification(`Switch theme to ${theme}`, "true")
        themeNot.push()
        themeNot.popAfter(2000)
    }


    // Let's show, hide, or toggle that 'no internet' overlay, depending on the situation dude
    function noInternetOverlay(option) {
        if (option === "show") document.body.classList.add("show-no-internet-overlay")
        else if (option === "hide") document.body.classList.remove("show-no-internet-overlay")
        else {
            if (document.body.classList.contains("show-no-internet-overlay")) noInternetOverlay("hide")
            else noInternetOverlay("show")
        }
    }


    //  we need to snag the remaining time from a timestamp
    function getRemainigTime(timestamp) {
        days = Math.floor(timestamp / 86400000)
        hours = Math.floor(timestamp / 3600000) - days * 24
        minutes = Math.floor(timestamp / 60000) - days * 1440 - hours * 60
        seconds = Math.floor(timestamp / 1000) - days * 86400 - hours * 3600 - minutes * 60
        return [
            (days < 10) ? "0" + String(days) : String(days),
            (hours < 10) ? "0" + String(hours) : String(hours),
            (minutes < 10) ? "0" + String(minutes) : String(minutes),
            (seconds < 10) ? "0" + String(seconds) : String(seconds),
        ]
    }




    // #################################################
    // ############### UTILITY FUNCTIONS ###############
    // #################################################


    // Just give me your first initial, fam
    async function init(callback) {
        await callback()
        return true
    }


    // Let's whip up a custom fetch function.
    async function fetch(url, opt) {

        // if no options provided use empty one
        if (!opt) opt = {}
        if (!opt.headers) opt.headers = {}



        // construct the default options
        const options = { headers: {} }

        // set the method
        if (opt.method) options.method = opt.method
        else options.method = "GET"

        // stringify the body by default
        if (opt.body) options.body = JSON.stringify(opt.body)


        // set the content type to json by default
        if (opt.headers["Content-Type"]) options.headers["Content-Type"] = opt.headers["Content-Type"]
        else options.headers["Content-Type"] = "application/json"

        // set the authorization token if any
        const token = localStorage.getItem("token")
        if (token) options.headers.authorization = `Bearer ${token}`


        // construct the query
        let query = ""
        if (opt.query) query = "?" + new URLSearchParams(opt.query)

        // console.log(`${HOSTNAME}/api/${url}${query}`)
        // console.log(options)

        let res
        try {
            res = await window.fetch(`${HOSTNAME}/api/${url}${query}`, options)
            // hide the overlay if everything went well
            noInternetOverlay("hide")
        } catch (err) {

            // show the overlay in case of error
            noInternetOverlay("show")

            // Let's wait for that retry button to get clicked, and then run this function again recursively.
            // That way, if we ain't got no connection, we'll just chill and wait until it's back, and then we'll keep on truckin'
            await retryBtnElm.waitForClick()
            return await fetch(url, opt)
        }


        // get the actual data
        const data = await res.json()
        return data
    }


    // Alright, time to get this party started - let's fire up that counter element
    function startCounter(counterElems, timestamp) {
        setInterval(() => {
            let timeLeft = getRemainigTime(timestamp - (new Date).getTime())
            counterElems.forEach((elem, i) => {
                elem.firstChild.textContent = timeLeft[i]
            })
        }, 1000)
    }


    // we gotta amp up our inputValidator function with some dope validators
    const VALIDATORS = {
        email: (value) => {
            const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!value.match(validRegex))
                return false
        },
        empty: (value) => {
            if (!value || value == "") return false
        }

    }

    // We gotta make sure these inputs are legit - time to validate
    function inputValidator(inputElem, message, validator) {
        if (!validator || validator(inputElem.children[1].value) === false) {
            inputElem.setAttribute("data-err", message)
            inputElem.classList.add("input_error")
            return false
        }
        return inputElem.children[1].value
    }






    return {
        HOSTNAME,
        VALIDATORS,
        init,
        fetch,
        inputValidator,
        startCounter,
        Notification
    }
})()