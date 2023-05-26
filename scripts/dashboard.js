APP.initial()
APP.addSwitchThemeBtn(document.body)
APP.isLogedIn("admin")


// tab control
const tabControls = document.querySelectorAll(".tab-control");
const tabs = document.querySelectorAll(".tab");
const tabHeaders = document.querySelectorAll(".tab--header");


let currentTab = localStorage.getItem("dashboard-tab") || 0;
function selectTab(i) {
    if (i < 0 || i > tabs.length) return;

    tabs[currentTab].classList.remove("tab__selected");
    tabControls[currentTab].classList.remove("tab-control__selected");
    tabHeaders[currentTab].classList.remove("tab--header__selected");

    tabs[i].classList.add("tab__selected");
    tabControls[i].classList.add("tab-control__selected");
    tabHeaders[i].classList.add("tab--header__selected");

    currentTab = i;
    localStorage.setItem("dashboard-tab", currentTab)
}

selectTab(currentTab)

tabControls.forEach((control, i) => {
    control.addEventListener("click", () => {
        selectTab(i);
    })
})


// sidebar collapse
const sidebarCollapseBtn = document.querySelector(".sidebar--collapse-btn");
const sidebar = document.querySelector(".sidebar");
const wrapper = document.querySelector(".wrapper");

sidebarCollapseBtn.addEventListener("click", () => {
    wrapper.classList.toggle("sidebar__collapsed");
});



document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("adminToken")
    window.location.href = window.location.href.replace("/pages/dashboard.html", "")
})


// ###############################################################################
// statistics tab
// select game
const statisticsSelectElm = document.querySelector(".statistics-option")

async function statisticsTabInit() {
    const gamesResult = await APP.fetch("game", { query: { filter: "new", include: "team" } })
    const games = gamesResult.data
    compareChart(games[0].id)


    games.forEach(game => {
        statisticsSelectElm.innerHTML += `<option value="${game.id}">${game.team1.name}-${game.team2.name}</option>`
    })


    statisticsSelectElm.addEventListener("change", (e) => {
        compareChart(Number(statisticsSelectElm.value))
    })
}


async function compareChart(gameId) {
    document.querySelector(".card__compare").classList.add("card__loading-state")
    const bleachersResult = await APP.fetch("bleacher")
    const bleachers = bleachersResult.data

    const compareChartElm = document.querySelector(".compare-chart .bars")
    compareChartElm.innerHTML = ""

    bleachers.forEach(bleacher => {
        gameStatByBleacher = bleacher.tickets.filter((ticket) => ticket.gameId == gameId)[0]
        if (!gameStatByBleacher) gameStatByBleacher = { freePlaces: bleacher.quantity }

        const barTemplate = `
            <div class="bar--wrapper">
                <div style="height:${bleacher.quantity * 100 / 15000}%" data-value="${bleacher.quantity}" class="bar bar__s1"></div>
                <div style="height:${gameStatByBleacher.freePlaces * 100 / 15000}%" data-value="${gameStatByBleacher.freePlaces}" class="bar bar__s2"></div>
                <p class="bar--text">${bleacher.type}</p>
            </div>`

        compareChartElm.innerHTML += barTemplate
    })

    document.querySelector(".card__compare").classList.remove("card__loading-state")
}






// ###############################################################################
// statistics tab
// select game
async function teamsTabInit() {
    const wiatNot = new APP.Notification("Fetching teams data", "loading")
    wiatNot.push()

    const teamsResult = await APP.fetch("team", { query: { include: "game" } })
    const teamsData = teamsResult.data

    const tableBodyElm = document.querySelector(".teams-table--body")

    teamsData.forEach(team => {
        const teamRowTemlate = `
            <td><span class="team-id">${team.id}</span></td>
            <td>
                <div class="team-img"><img src="${APP.HOSTNAME + team.logo}"></div>
                <label for="inputTag" class="upload-btn">
                    <i class="fa-solid fa-upload"></i>
                </label>
                <input id="inputTag" class="team-logo--input" type="file" accept="image/*" />
            </td>
            <td><input class="table-input table-input__name" type="text" value="${team.name}"></td>
            <td><input class="table-input table-input__captain" type="text" value="${team.captainName || ""}"></td>
            <td class="teams-table--action-wrapper">
                <button class="btn btn_primary btn_small btn__save"><i class="fa-solid fa-save"></i>Update</button>
                <button class="team-action-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                <div class="dropdown ">
                    <button class="dropdown-link dropdown-link_highlight dropdown-link_edit"><i class="fa-solid fa-pen-to-square"></i> <span>Edit</span></button>
                    <button class="dropdown-link"><i class="fa-solid fa-trash"></i> <span>Delete</span></button>
                </div>
            </td>
        `
        const teamElem = document.createElement("tr")
        teamElem.classList.add("team-row")
        // teamElem.classList.add("team-row__edit")
        teamElem.innerHTML = teamRowTemlate

        let oldImg = APP.HOSTNAME + team.logo

        // ############################# show user dropdown ################################
        const actionBtnElm = teamElem.querySelector(".team-action-btn")
        actionBtnElm.addEventListener("click", (e) => {
            e.preventDefault()
            toggleDropdown()
        })


        function toggleDropdown(opt) {
            if (opt === "show") {
                actionBtnElm.nextElementSibling.classList.add("dropdown_show")
                actionBtnElm.classList.add("options-btn_showdrop")
            } else if (opt === "hide") {
                actionBtnElm.nextElementSibling.classList.remove("dropdown_show")
                actionBtnElm.classList.remove("options-btn_showdrop")
            } else {
                actionBtnElm.nextElementSibling.classList.toggle("dropdown_show")
                actionBtnElm.classList.toggle("options-btn_showdrop")
            }
        }




        teamElem.querySelector(".dropdown-link_edit").addEventListener("click", () => {
            teamElem.classList.add("team-row__edit")
            toggleDropdown("hide")
        })


        // upload team logo
        const logoInputElm = teamElem.querySelector(".team-logo--input")
        const teamLogoElm = teamElem.querySelector(".team-img img")
        logoInputElm.addEventListener("change", async () => {
            if (await APP.getMimeType(logoInputElm.files[0]) == "Unknown") {
                const errNot = new APP.Notification("Doesn't look like an image", "false")
                errNot.push()
                errNot.popAfter(2000)
            } else {
                teamLogoElm.src = URL.createObjectURL(logoInputElm.files[0])
            }
        })



        // update team data
        const updateBtnElm = teamElem.querySelector(".btn__save")
        updateBtnElm.addEventListener("click", async () => {
            const idElm = teamElem.querySelector(".team-id")
            const logo = logoInputElm.files[0]
            const nameElm = teamElem.querySelector(".table-input__name")
            const captainNameElm = teamElem.querySelector(".table-input__captain")

            const newTeam = {}

            if (nameElm.value && nameElm.value.length > 0) newTeam.name = nameElm.value.toUpperCase()
            if (captainNameElm.value && captainNameElm.value.length > 0) newTeam.captainName = captainNameElm.value
            else newTeam.captainName = null

            updateBtnElm.setAttribute("disabled", "true")
            const waitNot = new APP.Notification("Please wait...", "loading")
            waitNot.push()

            const isSended = [false, false]

            // send data
            APP.fetch(`team/${idElm.innerText}`, { method: "PUT", body: newTeam, actor: "admin" }).then((result) => {
                const data = result.data
                nameElm.value = data.name
                captainNameElm.value = data.captainName
                updateBtnElm.removeAttribute("disabled")
                isSended[0] = true

                if (isSended[0] == true && isSended[1] == true) {
                    waitNot.pop()
                }
            })

            // update logo if any
            if (logo) {
                const formData = new FormData()
                formData.append('logo', logo)

                APP.fetch(`team/${idElm.innerText}/upload/logo`, {
                    method: "POST",
                    body: formData,
                    actor: "admin",
                    bodyType: "file"
                }).then((result) => {
                    console.log(result)
                    if (!result.success) teamLogoElm.src = oldImg
                    else oldImg = teamLogoElm.src

                    isSended[1] = true
                    if (isSended[0] == true && isSended[1] == true) {
                        waitNot.pop()
                    }
                })
            } else {
                isSended[1] = true
                if (isSended[0] == true && isSended[1] == true) {
                    waitNot.pop()
                }
            }


            teamElem.classList.remove("team-row__edit")
        })



        tableBodyElm.appendChild(teamElem)
    })

    wiatNot.pop()
}






async function init() {
    statisticsTabInit()
    teamsTabInit()
}

init()