APP.addNavbar(".")
APP.initial()
APP.isLogedIn()

async function init() {
  const waitNot = new APP.Notification("fetching data", "loading")
  waitNot.push()

  let data = await APP.fetch(`game`, {
    query: {
      include: "team,league",
      filter: "new"
    }
  })

  waitNot.pop()
  data = data.data

  const nextGame = data[0]

  if (nextGame) {
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

    document.querySelector(".next-game-content a.btn").setAttribute("href", `pages/reservation.html?gameId=${nextGame.id}`)

    document.querySelector(".next-game").classList.remove("next-game_empty")
  } else {
    document.querySelector(".next-game").classList.remove("next-game_empty")
  }


  // Let's get these tickets on lock - time to set up that sweet,
  const ticketsElm = document.querySelector(".tickets")
  ticketsElm.classList.remove("tickets_empty")

  data.forEach((game, i) => {
    const ticketTemplate = `
            <svg class="ticket-bg" version="1.1" viewBox="861.5 2248 266 315" xmlns="http://www.w3.org/2000/svg">
              <path rx="0" ry="0"
                d="m861.5 2326c0.166 0 0.333 0.01 0.5 0.01 8.279 0 15-6.721 15-15s-6.721-15-15-15c-0.167 0-0.334 0-0.5 0.01v-43.012c0-2.76 2.24-5 5-5h256c2.76 0 5 2.24 5 5v43c-8.279 0-15 6.721-15 15s6.721 15 15 15v232c0 2.76-2.24 5-5 5h-256c-2.76 0-5-2.24-5-5zm25-18.992c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm54 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm-18 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm-18 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm108 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm-36 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm18 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm-36 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm72 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm18 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm54 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm-36 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4zm18 0c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4z"
                fill="currentColor" />
            </svg>

            <div class="ticket-content">

              <p class="ticket-date">${APP.formateDate(new Date(game.date))}</p>
              <div class="ticket-center">
                <h3 class="ticket-league">${(game.league) ? game.league.name : ""}</h3>
                <p class="ticket-desc">${game.description}</p>
                <div class="ticket-teams">
                  <div class="team">
                    <div class="team-img">
                      <img src="${APP.HOSTNAME + game.team1.logo}">
                    </div>
                    <p>${game.team1.name}</p>
                  </div>
                  <i class="fa-solid fa-star"></i>
                  <div class="team">
                    <div class="team-img">
                      <img src="${APP.HOSTNAME + game.team2.logo}">
                    </div>
                    <p>${game.team2.name}</p>
                  </div>
                </div>
              </div>
              <a href="pages/reservation.html?gameId=${game.id}" class="btn btn_primary">Buy ticket
                <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
        `

    const ticket = document.createElement("div")
    ticket.classList.add("ticket")
    ticket.innerHTML = ticketTemplate
    ticketsElm.appendChild(ticket)


    const ticketsWrapperElm = document.querySelector('.tickets-wrapper')
    if (ticketsWrapperElm.scrollWidth > ticketsWrapperElm.clientWidth) {
      ticketsElm.classList.add("tickets_scrollable")
    }
  })

}

init()