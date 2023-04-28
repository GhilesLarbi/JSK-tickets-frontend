const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

let selectedGameId = params.gameId


let selectedBleacher
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
    document.querySelector(".ticket-bleacher").textContent = selectedBleacher.type
    document.querySelector(".ticket-price").textContent = selectedBleacher.price

}


async function init() {

    const gameRes = await APP.fetch(`game/${selectedGameId}`, {
        query: {
            include: "team,league"
        }
    })

    if (!gameRes.success) {
        document.querySelector(".game-wrapper").classList.add("game-wrapper_err")
        selectedGameId = null
    } else {
        const game = gameRes.data
        if (new Date(game.date).getTime() < new Date()) {
            document.querySelector(".game-wrapper").classList.add("game-wrapper_err")
            selectedGameId = null
        }
        else {
            document.querySelector(".game-date").textContent = new Date(game.date).toDateString()
            document.querySelector(".game-center p:first-child").textContent = game.league.name
            document.querySelector(".game-center p:last-child").textContent = game.description
            document.querySelector(".game-team:first-child img").src = `${APP.HOSTNAME}${game.team1.logo}`
            document.querySelector(".game-team:first-child p").textContent = game.team1.name
            document.querySelector(".game-team:last-child img").src = `${APP.HOSTNAME}${game.team2.logo}`
            document.querySelector(".game-team:last-child p").textContent = game.team2.name
        }
    }
    
    document.querySelector(".game-wrapper").classList.remove("game-wrapper_empty")


    const res = await APP.fetch("bleacher")
    const data = res.data


    bleacherElems.forEach(async (bleacherElm) => {
        bleacherElm.addEventListener("click", async () => {
            selectBleacherVisualy(bleacherElm.getAttribute("data-type"))
            const bleacher = await APP.fetch("bleacher", {
                query: {
                    type: bleacherElm.getAttribute("data-type")
                }
            })
            selectedBleacher = bleacher.data[0]
            selectBleacherGlobally()
        })
    })


    const buyTicketBtnElm = document.querySelector(".buy-ticket-btn")
    buyTicketBtnElm.addEventListener("click", async (e) => {
        e.preventDefault()
        
        if (!selectedGameId) return
        if (!selectedBleacher) return

        console.log({gameId : selectedGameId, bleacherType : selectedBleacher.type})
        
        const res = await APP.fetch("ticket", {
            method : "POST",
            body : {
                gameId : selectedGameId,
                bleacherType : selectedBleacher.type,
                quantity : 1,
                successUrl : "http://localhost:5500/index.html",
                cancelUrl : "http://localhost:5500/pages/reservation.html?gameId=3"
            }
        })

        console.log(res)
        
        if (res.success === true) window.location.href = res.data.payUrl
    })

}

APP.init(init)