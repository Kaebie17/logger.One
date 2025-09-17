const indexScript = document.getElementById("indexJS"); 
const logWorkout = document.getElementById("logworkout");
const createWorkout = document.getElementById("createworkout");
const svgContainer = document.getElementById("svgcontainer");
const redirectHome = document.querySelector("#header > h1");
const dateElements =  document.querySelectorAll("input[type='date']");
const calendarElem = document.getElementById("calendar");
const loadCalendar = document.getElementById("loadcalendar");
const dayNumContainers = document.querySelectorAll("#schedule > div > #week > span");
const date = new Date();
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
let nameMap =  new Map();
let script = document.createElement("script");
sessionStorage.clear();
const existingTemplates = localStorage?.templates ? JSON.parse(localStorage.templates) : {};
if (Object.keys(existingTemplates).length){
    const templates = Object.entries(existingTemplates);
    for (let [program,templateContent] of templates){
        createTemplateItem(program);
    }
}
const pastWorkoutsObject = JSON.parse(localStorage.workoutLogObject);
let dailyWorkoutLog = new Map(); 
//  debugger
// render svg content to the application 
let svgcode = script.cloneNode(true);
indexScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", () => {
    const {frontsvg,backsvg} = humanFigure();
    svgContainer.append(frontsvg);
    svgContainer.append(backsvg);
    [...frontsvg.children].forEach(el => el.dataset.name? nameMap.set(el.dataset.name, nameMap.get(el.dataset.name) || 0) : "");
    [...backsvg.children].forEach(el => el.dataset.name? nameMap.set(el.dataset.name, nameMap.get(el.dataset.name) || 0) : "");
    let temp = JSON.parse(localStorage?.workoutLogObject||"[]");
    temp.forEach(([k,v]) => dailyWorkoutLog.set(v.workoutDate + " " + v.workoutStartTime,v));
    temp = "";
    dailyWorkoutLog.size? recentWorkouts(dailyWorkoutLog) : "";
    dayNumContainers.forEach(el => {
        let dimentionRatio = ((window.innerWidth/window.innerHeight)); 
        let h = parseInt(window.getComputedStyle(el).width)-dimentionRatio ;     
        el.style.height =  `${h}px`;  
        let date = new Date();
        date.setDate(date.getDate()-(el.textContent-1)); 
        el.textContent = date.getDate();
        dailyWorkoutLog.keys().some(e => compareDates(new Date(e), date) ? el.classList.add("indent") : "");    
    })
})

let exerciseDBPage = script.cloneNode(true);
indexScript.before(exerciseDBPage);
exerciseDBPage.src = "exercisesDB.js";
exerciseDBPage.onload = () => {
    
}

// set past week dates in the schedule section and height of the date display elements 
const compareDates = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getDate() === date2.getDate() && date1.getMonth()+1 === date2.getMonth()+1;
}


// create workout button function
logWorkout.addEventListener("click", ()=>document.location = "./logworkout.html" )
createWorkout.addEventListener("click", ()=>document.location = "./template.html" )
loadCalendar.addEventListener( "click", ()=>{createCalendar(date)},{once:true}) ;

function recentWorkouts(object){
    const keys = Array.from(object.keys());
    const dates = keys.filter(key => new Date(key) > new Date(date.getTime() - 7*24*60*60*1000) )
    const recentWorkoutDetails = dates.map(date => object.get(date));
    recentWorkoutDetails.forEach(({workoutName,workoutDate,workoutStartTime,workoutEndTime,workoutIntensity,workoutSoreness,workoutExercises}) => {
        const movers = Object.values(workoutExercises).map(arr => arr[0][1]);
        const volumes = Object.values(workoutExercises).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]);
        const totalVol = volumes.reduce((a,b)=> a+b,0);
        movers.forEach(([primary, secondary, tertiary],i) => { 
            primary? primary = primary.replace("-","") : "";
            secondary? secondary = secondary.replace("-","") : "";
            tertiary? tertiary = tertiary.replace("-","") : "";
            nameMap.has(primary)? nameMap.set(primary,Math.round(nameMap.get(primary)+(volumes[i]*100)/totalVol)) : "";
            nameMap.has(secondary)? nameMap.set(secondary,Math.round(nameMap.get(secondary)+(0.30*volumes[i]*100)/totalVol)) : "";
            nameMap.has(tertiary)? nameMap.set(tertiary,Math.round(nameMap.get(tertiary)+(0.10*volumes[i]*100)/totalVol)) : "";
        });
    })

    nameMap.entries().forEach(([key, val])=> {
        let elemArr = val? document.querySelectorAll(`svg [data-name=${key}]`) : [];
        elemArr.forEach(elem => rgbValues(elem,val));
    })
}

function rgbValues(el,vol){
    switch(true) {
        case vol>100:{
            el.setAttribute("fill",`rgb(100%, 0%, 0%)`);
            break;
        };
        case vol>70&&vol<=100: {
            el.setAttribute("fill",`rgb(100%, 25%, 25%)`)
            break;
        };
        case vol>40&&vol<=70: {
            el.setAttribute("fill",`rgb(100%, 75%, 50%)`)
            break;
        };
        case vol>20&&vol<=40: {
            el.setAttribute("fill",`rgb(75%, 100%, 100%)`)
            break;
        };
        default: {
            el.setAttribute("fill",`rgb(50%, 50%, 50%)`)
            break;
        }       

    }
}

function createTemplateItem(program,cover){
    const templateContainer = document.getElementById("templates").firstElementChild;
    const templateItem = document.createElement("div");
    const coverImg = document.createElement("img");
    const label = document.createElement("h1");
    
    coverImg.src = cover||"default-image.png";
    coverImg.className = "default-img";

    label.textContent = program;
    label.className = "template-label"

    templateItem.className = "template-item";
    if (templateContainer.firstElementChild.nodeName === "P") templateContainer.firstElementChild.remove();
    templateItem.id = program + templateContainer.childElementCount;

    templateContainer.append(templateItem);
    templateItem.append(coverImg);
    templateItem.append(label);
    
    templateItem.addEventListener("click", handleTemplateItemClick)
}

function handleTemplateItemClick(event){
    const loc = new URL("file:///C:/Users/krish/Desktop/Web%20Development/Capstone%20projects/Project%207%20-%20LoggerDotOne/logworkout.html");
    let program = document.querySelector(`#${event.target.parentElement.id} h1`).textContent;
    loc.searchParams.set("temp", program);
    document.location = loc;
}

function showorhideElem(el,value){
    console.log(el)
    el.style.display = value;
}

function createCalendar(d){
    const _date = new Date(d);
    const label = document.createElement("label");
    label.textContent = months[_date.getMonth()] ;
    calendarElem.firstElementChild.firstElementChild.after(label);
    const calendarBody = document.createElement("div");
    calendarBody.className = "calendar-body"
    const dateBody = document.createElement("span");
    dateBody.className = "date-body"
    const frag = document.createDocumentFragment();
    let len = _date.getMonth()+1 === new Date(new Date(_date).getTime()+(31-new Date(_date).getDate())*24*60*60*1000).getMonth()+1 ? 31 : 30;
    const workoutDates = monthlyWorkoutDates(); 
    for (i=1;i<=len;i++){
        let clone = dateBody.cloneNode(true);
        clone.textContent = i
        workoutDates.includes(i)? clone.style.backgroundColor = "grey" : "";
        frag.append(clone);
    }
    calendarBody.append(frag);
    calendarElem.firstElementChild.after(calendarBody);
}

function scrollMonth(e){
    const d = new Date(date);
    let monthnum = months.findIndex(m => m===e.target.parentElement.children[1].textContent)+1;
    if(e.target.textContent === "<<"){
        monthnum -= 1;
    }
    else if(e.target.textContent === ">>"){
        monthnum += 1;
    }
    e.target.parentElement.children[1].remove();
    e.target.parentElement.parentElement.lastElementChild.remove();
    createCalendar(`${monthnum}/${d.getDate()}/${d.getFullYear()}`);
}

function monthlyWorkoutDates(){
    let monthnum = months.findIndex(m => m===calendarElem.firstElementChild.children[1].textContent);
    return pastWorkoutsObject.flatMap(([k,{workoutName, ...v}])=> { 
        let d = new Date(k);
        return d.getMonth() === monthnum ? [d.getDate()] : [] ;
    })
}
