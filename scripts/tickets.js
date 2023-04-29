async function init() {
    const tickets = await APP.fetch("ticket")
    console.log(tickets)
    
    document.querySelector("p").textContent = JSON.stringify(tickets.data, 2)
}

APP.init(init)