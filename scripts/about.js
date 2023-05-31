const btns = document.querySelectorAll(".read-more-btn");
const pars = document.querySelectorAll(".p");
const poems = document.querySelectorAll(".poem-image");

btns.forEach(btn =>{
    btn.addEventListener("click",()=>{
        switch(btn.className){
            case "read-more-btn btn1":
            pars[0].classList.add("show");
            poems[0].classList.add("show");
            btns[0].classList.add("up");
            break;
            case "read-more-btn btn1 up":
            pars[0].classList.remove("show");
            poems[0].classList.remove("show");
            btns[0].classList.remove("up");
            break;
            case "read-more-btn btn2":
            pars[1].classList.add("show");
            poems[1].classList.add("show");
            btns[1].classList.add("up");
            break;
            case "read-more-btn btn2 up":
            pars[1].classList.remove("show");
            poems[1].classList.remove("show");
            btns[1].classList.remove("up");
            break;
            case "read-more-btn btn3":
            pars[2].classList.add("show");
            poems[2].classList.add("show");
            btns[2].classList.add("up");
            break;
            case "read-more-btn btn3 up":
            pars[2].classList.remove("show");
            poems[2].classList.remove("show");
            btns[2].classList.remove("up");
            break;
            case "read-more-btn btn4":
            pars[3].classList.add("show");
            poems[3].classList.add("show");
            btns[3].classList.add("up");
            break;
            case "read-more-btn btn4 up":
            pars[3].classList.remove("show");
            poems[3].classList.remove("show");
            btns[3].classList.remove("up");
            break;
        }
    })
})

//swipe bar
var swiper = new Swiper(".mySwiper", {
    slidesPerView: 3,
    spaceBetween: 30,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
