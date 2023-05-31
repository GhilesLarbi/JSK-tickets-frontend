APP.addNavbar("..")
APP.initial()

let btn = document.querySelectorAll("button")
const btn1 = document.querySelector(".myprofile-btn")
const btn2 = document.querySelector(".changepassword-btn")
const hamb = document.querySelector(".hamburger-btn")

let username = document.querySelector(".username")
let Name = document.querySelector(".ipt.firstname")
let lastname = document.querySelector(".ipt.lastname")
let email = document.querySelector(".ipt.email")
let phone = document.querySelector(".ipt.phone")
let oldPass = document.querySelector("#old-pass")
let newPass = document.querySelector("#new-pass")
let confirmPass = document.querySelector("#confirm-pass")


const editBtn = document.querySelector(".edit-btn") //for infos
const editBtn2 = document.querySelector(".edit-btn2") //for password
const submitBtn = document.querySelector(".submit-btn")
const inputFields = document.querySelectorAll(".ipt")
const right_side_container = document.querySelector(".right-side-container")
const left_side = document.querySelector(".left-side")


//////////// get user info
async function getInfo(){
    const data = await APP.fetch("user",{
      method: "GET"
    }) 

    username.value = data.data.username    
    email.value = data.data.email
    phone.value = data.data.phone
    
    let us = username.value.split(" ")
    Name.value = us[0]
    lastname.value = us[1]
  }
  getInfo()

//////////// clicked and unclicked states 
btn.forEach(btn => {
  btn.addEventListener("click", () => {
    switch (btn.className) {
      case "myprofile-btn":
        switchForms(0);
        setClickedState(btn1, btn2);
        break;
      case "changepassword-btn":
        switchForms(1);
        setClickedState(btn2,btn1);
        break;
    }
  })
});

function setClickedState(clickedBtn, unclickedBtn) {
  clickedBtn.classList.add("clicked");
  unclickedBtn.classList.remove("clicked");
}

btn1.addEventListener("click",()=>{
  btn1.classList.add("clicked")
})

//////////// switch between right sides
function switchForms(index) {
  const forms = document.querySelectorAll(".right-side")
  forms.forEach(form => {
      form.classList.remove("show")
  })
  forms[index].classList.add("show")
}

//////////// enable/disable input fields
inputFields.forEach(input=>{
  editBtn.addEventListener('click',()=>{
    input.classList.add("enable-editing")
    submitBtn.classList.add("show")
  })
})
inputFields.forEach(input=>{
  submitBtn.addEventListener('click',()=>{
    input.classList.remove("enable-editing")
    submitBtn.classList.remove("show")

///////update info
    async function setData(){
        let username2 = Name.value + " " +lastname.value 
        const data2 = await APP.fetch("user",{
        method: "PUT",
        body: { 
            username: username2,
            email: email.value ,
            phone: phone.value
        }
      }) 
    }
    setData() 
    // Set a timeout before reloading the page
      setTimeout(function() {
        window.location.reload();
      }, 1000);

  })
})

////change password
editBtn2.addEventListener("click",()=>{
  console.log(oldPass.value)
  console.log(newPass.value)
  console.log(confirmPass.value)
  async function changePass(){
    const data3 =  await APP.fetch("user/login",{
      method :"POST",
      body : {
        password : oldPass.value,
        email :email.value
      }
    })
    if(data3.success && newPass.value === confirmPass.value){
      await APP.fetch("user",{
        method :"PUT",
        body : {
          password : newPass.value,
          email : email.value
        }
      })
      console.log("password changed")
    }else{
      console.log("incorrect password")
    }
  }
  changePass()
  // Set a timeout before reloading the page
setTimeout(function() {
  window.location.reload();
}, 2000);

})


/////////// log out
const disconnectBtnElm = document.querySelector(".logout-btn")
        if (disconnectBtnElm) disconnectBtnElm.addEventListener("click", (e) => {
            e.preventDefault()
            localStorage.removeItem("token")
            window.location.reload()
            window.location.replace("/index.html")
        }) 
////////////////////////////////////////

 //number limitation
function limitCharacters(element, maxLength) {
    if (element.value.length > maxLength) {
      element.value = element.value.slice(0, maxLength);
    }
  }

//hamburger btn
hamb.addEventListener("click",()=>{
  left_side.classList.toggle("show")
  hamb.classList.toggle("show")
})