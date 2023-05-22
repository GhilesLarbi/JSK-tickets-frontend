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