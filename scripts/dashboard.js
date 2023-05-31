APP.initial()
APP.addSwitchThemeBtn(document.body)
APP.isLogedIn("admin", {redirect : true})


// tab control
const tabControls = document.querySelectorAll(".tab-control");
const tabs = document.querySelectorAll(".tab");
const tabHeaders = document.querySelectorAll(".tab--header");


const isFirstEnter = [true, true, true, true, true]

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

    if (isFirstEnter[i]) {
        isFirstEnter[i] = false
        if (i == 0) statisticsTabInit()
        else if (i == 1) teamsTabInit()
        else if (i == 2) gamesTabInit()
        else if (i == 3) bleachersTabInit()
    }
}

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



// generic toggle dropdown function
function toggleDropdown(btn, opt) {
    if (opt === "show") {
        btn.nextElementSibling.classList.add("dropdown_show")
        btn.classList.add("options-btn_showdrop")
    } else if (opt === "hide") {
        btn.nextElementSibling.classList.remove("dropdown_show")
        btn.classList.remove("options-btn_showdrop")
    } else {
        btn.nextElementSibling.classList.toggle("dropdown_show")
        btn.classList.toggle("options-btn_showdrop")
    }
}


// generic add team row function
function addTeam(team, isFirstChild) {
    const tableBodyElm = document.querySelector(".teams-table--body")
    const teamRowTemlate = `
        <td><span class="team-id">${team.id}</span></td>
        <td>
            <div class="team-img"><img src="${APP.HOSTNAME + team.logo}"></div>
            <label for="inputTag${team.id}" class="upload-btn">
                <i class="fa-solid fa-upload"></i>
            </label>
            <input id="inputTag${team.id}" class="logo--input team-logo--input" type="file" accept="image/*" />
        </td>
        <td><input class="table-input table-input__name" type="text" value="${team.name}" placeholder="Name"></td>
        <td><input class="table-input table-input__captain" type="text" value="${team.captainName || ""}" placeholder="Captain name"></td>
        <td class="table--action-wrapper teams-table--action-wrapper">
            <button class="btn btn_primary btn_small btn__save"><i class="fa-solid fa-save"></i>Update</button>
            <button class="action-btn team-action-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            <div class="dropdown ">
                <button class="dropdown-link dropdown-link_highlight dropdown-link_edit"><i class="fa-solid fa-pen-to-square"></i> <span>Edit</span></button>
                <button class="dropdown-link dropdown-link_delete"><i class="fa-solid fa-trash"></i> <span>Delete</span></button>
            </div>
        </td>
    `
    const teamRowElem = document.createElement("tr")
    teamRowElem.classList.add("row")
    // teamRowElem.classList.add("row__edit")
    teamRowElem.innerHTML = teamRowTemlate

    let oldImg = APP.HOSTNAME + team.logo

    // ############################# show user dropdown ################################
    const actionBtnElm = teamRowElem.querySelector(".team-action-btn")
    actionBtnElm.addEventListener("click", (e) => {
        e.preventDefault()
        toggleDropdown(actionBtnElm)
    })

    teamRowElem.querySelector(".dropdown-link_edit").addEventListener("click", () => {
        teamRowElem.classList.add("row__edit")
        toggleDropdown(actionBtnElm, "hide")
    })

    teamRowElem.querySelector(".dropdown-link_delete").addEventListener("click", () => {
        actionBtnElm.setAttribute("disabled", "true")
        toggleDropdown(actionBtnElm, "hide")

        const waitNot = new APP.Notification("Please wait...", "loading")
        waitNot.push()

        APP.fetch(`team/${team.id}`, { method: "DELETE", actor: "admin" }).then(result => {
            waitNot.pop()
            if (result.success) {
                tableBodyElm.removeChild(teamRowElem)
            } else {
                const errNot = new APP.Notification(result.message, "false")
                errNot.push()
                errNot.popAfter(3000)
            }
        })
    })


    // upload team logo
    const logoInputElm = teamRowElem.querySelector(".team-logo--input")
    const teamLogoElm = teamRowElem.querySelector(".team-img img")

    logoInputElm.onchange = async () => {
        if (await APP.getMimeType(logoInputElm.files[0]) == "Unknown") {
            const errNot = new APP.Notification("Doesn't look like an image", "false")
            errNot.push()
            errNot.popAfter(2000)
        } else {
            teamLogoElm.src = URL.createObjectURL(logoInputElm.files[0])
            console.log(teamLogoElm)
        }
    }


    // update team data
    const updateBtnElm = teamRowElem.querySelector(".btn__save")
    updateBtnElm.addEventListener("click", async () => {
        const idElm = teamRowElem.querySelector(".team-id")
        const logo = logoInputElm.files[0]
        const nameElm = teamRowElem.querySelector(".table-input__name")
        const captainNameElm = teamRowElem.querySelector(".table-input__captain")

        const newTeam = {}

        if (nameElm.value && nameElm.value.length > 0) newTeam.name = nameElm.value.toUpperCase()
        if (captainNameElm.value && captainNameElm.value.length > 0) newTeam.captainName = captainNameElm.value
        else newTeam.captainName = null

        updateBtnElm.setAttribute("disabled", "true")
        const waitNot = new APP.Notification("Please wait...", "loading")
        waitNot.push()


        const promises = [APP.fetch(`team/${idElm.innerText}`, { method: "PUT", body: newTeam, actor: "admin" })]
        // update logo if any
        if (logo) {
            const formData = new FormData()
            formData.append('logo', logo)
            
            promises.push(APP.fetch(`team/${idElm.innerText}/upload/logo`, {
                method: "POST",
                body: formData,
                actor: "admin",
                bodyType: "file"
            }))
        }

        // send data
        const results = await Promise.all(promises)

        nameElm.value = results[0].data.name
        captainNameElm.value = results[0].data.captainName
        updateBtnElm.removeAttribute("disabled")


        if (!results[1] || !results[1].success) teamLogoElm.src = oldImg
        else oldImg = teamLogoElm.src

        waitNot.pop()

        isFirstEnter[0] = true
        isFirstEnter[2] = true
        teamRowElem.classList.remove("row__edit")
    })

    if (isFirstChild) tableBodyElm.prepend(teamRowElem)
    else tableBodyElm.appendChild(teamRowElem)
}



// generic add game row function
function addGame(data, isFirstChild) {
    const { game } = data
    const { teams } = data
    const { leagues } = data


    const tableBodyElm = document.querySelector(".games-table--body")
    const gameRowTemlate = `
            <td><span class="game-id">${game.id}</span></td>
            <td>
                <input class="table-input__date" type="date" value="${new Date(game.date).toISOString().substring(0, 10)}">
            </td>

            <td>
                <input class="table-input__time" type="time" value="${new Date(game.date).toISOString().substring(11, 16)}">
            </td>

            <td>
                <div class="game-team">
                    <div class="team-img"><img src="${APP.HOSTNAME + game.team1.logo}"></div>

                    <select class="select-btn select-team">
                        ${teams.map(team => {
        return `<option value="${team.id}" ${(game.team1Id == team.id) ? "selected" : ""}>${team.name}</option>`
    })}
                    </select>
                </div>
            </td>

            <td>
                <div class="game-team">
                    <div class="team-img"><img src="${APP.HOSTNAME + game.team2.logo}"></div>
                    <select class="select-btn select-team">
                        ${teams.map(team => {
        return `<option value="${team.id}" ${(game.team2Id == team.id) ? "selected" : ""}>${team.name}</option>`
    })}
                    </select>
                </div>
            </td>

            <td>
                <select class="select-btn select-league">
                    <option value="" ${(!game.leagueId) ? "selected" : ""}></option>
                    ${leagues.map(league => {
        return `<option value="${league.id}" ${(game.leagueId == league.id) ? "selected" : ""}>${league.name}</option>`
    })}
                </select>
            </td>

            <td>
                <div class="game-score-wrapper">
                    <input class="table-input table-input__score" type="text" value="${(game.score) ? game.score[0] : ""}" placeholder="0">
                    -  
                    <input class="table-input table-input__score" type="text" value="${(game.score) ? game.score[2] : ""}" placeholder="0">    
                </div
            </td>
            <td><input class="table-input table-input__desc" type="text" value="${game.description || ""}" placeholder="description"></td>

            <td class="table--action-wrapper">
                <button class="btn btn_primary btn_small btn__save"><i
                        class="fa-solid fa-save"></i>Update</button>
                <button class="action-btn game-action-btn"><i
                        class="fa-solid fa-ellipsis-vertical"></i></button>
                <div class="dropdown ">
                    <button class="dropdown-link dropdown-link_highlight dropdown-link_edit"><i
                            class="fa-solid fa-pen-to-square"></i> <span>Edit</span></button>
                    <button class="dropdown-link dropdown-link_delete"><i
                            class="fa-solid fa-trash"></i> <span>Delete</span></button>
                </div>
            </td>
    `

    const gameRowElem = document.createElement("tr")
    gameRowElem.classList.add("row")
    if (game.isFinished) gameRowElem.classList.add("game-row__finished")
    // gameRowElem.classList.add("row__edit")
    gameRowElem.innerHTML = gameRowTemlate

    // ############################# show user dropdown ################################
    const actionBtnElm = gameRowElem.querySelector(".game-action-btn")
    actionBtnElm.addEventListener("click", (e) => {
        e.preventDefault()
        toggleDropdown(actionBtnElm)
    })


    // edit game dropdown link
    gameRowElem.querySelector(".dropdown-link_edit").addEventListener("click", () => {
        gameRowElem.classList.add("row__edit")
        toggleDropdown(actionBtnElm, "hide")
    })


    //  delete game dropdown link
    gameRowElem.querySelector(".dropdown-link_delete").addEventListener("click", () => {
        actionBtnElm.setAttribute("disabled", "true")
        toggleDropdown(actionBtnElm, "hide")

        const waitNot = new APP.Notification("Please wait...", "loading")
        waitNot.push()

        APP.fetch(`game/${game.id}`, { method: "DELETE", actor: "admin" }).then(result => {
            waitNot.pop()
            if (result.success) {
                tableBodyElm.removeChild(gameRowElem)
            } else {
                const errNot = new APP.Notification(result.message, "false")
                errNot.push()
                errNot.popAfter(3000)
            }
        })
    })




    // select team
    const selectTeamElems = gameRowElem.querySelectorAll(".select-team")
    selectTeamElems.forEach(selectTeamElm => {
        selectTeamElm.addEventListener("change", () => {
            const team = teams.filter(t => { if (t.id == new Number(selectTeamElm.value)) return t })[0]
            selectTeamElm.previousElementSibling.children[0].src = APP.HOSTNAME + team.logo
        })
    })

    // score inputs
    const scoreInputElems = gameRowElem.querySelectorAll(".table-input__score")

    // date and time input
    const dateInputElem = gameRowElem.querySelector(".table-input__date")
    const timeInputElem = gameRowElem.querySelector(".table-input__time")

    dateInputElem.addEventListener("change", checkIfGameFinished)
    timeInputElem.addEventListener("change", checkIfGameFinished)

    function checkIfGameFinished() {
        if (new Date(dateInputElem.value + " " + timeInputElem.value) > new Date()) gameRowElem.classList.remove("game-row__finished")
        else gameRowElem.classList.add("game-row__finished")
    }



    // update team data
    const updateBtnElm = gameRowElem.querySelector(".btn__save")
    updateBtnElm.addEventListener("click", async () => {
        const leagueIdElem = gameRowElem.querySelector(".select-league")
        const descriptionElem = gameRowElem.querySelector(".table-input__desc")


        let score = (scoreInputElems[0].value.length != 0 && scoreInputElems[1].value.length != 0) ? `${scoreInputElems[0].value}-${scoreInputElems[1].value}` : null
        const updatedGameData = {
            team1Id: selectTeamElems[0].value,
            team2Id: selectTeamElems[1].value,
            leagueId: leagueIdElem.value || null,
            description: descriptionElem.value,
            score: score,
            date: new Date(dateInputElem.value + " " + timeInputElem.value)
        }


        updateBtnElm.setAttribute("disabled", "true")
        const waitNot = new APP.Notification("Please wait...", "loading")
        waitNot.push()

        // send data
        const updatedGameResult = await APP.fetch(`game/${game.id}`, { method: "PUT", body: updatedGameData, actor: "admin" })
        const updatedGame = updatedGameResult.data

        updateBtnElm.removeAttribute("disabled")
        waitNot.pop()

        if (updatedGameResult.success) {
            isFirstEnter[0] = true
            gameRowElem.classList.remove("row__edit")

            selectTeamElems[0].value = updatedGame.team1Id
            selectTeamElems[1].value = updatedGame.team2Id
            leagueIdElem.value = updatedGame.leagueId || ""
            descriptionElem.value = updatedGame.description || ""
            scoreInputElems[0].value = (updatedGame.score)? updatedGame.score[0] : ""
            scoreInputElems[1].value = (updatedGame.score)? updatedGame.score[1] : ""

            dateInputElem.value = new Date(updatedGame.date).toISOString().substring(0, 10)
            timeInputElem.value = new Date(game.date).toISOString().substring(11, 16)

        } else {
            const errNot = new APP.Notification(updatedGameResult.message, "false")
            errNot.push()
            errNot.popAfter(3000)
        }
    })

    if (isFirstChild) tableBodyElm.prepend(gameRowElem)
    else tableBodyElm.appendChild(gameRowElem)
}




// generic add bleacher row function
function addBleacher(data, isFirstChild) {

    const tableBodyElm = document.querySelector(".bleachers-table--body")
    const bleacherRowTemlate = `
        <td>${data.type}</td>
        <td><input class="table-input table-input__quantity" type="text" value="${data.quantity}" placeholder="Quantity"></td>
        <td><input class="table-input table-input__price" type="text" value="${data.price}" placeholder="Price"></td>
        <td class="table--action-wrapper teams-table--action-wrapper">
            <button class="btn btn_primary btn_small btn__save"><i class="fa-solid fa-save"></i>Update</button>
            <button class="action-btn bleacher-action-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            <div class="dropdown ">
                <button class="dropdown-link dropdown-link_highlight dropdown-link_edit"><i class="fa-solid fa-pen-to-square"></i> <span>Edit</span></button>
            </div>
        </td>
    `

    const bleacherRowElem = document.createElement("tr")
    bleacherRowElem.classList.add("row")
    // bleacherRowElem.classList.add("row__edit")
    bleacherRowElem.innerHTML = bleacherRowTemlate

    // ############################# show user dropdown ################################
    const actionBtnElm = bleacherRowElem.querySelector(".bleacher-action-btn")
    actionBtnElm.addEventListener("click", (e) => {
        e.preventDefault()
        toggleDropdown(actionBtnElm)
    })


    // edit game dropdown link
    bleacherRowElem.querySelector(".dropdown-link_edit").addEventListener("click", () => {
        bleacherRowElem.classList.add("row__edit")
        toggleDropdown(actionBtnElm, "hide")
    })

    // update team data
    const updateBtnElm = bleacherRowElem.querySelector(".btn__save")
    updateBtnElm.addEventListener("click", async () => {
        const quantityElem = bleacherRowElem.querySelector(".table-input__quantity")
        const priceElem = bleacherRowElem.querySelector(".table-input__price")

        updateBtnElm.setAttribute("disabled", "true")
        const waitNot = new APP.Notification("Please wait...", "loading")
        waitNot.push()

        // // send data
        const updatedBleacherResult = await APP.fetch(`bleacher/${data.type}`, { method: "PUT", body: {quantity : quantityElem.value, price : priceElem.value}, actor: "admin" })
        const updatedBleacher = updatedBleacherResult.data

        updateBtnElm.removeAttribute("disabled")
        waitNot.pop()

        if (updatedBleacherResult.success) {
            isFirstEnter[0] = true
            bleacherRowElem.classList.remove("row__edit")
            quantityElem.value = updatedBleacher.quantity
            priceElem.value = updatedBleacher.price
        } else {
            const errNot = new APP.Notification("Please check your inputs", "false")
            errNot.push()
            errNot.popAfter(3000)
        }
    })

    if (isFirstChild) tableBodyElm.prepend(bleacherRowElem)
    else tableBodyElm.appendChild(bleacherRowElem)
}








// update compare chart
async function compareChart(gameId) {
    document.querySelector(".card__compare").classList.add("card__loading-state")

    const bleachersResult = await APP.fetch("bleacher")
    const bleachers = bleachersResult.data

    const maxQuantity = bleachers.reduce((maxObj, obj) => obj.quantity > maxObj.quantity ? obj : maxObj).quantity



    // update bars
    const compareChartElm = document.querySelector(".compare-chart .bars")
    compareChartElm.innerHTML = ""

    bleachers.forEach(bleacher => {
        gameStatByBleacher = bleacher.tickets.filter((ticket) => ticket.gameId == gameId)[0]
        if (!gameStatByBleacher) gameStatByBleacher = { freePlaces: bleacher.quantity }

        const barTemplate = `
            <div class="bar--wrapper">
                <div style="height:${bleacher.quantity * 100 / maxQuantity}%" data-value="${bleacher.quantity}" class="bar bar__s1"></div>
                <div style="height:${gameStatByBleacher.freePlaces * 100 / maxQuantity}%" data-value="${gameStatByBleacher.freePlaces}" class="bar bar__s2"></div>
                <p class="bar--text">${bleacher.type}</p>
            </div>`

        compareChartElm.innerHTML += barTemplate
    })

    // update axises
    document.querySelectorAll(".axises .namber").forEach((n,i) => n.innerText = Math.floor(maxQuantity-i*(maxQuantity/4)))

    document.querySelector(".card__compare").classList.remove("card__loading-state")
}

// ################################ statistics tab ####################################
const statisticsSelectElm = document.querySelector(".statistics-option")

async function statisticsTabInit() {
    const gamesResult = await APP.fetch("game", { query: { filter: "new", include: "team" } })
    const games = gamesResult.data
    compareChart(games[0].id)


    statisticsSelectElm.innerHTML = ""
    games.forEach(game => {
        statisticsSelectElm.innerHTML += `<option value="${game.id}">${game.team1.name}-${game.team2.name}</option>`
    })


    statisticsSelectElm.addEventListener("change", (e) => {
        compareChart(Number(statisticsSelectElm.value))
    })
}




// ################################# teams tab ######################################
async function teamsTabInit() {
    const wiatNot = new APP.Notification("Fetching teams data", "loading")
    wiatNot.push()

    const teamsResult = await APP.fetch("team", { query: { include: "game" } })
    const teamsData = teamsResult.data

    const tableBodyElm = document.querySelector(".teams-table--body")

    // add fetched team to the table
    teamsData.forEach(team => addTeam(team))


    // add new team
    const addNewTeamBtn = document.querySelector(".add-team-btn")
    addNewTeamBtn.addEventListener("click", () => {
        addNewTeamBtn.setAttribute("disabled", "true")

        // <img src="../images/default-team.svg">
        const newTeamTemplate = `
            <td><span class="team-id">?</span></td>
            <td>
                <div class="team-img">
                    <img class="team-img__img" style="display : none">
                    <svg class="team-img__svg" version="1.1" viewBox="0 0 110.67 113.3" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(-47.337 -87.937)">
                            <path transform="translate(-1.8541 -4.639)" d="m100.37 195.69c-7.0062-2.839-13.057-6.0367-18.883-9.9798-2.73-1.8477-3.0752-2.163-2.7781-2.5375 0.18658-0.23525 15.163-16.56 33.28-36.277l32.941-35.85 0.17049 8.1941c0.29731 14.289 2.0224 26.259 5.551 38.519l0.80828 2.8082-0.58609 1.1605c-1.8854 3.7332-6.1126 9.2032-10.568 13.675-6.9192 6.9449-14.883 12.512-24.656 17.234-4.8846 2.3603-10.222 4.5208-11.125 4.5032-0.33243-6e-3 -2.2016-0.65896-4.1537-1.45z" fill="rgba(var(--clr-primary), .6)"/>
                            <path transform="translate(-1.8541 -4.639)" d="m68.446 174.87c-4.1549-4.253-7.3074-8.2058-9.5656-11.994l-1.3542-2.2717 0.38042-1.2388c1.7126-5.5768 3.4209-13.364 4.4508-20.289 1.107-7.4436 1.5537-13.613 1.5856-21.9l0.0293-7.6122 2.6458-1.0278c8.959-3.4802 22.513-6.2548 34.793-7.1224 6.0665-0.4286 17.476 0.888 27.517 3.1753 3.8512 0.87731 8.7448 2.2627 9.0549 2.5634 0.13056 0.12663-59.374 65.24-65.389 71.553-0.10834 0.1137-1.9744-1.6127-4.1469-3.8365z" fill="rgba(var(--clr-primary), .3)"/>
                            <path transform="translate(-1.8541 -4.639)" d="m99.962 204.28c-18.213-7.2875-33.409-18.154-44.086-31.526-2.295-2.8743-5.1777-7.1433-6.086-9.0128l-0.59918-1.2333 1.2354-4.1761c4.4371-15 6.3246-28.595 6.3809-45.961l0.03082-9.5062 1.8473-0.76141c10.193-4.2015 26.853-7.892 41.976-9.2984 3.2568-0.30288 4.5099-0.30405 7.7931-0.0073 8.5838 0.77594 17.587 2.2865 26.024 4.3666 5.3797 1.3262 13.402 3.8512 16.28 5.1236l1.5002 0.66348-0.18281 5.4941c-0.5425 16.304 2.2457 36.922 6.9864 51.664l0.80323 2.4978-1.4589 2.5213c-3.1824 5.5-7.1239 10.413-12.861 16.031-7.9684 7.8028-15.538 13.131-26.407 18.589-5.8973 2.961-13.461 6.14-14.574 6.1257-0.35162-5e-3 -2.4224-0.72166-4.6017-1.5937zm8.2168-2.78c9.1992-3.6752 19.097-9.1538 26.165-14.483 7.0256-5.2971 14.347-12.721 18.707-18.971 1.7928-2.5694 3.3937-5.388 3.3898-5.9685-2e-3 -0.28258-0.2465-1.2877-0.5436-2.2336-0.89754-2.8575-2.8237-10.728-3.6729-15.008-2.1259-10.715-3.0078-19.863-3.0357-31.488l-0.0205-8.5284-3.175-1.1622c-12.028-4.4026-30.47-7.9382-41.407-7.9382-7.9432 0-22.14 2.1953-32.288 4.9928-2.7144 0.74831-10.306 3.2119-12.162 3.9469-0.34003 0.13462-0.38394 0.99998-0.30655 6.0415 0.23541 15.336-1.8251 31.288-5.9718 46.233-0.66622 2.4011-1.2618 4.6643-1.3236 5.0293-0.1423 0.84094 3.6327 6.6039 6.8444 10.449 4.5052 5.3934 11.29 11.64 17.318 15.943 6.3994 4.5686 15.355 9.4448 23.656 12.881 2.2556 0.9336 4.1105 1.706 4.1222 1.7164 0.0116 0.0104 1.6785-0.6432 3.7042-1.4525z" fill="rgba(var(--clr-primary), .8)"/>
                        </g>
                    </svg>
                </div>
                <label for="inputTag" class="upload-btn">
                    <i class="fa-solid fa-upload"></i>
                </label>
                <input id="inputTag" class="logo--input team-logo--input" type="file" accept="image/*" />
            </td>
            <td><input class="table-input table-input__name" type="text" value="" placeholder="Name"></td>
            <td><input class="table-input table-input__captain" type="text" value="" placeholder="Captain name"></td>
            <td class="teams-table--action-wrapper">
                <button class="btn btn_primary btn_small btn__save"><i class="fa-solid fa-save"></i>Save</button>
            </td>
            </td>
        `

        const teamElem = document.createElement("tr")
        teamElem.classList.add("team-row")
        teamElem.classList.add("row__edit")
        teamElem.innerHTML = newTeamTemplate


        // upload team logo
        const logoInputElm = teamElem.querySelector(".team-logo--input")
        const teamLogoElm = teamElem.querySelector(".team-img__img")
        logoInputElm.addEventListener("change", async () => {
            if (await APP.getMimeType(logoInputElm.files[0]) == "Unknown") {
                const errNot = new APP.Notification("Doesn't look like an image", "false")
                errNot.push()
                errNot.popAfter(2000)
            } else {
                teamLogoElm.src = URL.createObjectURL(logoInputElm.files[0])
                teamLogoElm.style.display = "block"
                teamElem.querySelector(".team-img__svg").style.display = "none"
            }
        })


        // save the new team
        const svaeBtn = teamElem.querySelector(".btn__save")
        svaeBtn.addEventListener("click", async () => {
            const logo = logoInputElm.files[0]
            const nameElm = teamElem.querySelector(".table-input__name")
            const captainNameElm = teamElem.querySelector(".table-input__captain")

            const newTeam = {}

            if (nameElm.value && nameElm.value.length > 0) newTeam.name = nameElm.value.toUpperCase()
            if (captainNameElm.value && captainNameElm.value.length > 0) newTeam.captainName = captainNameElm.value
            else newTeam.captainName = null

            svaeBtn.setAttribute("disabled", "true")
            const waitNot = new APP.Notification("Please wait...", "loading")
            waitNot.push()

            let teamResult = await APP.fetch("team", { method: "POST", actor: "admin", body: newTeam })

            waitNot.pop()
            svaeBtn.removeAttribute("disabled")

            if (teamResult.success == true) {
                // update logo if any
                if (logo) {
                    const formData = new FormData()
                    formData.append('logo', logo)

                    const logoUploadResult = await APP.fetch(`team/${teamResult.data.id}/upload/logo`, {
                        method: "POST",
                        body: formData,
                        actor: "admin",
                        bodyType: "file"
                    })

                    if (logoUploadResult.success) teamResult = logoUploadResult
                }

                addNewTeamBtn.removeAttribute("disabled")
                tableBodyElm.removeChild(teamElem)
                addTeam(teamResult.data, true)

            } else {
                const errNot = new APP.Notification(teamResult.message, "false")
                errNot.push()
                errNot.popAfter(3000)
            }
        })


        tableBodyElm.prepend(teamElem)
    })

    wiatNot.pop()
}


async function gamesTabInit() {
    const wiatNot = new APP.Notification("Fetching games data", "loading")
    wiatNot.push()

    const results = await Promise.all([
        APP.fetch("game", { query: { include: "team,league" } }),
        APP.fetch("team"),
        await APP.fetch("league")
    ])

    const gamesData = results[0].data
    const teamsData = results[1].data
    const leaguesData = results[2].data


    const tableBodyElm = document.querySelector(".games-table--body")
    tableBodyElm.innerHTML = ""

    // add fetched team to the table
    gamesData.forEach(game => addGame({ game, teams: teamsData, leagues: leaguesData }))



    // add new game
    const addNewGameBtn = document.querySelector(".add-game-btn")
    addNewGameBtn.addEventListener("click", () => {
        addNewGameBtn.setAttribute("disabled", "true")

        const teams = teamsData
        const leagues = leaguesData


        const tableBodyElm = document.querySelector(".games-table--body")
        const gameRowTemlate = `
                <td><span class="game-id">?</span></td>
                <td>
                    <input class="table-input__date" type="date" value="${new Date().toISOString().substring(0, 10)}">
                </td>
    
                <td>
                    <input class="table-input__time" type="time" value="${new Date().toISOString().substring(11, 16)}">
                </td>
    
                <td>
                    <div class="game-team">
                        <div class="team-img"><img src="../images/default-team.svg"></div>
    
                        <select class="select-btn select-team">
                            <option value="" selected></option>
                            ${teams.map(team => {
            return `<option value="${team.id}">${team.name}</option>`
        })}
                        </select>
                    </div>
                </td>
    
                <td>
                    <div class="game-team">
                        <div class="team-img"><img src="../images/default-team.svg"></div>
                        <select class="select-btn select-team">
                            <option value="" selected></option>
                            ${teams.map(team => {
            return `<option value="${team.id}">${team.name}</option>`
        })}
                        </select>
                    </div>
                </td>
    
                <td>
                    <select class="select-btn select-league">
                        <option value="" selected></option>
                        ${leagues.map(league => {
            return `<option value="${league.id}">${league.name}</option>`
        })}
                    </select>
                </td>
    
                <td>
                    <div class="game-score-wrapper">
                        <input class="table-input table-input__score" type="text" value="" placeholder="0">
                        -  
                        <input class="table-input table-input__score" type="text" value="" placeholder="0">    
                    </div
                </td>
                <td><input class="table-input table-input__desc" type="text" value="" placeholder="description"></td>
    
                <td class="table--action-wrapper">
                    <button class="btn btn_primary btn_small btn__save"><i class="fa-solid fa-save"></i>Save</button>
                </td>
        `

        const gameRowElem = document.createElement("tr")
        gameRowElem.classList.add("row")
        gameRowElem.classList.add("row__edit")
        gameRowElem.innerHTML = gameRowTemlate


        // select team
        const selectTeamElems = gameRowElem.querySelectorAll(".select-team")
        selectTeamElems.forEach(selectTeamElm => {
            selectTeamElm.addEventListener("change", () => {
                const team = teams.filter(t => { if (t.id == new Number(selectTeamElm.value)) return t })[0]
                if (team) selectTeamElm.previousElementSibling.children[0].src = APP.HOSTNAME + team.logo
                else selectTeamElm.previousElementSibling.children[0].src = "../images/default-team.svg"
            })
        })

        // score inputs
        const scoreInputElems = gameRowElem.querySelectorAll(".table-input__score")

        // date and time input
        const dateInputElem = gameRowElem.querySelector(".table-input__date")
        const timeInputElem = gameRowElem.querySelector(".table-input__time")

        dateInputElem.addEventListener("change", checkIfGameFinished)
        timeInputElem.addEventListener("change", checkIfGameFinished)

        function checkIfGameFinished() {
            if (new Date(dateInputElem.value + " " + timeInputElem.value) > new Date()) gameRowElem.classList.remove("game-row__finished")
            else gameRowElem.classList.add("game-row__finished")
        }



        // save the new team
        const svaeBtn = gameRowElem.querySelector(".btn__save")
        svaeBtn.addEventListener("click", async () => {

            const leagueIdElem = gameRowElem.querySelector(".select-league")
            const descriptionElem = gameRowElem.querySelector(".table-input__desc")
    
    
            let score = (scoreInputElems[0].value.length != 0 && scoreInputElems[1].value.length != 0) ? `${scoreInputElems[0].value}-${scoreInputElems[1].value}` : null
            const newGameData = {
                team1Id: selectTeamElems[0].value,
                team2Id: selectTeamElems[1].value,
                leagueId: leagueIdElem.value || null,
                description: descriptionElem.value,
                score: score,
                date: new Date(dateInputElem.value + " " + timeInputElem.value)
            }

            
            svaeBtn.setAttribute("disabled", "true")
            const waitNot = new APP.Notification("Please wait...", "loading")
            waitNot.push()

            let gameResult = await APP.fetch("game", { method: "POST", actor: "admin", body : newGameData})

            waitNot.pop()
            svaeBtn.removeAttribute("disabled")

            if (gameResult.success == true) {
                isFirstEnter[0] = true
                addNewGameBtn.removeAttribute("disabled")
                tableBodyElm.removeChild(gameRowElem)

                const newGameResult = await APP.fetch(`game/${gameResult.data.id}`, { query: { include: "team,league" } })
                console.log(newGameResult.data)
                addGame({ game : newGameResult.data, teams: teamsData, leagues: leaguesData }, true)

            } else {
                const errNot = new APP.Notification(gameResult.message, "false")
                errNot.push()
                errNot.popAfter(3000)
            }
        })



        tableBodyElm.prepend(gameRowElem)
    })

    wiatNot.pop()
}



async function bleachersTabInit() {
    const wiatNot = new APP.Notification("Fetching bleachers data", "loading")
    wiatNot.push()

    const results = await APP.fetch("bleacher")
    const bleachersData = results.data

    const tableBodyElm = document.querySelector(".bleachers-table--body")
    tableBodyElm.innerHTML = ""

    // add fetched team to the table
    bleachersData.forEach(bleacher => addBleacher(bleacher))

    wiatNot.pop()
}

selectTab(currentTab)