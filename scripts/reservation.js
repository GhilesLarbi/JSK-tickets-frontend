const bleacherElems = document.querySelectorAll(".btype")

bleacherElems.forEach(bleacherElm => {
    bleacherElm.addEventListener("click", () => {
        selectBleacher(bleacherElm.getAttribute("data-type"))
    })
})

function selectBleacher(bleacherType) {
    bleacherElems.forEach(bleacherElm => {
        bleacherElm.classList.remove("btype_selected")
        if (bleacherElm.getAttribute("data-type") === bleacherType) {
            bleacherElm.classList.add("btype_selected")
        }
    })
}