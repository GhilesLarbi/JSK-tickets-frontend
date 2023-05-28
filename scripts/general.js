const APP = (function () {
    const HOSTNAME = "https://stadium-tickets-api.onrender.com"
    // const HOSTNAME = "http://localhost:3000"


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
        setTimeout(() => {
            not.classList.add("notification_show")
        }, 0);
    }


    Notification.prototype.pop = function () {
        const not = notificationsElm.querySelector(`.notification[data-notification-id="${this.id}"]`)
        not.classList.add("notification_pop")
        setTimeout(() => {
            not.classList.add("notification_remove")
            setTimeout(() => {
                not.remove()
            }, 500);
        }, 500);
    }

    Notification.prototype.popAfter = function (time) {
        setTimeout(() => {
            this.pop()
        }, time);
    }


    // this function runs on every page
    function initial() {
        // add notifications
        notificationsElm = document.createElement("div")
        notificationsElm.classList.add("notifications")
        document.body.appendChild(notificationsElm)


        // Yo, let's load up this sick theme.
        if (localStorage.getItem("theme") === "dark") switchTheme("dark")

        // add some listeners
        addListeners()

        // Let's slap on a 'no internet' overlay to the page, just in case the Wi-Fi dips out.
        // One thin', if you add the template directly, the event listeners straight up stop working.
        // So, brace yourself for some janky code, my dude.

        const noInternetTemplate = `
            <div class="container">
                <h1 class="text-heading">Can't reach the API at the moment</h1>
                <p class="text-body">We apologize, but it seems that we are unable to connect to the API at the moment. Please
                    check your internet connection and try again later. If the problem persists, please contact support for further
                    assistance.</p>
            
                <button class="btn btn_primary">Retry <i class="fa-solid fa-rotate"></i></button>
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
    }

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

    }

    function redirectToLogin(actor) {
        if (!actor) actor = "user"
        const pagesIndex = window.location.pathname.indexOf("/pages")
        window.location.href = window.location.origin + window.location.pathname.slice(0, pagesIndex) + "/pages/login.html?actor="+actor
    }

    // check if token is valid
    async function isLogedIn(actor, options) {
        if (actor == "admin") tok = "adminToken"
        else tok = "token"

        if (localStorage.getItem(tok)) {
            document.body.classList.add("loged-in")
            fetch("user", {actor}).then(data => {
                if (!data.success) {
                    localStorage.removeItem(tok)
                    localStorage.removeItem(`firstLogin${actor}`)
                    document.body.classList.remove("loged-in")
                    if (options && options.redirect) redirectToLogin(actor)

                } else if (data.success) {
                    if (!data.data.isEmailConfirmed) {
                        document.querySelector(".dropdown-link_email").classList.remove("dropdown-link_hide")
                    }
                    if (!localStorage.getItem(`firstLogin${actor}`)) {
                        localStorage.setItem(`firstLogin${actor}`, "no")
                        const userLogedNot = new Notification("You loged in", "true")
                        userLogedNot.push()
                        userLogedNot.popAfter(2000)
                    }
                }
            })
        } else {
            localStorage.removeItem("firstLogin")
            if (options && options.redirect) redirectToLogin(actor)
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

        return theme

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


    // add navbar 
    function addNavbar(rootPath) {
        let page = "home"
        if (window.location.pathname.includes("tickets.html")) page = "tickets"

        const navbarTemplate = `
        <div class="container primary-header_container">
          <a href="${rootPath}/index.html" class="logo">
            <svg version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect class="logo-bg" x="56.305" y="102.27" width="100" height="100" rx="15.671" ry="15.671"
                transform="translate(-56.305 -102.27)" fill="currentColor" />
              <path class="logo-icon"
                d="m82.075 118.04 4.4674 26.487 15.279 7.567-15.233 7.6838-4.5336 26.468 8.6243-3.929 2.76-18.035 9.1405-4.5698 0.077 16.548 3.6871-2.0634 3.6866 2.0634 0.0765-16.548 9.1405 4.5698 2.7606 18.035 8.6238 3.929-4.5331-26.468-15.233-7.6838 15.279-7.567 4.4674-26.487-8.5468 3.9042-2.8339 18.03-9.1317 4.5372 5.2e-4 -16.592-3.7569 2.1296-3.7564-2.1296 5.2e-4 16.592-9.1317-4.5372-2.8339-18.03z"
                transform="translate(-56.305 -102.27)" fill="currentColor" />
            </svg>
            ⵊⵙⴽ
          </a>
          <nav class="primary-nav">
            <ul>
              <li><a class="nav-link ${page == "home" ? "nav-link_selected" : ""}" href="${rootPath}/index.html">Home</a></li>
              <li><i class="fa-solid fa-star"></i></li>
              <li><a class="nav-link ${page == "tickets" ? "nav-link_selected" : ""}" href="${rootPath}/pages/tickets.html">Tickets</a></li>
              <li><i class="fa-solid fa-star"></i></li>
              <li><a class="nav-link" href="#">About</a></li>
            </ul>
          </nav>
          <div class="primary-header-right">
            <div class="switch-theme-container">
              <input class="switch-theme-btn" type="checkbox" name="switch theme">
              <div class="switch-theme-icons">
                <i class="moon-icon fa-solid fa-moon"></i>
                <i class="sun-icon fa-solid fa-sun"></i>
              </div>
            </div>
            <div class="seperator"></div>
            <a href="${rootPath}/pages/login.html?page=login" class="primary-header-login-btn btn btn_primary btn_small">Login
              <i class="fa-solid fa-user"></i>
            </a>
    
            <div class="primary-header-user">
              <a href="#" class="primary-header-account">
                <i class="fa-solid fa-user"></i>
              </a>
    
              <div class="dropdown">
                <a href="#" class="dropdown-link"><i class="fa-solid fa-user-circle"></i> <span>My account</span></a>
                <a href="${rootPath}/pages/tickets.html" class="dropdown-link"><i class="fa-solid fa-ticket"></i> <span>My tickets</span></a>
                <a href="${rootPath}/pages/login.html?page=confirm_email" class="dropdown-link dropdown-link_email dropdown-link_hide"><i class="fa-solid fa-envelope"></i> <span>Confirm email</span></a>
                <a href="#" class="dropdown-link dropdown-link_highlight dropdwon-link_logout"><i class="fa-solid fa-arrow-circle-left"></i> <span>Log out</span></a>
              </div>
            </div>
    
          </div>
        </div>
        `

        const headerElm = document.createElement("header")
        headerElm.classList.add("primary-header")
        headerElm.innerHTML = navbarTemplate



        addSwitchThemeBtn(headerElm)


        // ############################# show user dropdown ################################
        const primaryHeaderAccountElm = headerElm.querySelector(".primary-header-account ")
        if (primaryHeaderAccountElm) primaryHeaderAccountElm.addEventListener("click", (e) => {
            e.preventDefault()
            primaryHeaderAccountElm.parentElement.classList.toggle("primary-header-user_showdrop")
            primaryHeaderAccountElm.nextElementSibling.classList.toggle("dropdown_show")
        })


        // ############################# disconnect ################################
        const disconnectBtnElm = headerElm.querySelector(".dropdwon-link_logout")
        if (disconnectBtnElm) disconnectBtnElm.addEventListener("click", (e) => {
            e.preventDefault()
            localStorage.removeItem("token")
            window.location.reload()
        })


        // ############################## fixed header ##############################
        document.body.prepend(headerElm)
        const primaryHeaderHeight = headerElm.offsetHeight

        document.addEventListener("scroll", e => {
            if (window.pageYOffset > primaryHeaderHeight && window.pageYOffset < 800) {
                headerElm.classList.add("primary-header_hide")
            } else {
                headerElm.classList.remove("primary-header_hide")
            }

            if (window.pageYOffset > 450) {
                document.body.classList.add("fixed-header")
                document.body.style.paddingTop = primaryHeaderHeight + "px"
            } else {
                document.body.classList.remove("fixed-header")
                document.body.style.paddingTop = "0px"
            }
        })


        return headerElm
    }



    // ############################# switch theme button ##############################

    function addSwitchThemeBtn(elem) {
        const switchThemeBtnElm = elem.querySelector(".switch-theme-btn")
        if (switchThemeBtnElm) switchThemeBtnElm.addEventListener("change", () => {
            const theme = switchTheme()
            const themeNot = new Notification(`${theme} theme`, "true")
            themeNot.push()
            themeNot.popAfter(2000)
        })
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


    // Let's whip up a custom fetch function.
    async function fetch(url, opt, rec) {

        // if no options provided use empty one
        if (!opt) opt = {}
        if (!opt.headers) opt.headers = {}



        // construct the default options
        const options = { headers: {} }

        // set the method
        if (opt.method) options.method = opt.method
        else options.method = "GET"

        // stringify the body by default
        if (opt.body && opt.bodyType != "file") options.body = JSON.stringify(opt.body)
        else if (opt.body) options.body = opt.body

        // set the content type to json by default
        if (opt.headers["Content-Type"]) options.headers["Content-Type"] = opt.headers["Content-Type"]
        else if (opt.bodyType != "file") options.headers["Content-Type"] = "application/json"

        // set the authorization token if any 
        let token
        if (opt.actor && opt.actor == "admin") token = localStorage.getItem("adminToken")
        else token = localStorage.getItem("token")

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

            if (rec) setTimeout(() => {retryBtnElm.removeAttribute("disabled")}, 2000);

            await retryBtnElm.waitForClick()

            retryBtnElm.setAttribute("disabled", "true")

            return await fetch(url, opt, true)
        }


        // get the actual data
        if (opt.type === "blob") return await res.blob()
        else return await res.json()
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



    function formateDate(date) {
        const options = {
            month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        }

        return date.toLocaleTimeString("en-us", options)
    }


    // check meme type
    function getMimeType(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = function () {
                const arr = (new Uint8Array(reader.result)).subarray(0, 4);
                let header = "";
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }

                let mimeType;
                switch (header) {
                    case "89504e47":
                        mimeType = "image/png";
                        break;
                    case "47494638":
                        mimeType = "image/gif";
                        break;
                    case "3c737667":
                        mimeType = "image/svg+xml";
                        break;
                    case "ffd8ffe0":
                    case "ffd8ffe1":
                    case "ffd8ffe2":
                    case "ffd8ffe3":
                    case "ffd8ffe8":
                        mimeType = "image/jpeg";
                        break;
                    default:
                        mimeType = "Unknown";
                        break;
                }

                resolve(mimeType);
            };

            reader.onerror = function (error) {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    }




    return {
        HOSTNAME,
        VALIDATORS,
        initial,
        addNavbar,
        formateDate,
        fetch,
        inputValidator,
        startCounter,
        addSwitchThemeBtn,
        isLogedIn,
        getMimeType,
        Notification
    }
})()
