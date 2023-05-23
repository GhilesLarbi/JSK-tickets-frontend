APP.initial()
APP.addSwitchThemeBtn(document.body)


// tab control
const tabControls = document.querySelectorAll(".tab-control");
const tabs = document.querySelectorAll(".tab");
const tabHeaders = document.querySelectorAll(".tab--header");


let currentTab = 0;

function selectTab(i) {
    if (i < 0 || i > tabs.length) return;


    tabs[currentTab].classList.remove("tab__selected");
    tabControls[currentTab].classList.remove("tab-control__selected");
    tabHeaders[currentTab].classList.remove("tab--header__selected");
    
    tabs[i].classList.add("tab__selected");
    tabControls[i].classList.add("tab-control__selected");
    tabHeaders[i].classList.add("tab--header__selected");
    
    currentTab = i;
}

tabControls.forEach((control, i)=> {
    control.addEventListener("click", ()=> {
        selectTab(i);
    })
})


// sidebar collapse
const sidebarCollapseBtn = document.querySelector(".sidebar--collapse-btn");
const sidebar = document.querySelector(".sidebar");
const wrapper = document.querySelector(".wrapper");

sidebarCollapseBtn.addEventListener("click", ()=> {
    wrapper.classList.toggle("sidebar__collapsed");
});




// statistics tab
// select game
let statisticsSelectedGame = 1
const statisticsSelectElm = document.querySelector(".statistics-option")


async function init() {
    const gamesResult = await APP.fetch("game", { query: {filter : "new", include : "team"}})
    const games = gamesResult.data 


    games.forEach(game => {
        statisticsSelectElm.innerHTML += `<option value="${game.id}">${game.team1.name}-${game.team2.name}</option>`
    })

    const bleachersResult = await APP.fetch("bleacher")
    const bleachers = bleachersResult.data

    const compareChartElm = document.querySelector(".compare-chart .bars")
    bleachers.forEach(bleacher => {
        gameStatByBleacher = bleacher.tickets.filter((ticket)=> ticket.gameId == statisticsSelectedGame)[0]
        if (!gameStatByBleacher) gameStatByBleacher = {freePlaces : bleacher.quantity}
        
        const barTemplate = `
            <div class="bar--wrapper">
                <div style="height:${bleacher.quantity * 100 / 15000}%" data-value="${bleacher.quantity}" class="bar bar__s1"></div>
                <div style="height:${gameStatByBleacher.freePlaces * 100 / 15000}%" data-value="${gameStatByBleacher.freePlaces}" class="bar bar__s2"></div>
                <p class="bar--text">${bleacher.type}</p>
            </div>`

        compareChartElm.innerHTML += barTemplate
    })
}

init()