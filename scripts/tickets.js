APP.addNavbar("..")
APP.initial()
APP.isLogedIn()

const ticketsElm = document.querySelector(".tickets")


async function addTicket(ticketData) {
    const ticketTemplate = `
            <div class="ticket-content">
                <p class="ticket-date"></p>
                <!-- <button class="download-btn"><i class="fa-solid fa-download"></i></button> -->
                <div class="ticket-options">
                    <button class="ticket-options-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                    <div class="dropdown">        
                        <button class="dropdown-link dropdown-link_highlight download-btn"><i class="fa-solid fa-download"></i> <span>Download PDF</span></button>
                        <button class="dropdown-link remove-btn"><i class="fa-solid fa-trash"></i> <span>Delete Ticket</span></button>
                    </div>
                </div>

                <div class="ticket-info">
                    <div class="ticket-info-element">
                        <p>Bleacher</p>
                        <h2><i class="fa-solid fa-registered"></i><span>${ticketData.bleacher.type}</span></h2>
                    </div>
                    <div class="ticket-info-element">
                        <p>Price</p>
                        <h2><i class="fa-solid fa-wallet"></i><span>${ticketData.bleacher.price}</span></h2>
                    </div>
                </div>

                <div class="ticket-teams">
                    <div class="team">
                        <div class="team-img">
                            <img>
                        </div>
                    </div>

                    <i class="fa-solid fa-star"></i>

                    <div class="team">
                        <div class="team-img">
                            <img>
                        </div>
                    </div>
                </div>

                <div class="ticket-qrcode-img">
                    <img>
                </div>

                <p class="ticket-qrcode-string"></p>
            </div>

            <div class="ticket-bg">
                <svg version="1.1" viewBox="-15 -.5 337 515" xmlns="http://www.w3.org/2000/svg">
                    <path id="ticket-bg-board" d="m321.5 70zm0 0c-8.279 0-15 6.721-15 15s6.721 15 15 15v130c-8.279 0-15 6.721-15 15s6.721 15 15 15v244c0 5.519-4.481 10-10 10h-316c-5.519 0-10-4.481-10-10v-244c8.279 0 15-6.721 15-15s-6.721-15-15-15v-130c8.279 0 15-6.721 15-15s-6.721-15-15-15v-60c0-5.519 4.481-10 10-10h316c5.519 0 10 4.481 10 10z" />
                    <path id="ticket-bg-lines" d="m3.5 83.994v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm-288 160v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2zm24 0v2h12v-2z" />
                </svg>
            </div>
`

    const ticketElm = document.createElement("div")
    ticketElm.classList.add("ticket")
    ticketElm.innerHTML = ticketTemplate
    ticketsElm.prepend(ticketElm)


    APP.fetch(`game/${ticketData.gameId}`, {
        query: {
            include: "team,bleacher",
        }
    }).then(data => {
        const gameData = data.data
        ticketElm.querySelector(".ticket-date").textContent = APP.formateDate(new Date(gameData.date))
        const teamImgElms = ticketElm.querySelectorAll(".ticket-teams .team img")
        teamImgElms[0].src = APP.HOSTNAME + gameData.team1.logo
        teamImgElms[1].src = APP.HOSTNAME + gameData.team2.logo

    })


    APP.fetch(`ticket/${ticketData.id}/base64`).then((data) => {
        ticketElm.querySelector(".ticket-qrcode-img img").src = data.data.string
    })

    APP.fetch(`ticket/${ticketData.id}/string`).then((data) => {
        ticketElm.querySelector(".ticket-qrcode-string").textContent = data.data.string
    })


    // ############################# show user dropdown ################################
    const optionBtnElm = ticketElm.querySelector(".ticket-options-btn")
    optionBtnElm.addEventListener("click", (e) => {
        e.preventDefault()
        toggleDropdown()
    })
    

    function toggleDropdown(opt) {
        if (opt === "show") {
            optionBtnElm.nextElementSibling.classList.add("dropdown_show")
            optionBtnElm.classList.add("options-btn_showdrop")
        } else if (opt === "hide"){
            optionBtnElm.nextElementSibling.classList.remove("dropdown_show")
            optionBtnElm.classList.remove("options-btn_showdrop")
        } else {
            optionBtnElm.nextElementSibling.classList.toggle("dropdown_show")
            optionBtnElm.classList.toggle("options-btn_showdrop")
        }
    }




    const downloadBtnElm = ticketElm.querySelector(".download-btn")

    downloadBtnElm.addEventListener("click", async () => {
        toggleDropdown("hide")
        downloadBtnElm.setAttribute("disabled", "true")
        const waitNot = new APP.Notification("Please wait", "loading")
        waitNot.push()

        const fileRes = await APP.fetch(`ticket/${ticketData.id}/pdf`, { type: "blob" })

        const fileUrl = window.URL.createObjectURL(fileRes);

        const linkElm = document.createElement('a');
        linkElm.style.opacity = "0"
        linkElm.style.position = "absolute"
        linkElm.href = fileUrl
        linkElm.download = "ticket.pdf"
        document.body.appendChild(linkElm)
        linkElm.click()
        linkElm.remove()
        downloadBtnElm.removeAttribute("disabled")

        waitNot.pop()
    })
    


    const removeBtnElm = ticketElm.querySelector(".remove-btn")

    removeBtnElm.addEventListener("click", async () => {
        toggleDropdown("hide")
        const waitNot = new APP.Notification("Please wait", "loading")
        waitNot.push()

        const deleteRes = await APP.fetch(`ticket/${ticketData.id}`, {method : "DELETE"})

        waitNot.pop()
        
        window.location.reload()
    })
}


async function init() {
    const waitNot = new APP.Notification("Please wait", "loading")
    waitNot.push()
    const res = await APP.fetch("ticket", {
        query: {
            include: "bleacher",
        }
    })
    waitNot.pop()
    if (!res.success) {
        const loginErrNot = new APP.Notification(res.message, "false")
        loginErrNot.push()
        loginErrNot.popAfter(2000)
        return
    }

    const tickets = res.data

    tickets.forEach((ticket) => {
        addTicket(ticket)
    });
}

init()