async function init() {
    
    const waitNot = new APP.Notification("fetching data", "loading")
    waitNot.push()

    let data = await APP.fetch(`game`, {
        query : {
            include : "team,league",
            filter : "new"
        }
    }) 

    waitNot.pop()



    data = data.data
    

    const nextGame = data[0]

    // Fill me in, what's the deal with the next game data?
    const nextGameImgElemes = document.querySelectorAll(".next-game-teams .team img")
    nextGameImgElemes[0].src = APP.HOSTNAME + nextGame.team1.logo
    nextGameImgElemes[1].src = APP.HOSTNAME + nextGame.team2.logo
    const nextGameNameElemes = document.querySelectorAll(".next-game-teams .team p")
    nextGameNameElemes[0].textContent = nextGame.team1.name
    nextGameNameElemes[1].textContent = nextGame.team2.name
    
    // let's get down to business and set that next game date
    const counterElms = document.querySelectorAll(".counter-element") 
    APP.startCounter(counterElms, (new Date(nextGame.date)).getTime())
   
    document.querySelector(".next-game-content a.btn").setAttribute("href", `/pages/reservation.html?gameId=${nextGame.id}`)

    document.querySelector(".next-game").classList.remove("next-game_empty")



    // Let's get these tickets on lock - time to set up that sweet,
    const ticketElems = document.querySelectorAll(".ticket")
    
    ticketElems.forEach((elem, i) => {
        if (!data[i]) return
        elem.querySelector(".ticket-date").textContent = APP.formateDate(new Date(data[i].date))

        const imgElems = elem.querySelectorAll(".ticket-teams .team img")
        imgElems[0].src = APP.HOSTNAME + data[i].team1.logo
        imgElems[1].src = APP.HOSTNAME + data[i].team2.logo
        
        const teamNameElems = elem.querySelectorAll(".ticket-teams .team p")
        teamNameElems[0].textContent = data[i].team1.name
        teamNameElems[1].textContent = data[i].team2.name

        elem.querySelector("a.btn").setAttribute("href", `/pages/reservation.html?gameId=${data[i].id}`)
        

        if (elem.classList.contains("ticket_main")) {
            elem.querySelector(".ticket-league").textContent = data[i].league.name
            elem.querySelector(".ticket-desc").textContent = data[i].description
        }
        
        elem.classList.remove("ticket_empty")
    })

}

APP.init(init)