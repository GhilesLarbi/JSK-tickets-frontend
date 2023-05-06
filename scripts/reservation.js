const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

let gameIdParam = params.gameId
let currentBleacher

const ticket = {
    bleacherType: "VIP",
    quantity: 1,
    successUrl : window.location.href.replace("reservation.html", "tickets.html") ,
    cancelUrl: window.location.href,
}


const bleacherElems = document.querySelectorAll(".btype")


function selectBleacherVisualy(bleacherType) {
    bleacherElems.forEach(bleacherElm => {
        bleacherElm.classList.remove("btype_selected")
        if (bleacherElm.getAttribute("data-type") === bleacherType) {
            bleacherElm.classList.add("btype_selected")
        }
    })
}


function selectBleacherGlobally() {
    document.querySelector(".ticket-bleacher").textContent = currentBleacher.type
    document.querySelector(".ticket-price").textContent = currentBleacher.price

}


async function init() {
    
    
    const buyTicketBtnElm = document.querySelector(".buy-ticket-btn")

    const gameRes = await APP.fetch(`game/${gameIdParam}`, {
        query: {
            include: "team,league"
        }
    })

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
            document.querySelector(".game-center p:first-child").textContent = game.league.name
            document.querySelector(".game-center p:last-child").textContent = game.description
            document.querySelector(".game-content .team:first-child img").src = `${APP.HOSTNAME}${game.team1.logo}`
            document.querySelector(".game-content .team:first-child p").textContent = game.team1.name
            document.querySelector(".game-content .team:last-child img").src = `${APP.HOSTNAME}${game.team2.logo}`
            document.querySelector(".game-content .team:last-child p").textContent = game.team2.name
            
            buyTicketBtnElm.removeAttribute("disabled")
        }
    }

    document.querySelector(".game-wrapper").classList.remove("game-wrapper_empty")
    

    const ticketCardElm = document.querySelector(".ticket-card")
    const stadiumWrapperElm = document.querySelector(".stadium-wrapper")

    bleacherElems.forEach(async (bleacherElm) => {
        bleacherElm.addEventListener("click", async () => {
            
            stadiumWrapperElm.classList.add("stadium-wrapper_disabled")
            ticketCardElm.classList.add("ticket-card_loading-state")
            buyTicketBtnElm.setAttribute("disabled", "true")
            



            selectBleacherVisualy(bleacherElm.getAttribute("data-type"))
            const bleacher = await APP.fetch("bleacher", {
                query: {
                    type: bleacherElm.getAttribute("data-type")
                }
            })
            ticket.bleacherType = bleacher.data[0].type
            currentBleacher = bleacher.data[0]
            selectBleacherGlobally()
            ticketCardElm.classList.remove("ticket-card_loading-state")
            stadiumWrapperElm.classList.remove("stadium-wrapper_disabled")
            buyTicketBtnElm.removeAttribute("disabled")
        })
    })


    buyTicketBtnElm.addEventListener("click", async (e) => {
        e.preventDefault()
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

}

APP.init(init)