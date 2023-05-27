APP.addNavbar("..")
APP.initial()
APP.isLogedIn()


const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

let gameIdParam = params.gameId

const ticket = {
    bleacher : {
        type: "VIP",
        price : 2000,
    },
    gameId: null,
    quantity: 1,
    successUrl: window.location.href.replace("reservation.html", "tickets.html"),
    cancelUrl: window.location.href,
}


const bleacherElems = document.querySelectorAll(".btype")

function selectBleacher(bleacher) {
    ticket.bleacher = bleacher
    bleacherElems.forEach(bleacherElm => {
        bleacherElm.classList.remove("btype_selected")
        if (bleacherElm.getAttribute("data-type") === bleacher.type.toLowerCase()) {
            bleacherElm.classList.add("btype_selected")
        }
    })
    document.querySelector(".ticket-bleacher").textContent = ticket.bleacher.type
    document.querySelector(".quantity-element").textContent = "0" + ticket.quantity
    document.querySelector(".ticket-price").textContent = ticket.bleacher.price * ticket.quantity
}


async function init() {
    const buyTicketBtnElm = document.querySelector(".buy-ticket-btn")

    APP.fetch(`game/${gameIdParam}`, {
        query: {
            include: "team,league"
        }
    }).then(gameRes => {
        if (!gameRes.success) {
            document.querySelector(".game-wrapper").classList.add("game-wrapper_err")
        } else {
            const game = gameRes.data
            if (new Date(game.date).getTime() < new Date()) {
                document.querySelector(".game-wrapper").classList.add("game-wrapper_err")
            }
            else {
                ticket.gameId = game.id
                document.querySelector(".game-date").textContent = APP.formateDate(new Date(game.date))
                document.querySelector(".game-center p:first-child").textContent = game.league? game.league.name : ""
                document.querySelector(".game-center p:last-child").textContent = game.description
                document.querySelector(".game-content .team:first-child img").src = `${APP.HOSTNAME}${game.team1.logo}`
                document.querySelector(".game-content .team:first-child p").textContent = game.team1.name
                document.querySelector(".game-content .team:last-child img").src = `${APP.HOSTNAME}${game.team2.logo}`
                document.querySelector(".game-content .team:last-child p").textContent = game.team2.name

                buyTicketBtnElm.removeAttribute("disabled")
            }
        }
        document.querySelector(".game-wrapper").classList.remove("game-wrapper_empty")
    })


    const ticketCardElm = document.querySelector(".ticket-card")
    const stadiumWrapperElm = document.querySelector(".stadium-wrapper")

    bleacherElems.forEach(async (bleacherElm) => {
        bleacherElm.addEventListener("click", async () => {

            stadiumWrapperElm.classList.add("stadium-wrapper_disabled")
            ticketCardElm.classList.add("ticket-card_loading-state")
            buyTicketBtnElm.setAttribute("disabled", "true")

            const bleacher = await APP.fetch("bleacher", {
                query: {
                    type: bleacherElm.getAttribute("data-type")
                }
            })

            selectBleacher(bleacher.data[0])

            ticketCardElm.classList.remove("ticket-card_loading-state")
            stadiumWrapperElm.classList.remove("stadium-wrapper_disabled")
            buyTicketBtnElm.removeAttribute("disabled")
        })
    })
    

    document.querySelectorAll(".control-ticket-number-btn").forEach((button, i) => {
        button.addEventListener("click", ()=> {
            let newQuantity = ticket.quantity
            if (i === 0) newQuantity -= 1
            else newQuantity += 1
            if (newQuantity < 1 || newQuantity > 5) return
            ticket.quantity = newQuantity
            selectBleacher(ticket.bleacher)
        })
    })


    buyTicketBtnElm.addEventListener("click", async (e) => {
        e.preventDefault()
        ticket.bleacherType = ticket.bleacher.type

        if (ticket.gameId == null) {
            const errNot = new APP.Notification("Please select another match ", "false")
            errNot.push()
            errNot.popAfter(2000)
            return
        } else if (ticket.bleacherType == null) {
            const errNot = new APP.Notification("Please select a bleacher", "false")
            errNot.push()
            errNot.popAfter(2000)
            return
        }

        buyTicketBtnElm.setAttribute("disabled", "true")

        const waitNot = new APP.Notification("Please wait... ", "loading")
        waitNot.push()


        const res = await APP.fetch("ticket", {
            method: "POST",
            body: ticket
        })


        buyTicketBtnElm.removeAttribute("disabled")
        waitNot.pop()


        if (res.success === false) {
            const notOthorizedNot = new APP.Notification(res.message, "false")
            notOthorizedNot.push()
            notOthorizedNot.popAfter(3000)
            return
        }

        window.location.href = res.data.payUrl

    })


    const panoramaWrapperElm = document.querySelector(".panorama-360-wrapper")
    document.querySelector(".show-3d-btn").addEventListener("click", () => {
        panoramaWrapperElm.classList.add("panorama-360-wrapper_show")
        pannellum.viewer('panorama-360-view', {
            "type": "equirectangular",
            "panorama": `../images/test/${ticket.bleacher.type}.jpg`,
            "autoLoad": true,
            "autoRotate": -5,
            "compass": true,
            "northOffset": 247.5
        })
    })

    document.querySelector(".panorama-360-exit-btn").addEventListener("click", () => {
        panoramaWrapperElm.classList.remove("panorama-360-wrapper_show")
        setTimeout(() => {
            document.querySelector("#panorama-360-view").innerHTML = ""
        }, 400);
    })


}

init()
