const svgcontainer = document.getElementById("svgcontainer");
const dayNumContainers = document.querySelectorAll("#schedule > div > #week > span");

dayNumContainers.forEach(el => {
    let dimentionRatio = ((window.innerWidth/window.innerHeight)); 
    let h = parseInt(window.getComputedStyle(el).width)-dimentionRatio ;     
    el.style.height =  `${h}px`;  
    let date = new Date();
    date.setDate(date.getDate()-(el.textContent-1)); 
    el.textContent = date.getDate();
})