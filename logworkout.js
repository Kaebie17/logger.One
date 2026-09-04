// Was document.getElementById("logworkoutJS") -- functions.js now injects
// this script dynamically (see PAGE_SCRIPTS there) with no fixed id.
const indexScript = document.currentScript;
const chooseProgram = document.getElementById("chooseprogram");
const programDisplay = document.getElementById("selectedprogram");
const intensityScale = document.getElementById("intensity");
const clockSVGArea = document.getElementById("clocksvgarea");
const addExercises = document.getElementById("addexercises");
const saveWorkout = document.getElementById("saveworkout");
const redirectHome = document.querySelector("#header > h1");
const dateElements =  document.querySelectorAll("input[type='date']");
const fromClock_output = document.querySelectorAll("#from output");
const fromClock_AMorPM = document.querySelectorAll("#from select");
const toClock_output = document.querySelectorAll("#to output");
const toClock_AMorPM = document.querySelectorAll("#to select");
const script = document.createElement("script");
const periodObject = {login: "", logout: ""}
const existingTemplates = window.templatesData || {};
let newTemplateEntries = {};
let [startDate,startTime,startAmPm] = []
let [endDate,endTime,endAmPm] = [];
let finalLog = {} ;
let restoreSelection ;

// Below code is executed when user logs past workout via logworkout page, or returns to logworkout page after making exercise selection on exercises page, 
// or when user click on a pre-created template to log it as the past workout including any edits in exercise details or other details before logging the past workout.  

// Fuction to retrieve stored workouts from memory. Now backed by IndexedDB
// (functions.js loads it into window.workoutLogData before this script runs).
const workoutObject = () => {
    const workoutObject = new Map();
    const pastWorkouts = window.workoutLogData||[];
    pastWorkouts.forEach(([k,v]) => workoutObject.set(k,v))
    return workoutObject;
};

// Date and time calculations
const date = new Date();
let minutes = appendZero(date.getMinutes());
let hours = date.getHours() > 12 ? appendZero(date.getHours()-12) : appendZero(date.getHours()) ;
let time = date.getTime().toLocaleString();
const formatDate = (date) => {
    const datenum = appendZero(date.getDate()); 
    const monthnum = appendZero(date.getMonth()+1);
    const fullyear = date.getFullYear();
    return `${fullyear}-${monthnum}-${datenum}` ;
} 

// Block will be executed when user is done with selecting exercises to log for the day and returns to logworkout page from exercises page.
if(new URL(document.location).searchParams.get("eData")){
    finalLog = sessionStorage?.program;
    if (finalLog) {
        programDisplay.value = finalLog  ;
        chooseProgram.classList.add("mark") ;
    }
    finalLog = sessionStorage?.intensity||'';
    if (finalLog) {
        intensityScale.value = finalLog;
    }
    finalLog = JSON.parse(sessionStorage.finalLog) ;
    newTemplateEntries[programDisplay.value] = Object.fromEntries(Object.entries(finalLog).filter(([key,value]) => key!=="start" && key!=="end" && key!=="unit"));
    delete sessionStorage.restoreSelection;
    sessionStorage.templates = JSON.stringify(newTemplateEntries);
    [startDate,startTime,startAmPm] = finalLog.start.split(", ").flatMap((e,i) => i===1 ? e.split(" ") : e).map((el,j) => j===1 ? el.split(":").slice(0,2).join(":") : el) ;
    [endDate,endTime,endAmPm] = finalLog.end.split(", ").flatMap((e,i) => i===1 ? e.split(" ") : e).map((el,j) => j===1 ? el.split(":").slice(0,2).join(":") : el) ;
    periodObject.login = startTime + " " + startAmPm ; 
    periodObject.logout = endTime + " " + endAmPm ;
    
    dateElements[0].value = new Date(startDate).toISOString().split("T")[0];
    dateElements[1].value = new Date(endDate).toISOString().split("T")[0];
    fromClock_output[0].value = startTime.split(":")[0];
    fromClock_output[1].value =  startTime.split(":")[1];
    toClock_output[0].value = endTime.split(":")[0];
    toClock_output[1].value =  endTime.split(":")[1];
    fromClock_AMorPM[0].value = startAmPm;
    toClock_AMorPM[0].value = endAmPm; 
    clockSVGArea.style.pointerEvents="none" ;
    clockSVGArea.style.touchAction = "none" ;
    clockSVGArea.classList.add("mark") ;
    presentStats();
    saveWorkout.addEventListener("click", saveWorkoutFunction)
}

// Block handles editing template exercises to log as past workout
else if(new URL(document.location).searchParams.get("temp")){
    const program = new URL(document.location).searchParams.get("temp");
    programDisplay.value = program;
    chooseProgram.disabled = true;
    programDisplay.disabled = true;
    programDisplay.classList.add("mark");
    finalLog = existingTemplates[program] ;
    currentTime()
    presentStats();
    saveWorkout.addEventListener("click", saveWorkoutFunction)
}
else{
    currentTime();
    sessionStorage.clear()
}
updateSystemicFatigueAvailability();

// redirect to home page
redirectHome.addEventListener("click" , home)

// Choose program section behaviour with select, option group, and option elements as well as text input for custom inputs.
const handleChoiceChange = (e)=>{programDisplay.value = chooseProgram.value; programDisplay.classList.add("mark"); chooseProgram.classList.remove("mark")};
const handleCustomChoice = (e)=>{ chooseProgram.value = chooseProgram[0].value; programDisplay.classList.remove("mark"); chooseProgram.classList.add("mark")};
chooseProgram.addEventListener ("change", handleChoiceChange);
programDisplay.addEventListener("focus", handleCustomChoice);
programDisplay.addEventListener("keydown", (e)=>{if(e.key==="Enter") {e.preventDefault();}});
dateElements[0].addEventListener("change", updateSystemicFatigueAvailability);

// document.addEventListener ("change", captureChange);

// Schedule section clock graphics using SVG code and connecting behaviour behaviour to output and select elements. Clock hands are draggable to select hours and minutes.
const clocksCode = script.cloneNode(true);
clocksCode.src = "svgcode.js";
indexScript.before(clocksCode); // add script element to HTML document
//run code when current script loads to allow imports from different JS file.
clocksCode.onload = () => {
    const {fromClock, toClock} = clockDesign() ; // import clock graphics from svgcode.js file.
    clockSVGArea.firstChild.before(fromClock,toClock); // add clock to HTML document.
    fromClock.id = "fromClockContainer";
    toClock.id = "toClockContainer";
    // Impart click capability to clock face, and mousemove and touchmove capabilities to clock face to control clock hands selection and movement.
    let flexDate = new Date();
    const variables = {subValue : 0 , multiple : 1}  ;
    let selectedElement = false;
    if(new URL(document.location).searchParams.get("eData")){
        document.getElementById("fromClock").nextElementSibling.setAttribute("transform",`rotate(${(360*startTime.split(":").join(".")/12)},50,50)`);
        document.getElementById("toClock").nextElementSibling.setAttribute("transform",`rotate(${(360*endTime.split(":").join(".")/12)},50,50)`);
        document.getElementById("fromClock").nextElementSibling.nextElementSibling.setAttribute("transform",`rotate(${(360*startTime.split(":")[1]/60)},50,50)`);
        document.getElementById("toClock").nextElementSibling.nextElementSibling.setAttribute("transform",`rotate(${(360*endTime.split(":")[1]/60)},50,50)`);
    }

    const removeEvt = (event) => {
        event.target.parentElement.firstElementChild.removeEventListener( "mousemove" , setTime);
        event.target.parentElement.firstElementChild.removeEventListener( "touchmove" , setTime);
    }

    const selectClockHand = (event) => {
        event.stopPropagation();
        if (event.target.id !== "hourhand" && event.target.id !== "minhand") {  event.target.parentElement.querySelector(".mark")?.classList?.remove("mark") ; selectedElement = false; removeEvt(event); return};
        if (selectedElement && event.target.parentElement.id === clockSVGArea.querySelector(".mark").parentElement.id) {event.target.parentElement.querySelector(".mark").classList.remove("mark");selectedElement = false; removeEvt(event); return} ;
        if (selectedElement && event.target.parentElement.id !== clockSVGArea.querySelector(".mark").parentElement.id) {return} ;
        selectedElement =  event.target.id ; 
        event.target.classList.toggle("mark") ; 
        event.target.removeEventListener("click",selectClockHand);

        //Dragging clock hands anticlockwise to allow setting past time only. 
        event.target.parentElement.firstElementChild.addEventListener( "pointermove" , setTime);
        event.target.parentElement.firstElementChild.addEventListener( "touchmove" , setTime);
    }

    const setTime = (event) => {
        event.stopPropagation();
        if (selectedElement){
            const outputId = event.target.id.replace("Clock","");
            const currentHand = document.querySelector(`#${event.target.id}~#${selectedElement}`);
            const otherHand = selectedElement !== "minhand" ? document.querySelector(`#${event.target.id}~#minhand`) : document.querySelector(`#${event.target.id}~#hourhand`); 
            const display = document.querySelectorAll(`#${outputId} select`);
            const output = document.querySelectorAll(`#${outputId} output`);
            const dateElem = document.querySelector(`#${outputId} input[type="date"]`);
            let deg = parseFloat(currentHand.getAttribute("transform").substring(7,12));
            let otherDeg = (parseFloat(otherHand.getAttribute("transform").substring(7,12)));
            
            // console.log(deg,otherDeg);
            if (selectedElement === "minhand"){
                deg = deg <= 0 ? 359 : deg ;
                currentHand.setAttribute("transform",`rotate(${(deg-1)},50,50)`); 
                output[1].value = appendZero(Math.floor(Math.abs(deg)/6));
                deg === 359 ? setTime.i=0 : "" ;
                otherDeg  = otherDeg <= 0 ? 359 : otherDeg ;

                if(setTime.i++%12 === 0){ 
                    otherHand.setAttribute("transform",`rotate(${(otherDeg-1)},50,50)`) 
                    output[0].value =  (deg/30 <= (parseInt(output[0].value)||12)  && deg !== 359  ) ? output[0].value : appendZero(Math.floor(otherDeg/30)) ;  
                    }

                if (deg===359&&(output[0].value === "11" && output[1].value === "59")) {
                    display[0].children[0].selected ? (display[0].children[1].selected = true, display[0].children[0].selected = false, dateElem.value = formatDate (new Date(new Date(dateElem.value) - 24*60*60*1000))) :
                        (display[0].children[1].selected = false, display[0].children[0].selected = true) ;
                    if (outputId === "from") updateSystemicFatigueAvailability();
                }
            }
            else{
                deg = deg <= 0 ? 359 : deg ;
                otherDeg  = otherDeg <= 0 ? 359 : otherDeg  ;
                currentHand.setAttribute("transform",`rotate(${(deg-0.5)},50,50)`); 
                otherHand.setAttribute("transform",`rotate(${(otherDeg-6)},50,50)`) 
                output[0].value = (deg/30 <= (parseInt(output[0].value)||12)  && otherDeg !== 359  ) ? output[0].value : appendZero(Math.floor(deg/30))  ;
                output[1].value =  appendZero(Math.floor((otherDeg/6))) ;
                setTime.i = 0 ;
                if (output[0].value === "11"&& output[1].value === "59") {
                    display[0].children[0].selected ? (display[0].children[1].selected = true, display[0].children[0].selected = false, dateElem.value = formatDate (new Date(new Date(dateElem.value) - 24*60*60*1000))) :
                        (display[0].children[1].selected = false, display[0].children[0].selected = true) ;
                    if (outputId === "from") updateSystemicFatigueAvailability();
                }
               
            }
        }
    }
    setTime.i = 0 ; 
    // Selecting and Unselecting clock hands to set time by dragging. 
    clockSVGArea.addEventListener("click", selectClockHand);
}

// Adding exercises through button click. Also handles edit exercises for logworkout as well as template pages.
addExercises.onclick = () => {
    updateTimeRecord();
    const time = periodObject.login ;
    sessionStorage.program = programDisplay.value ;
    // block handles editing template exercises to log as past workout
    // if (new URL(document.location).searchParams.get("eData")){
    //     alert("this block") 
    // }
    // log new past workout block as well as handles editing exercises selected for new past workout
    // else {
        if(!programDisplay.value){alert("No program name selected!"); return;}
        if(startDate === endDate && periodObject.login === periodObject.logout){alert("Workout start time cannot be same as workout end time!"); return;}
        sessionStorage.intensity = intensityScale.value;
        const date = startDate;
        // document.querySelector("input[type=date]").value = date;
        // document.querySelectorAll("input[type=date]~span>output").forEach(el => el.value = el.value);
        const loc = new URL("exercises.html", document.location);
        {
            loc.searchParams.set("s", new Date(startDate + " " + periodObject.login).toLocaleString());
            loc.searchParams.set("e", new Date(endDate + " " + periodObject.logout).toLocaleString());
            loc.searchParams.set("temp",sessionStorage.program)
        } //probably not necessary due to sessionstorage property : program
        if (!new URL(document.location).searchParams.size) {loc.searchParams.set("new",true);}
        
        document.location = loc;
}

async function saveWorkoutFunction(event) {

    if(!startDate){alert("Workout duration cannot be 0!"); return}
    const workoutName = programDisplay.value;
    const workoutDate = startDate;
    const workoutStartTime = periodObject.login;
    const workoutEndTime = periodObject.logout;
    const workoutIntensity = document.getElementById("intensity").value;
    // Empty string means "not yet rated" -- the systemic fatigue slider
    // stays disabled (and thus meaningless) for a same-day workout, since
    // the user genuinely doesn't know it yet. Only a backlogged entry (date
    // !== today, slider enabled by updateSystemicFatigueAvailability)
    // captures a real value here.
    const workoutSystemicFatigue = document.getElementById("systemicfatigue").disabled ? "" : document.getElementById("systemicfatigue").value;
    const workoutUnit = finalLog.unit;
    delete finalLog.start; delete finalLog.end; delete finalLog.unit;
    const workoutExercises = finalLog;
    const key = workoutDate + " " + workoutStartTime;
    let temp = workoutObject();
    temp.set(key , {workoutName,workoutDate,workoutStartTime,workoutEndTime,workoutIntensity,workoutSystemicFatigue,workoutExercises,workoutUnit});
    await window.LoggerDB.saveWorkoutLog(Array.from(temp));
    temp = "";
    let bool = prompt("Save as template/Replace template");
    if (bool || bool === ""){
        let templatesArr = Object.entries(window.templatesData || {});
        bool ? templatesArr.push([bool,workoutExercises]) :
            templatesArr = templatesArr.map(([k,v])=> {k===workoutName ? v = workoutExercises : ""; return [k,v]});
        await window.LoggerDB.saveTemplates(Object.fromEntries(templatesArr));
    }
    event.target.removeEventListener("click",saveWorkoutFunction);
    document.location = "./index.html"
}


//function declarations

// Initialize all date elements to current date
function currentTime(){   
    dateElements.forEach(el => {let today  = formatDate(date);  el.value = today;})
    toClock_output[0].value = fromClock_output[0].value = hours
    toClock_output[1].value = fromClock_output[1].value = minutes
    toClock_output[0].value = hours;
    toClock_output[1].value = minutes;
    new Date(date.getTime()).toLocaleString().endsWith("PM") ? (fromClock_AMorPM[0].children[1].setAttribute("selected",""),toClock_AMorPM[0].children[1].setAttribute("selected","")) : (fromClock_AMorPM[0].children[0].setAttribute("selected",""),toClock_AMorPM[0].children[0].setAttribute("selected","")) ;
    updateTimeRecord();
}


// Systemic fatigue from a workout can only honestly be known the day after
// it -- enabled for a backlogged entry (the user already lived through
// that next day), disabled and reset to 0 for today's, matching the
// current date selection at all times.
function updateSystemicFatigueAvailability(){
    const systemicFatigue = document.getElementById("systemicfatigue");
    const isToday = new Date(dateElements[0].value).toDateString() === new Date().toDateString();
    systemicFatigue.disabled = isToday;
    if (isToday) systemicFatigue.value = 0;
}

function updateTimeRecord(){
    [startDate,startTime,startAmPm] = [new Date(dateElements[0].value).toLocaleDateString(),`${fromClock_output[0].value}:${fromClock_output[1].value}:00`, fromClock_AMorPM[0].value];
    [endDate,endTime,endAmPm] = [new Date(dateElements[1].value).toLocaleDateString(),`${toClock_output[0].value}:${toClock_output[1].value}:00`, toClock_AMorPM[0].value];
    finalLog["start"] = `${startDate}, ${startTime} ${startAmPm}`;  
    finalLog["end"] =  `${endDate}, ${endTime} ${endAmPm}`;
    periodObject.login = startTime + " " + startAmPm ; 
    periodObject.logout = endTime + " " + endAmPm ;
}


function appendZero(val){
    return val.toString().length === 1 ? "0"+val : val ;
}

function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}


function captureChange(event){
    finalLog[event.target.id] = event.target.value;
}

function switchMeridiem(target){
    display.value = display.value === "AM" ? "PM" : "AM"        
}

/*
const saveExercisesFunction = (event) => {
  let dataNodes = selectionListDisplay.querySelectorAll("#selectionlistdisplay > div").length;
  let headerNodes = selectionListDisplay.querySelectorAll("#selectionlistdisplay > span").length; 
  console.log(dataNodes,headerNodes)
  if(dataNodes===headerNodes){
    const loc = new URL(document.location);
    const pFromURL = loc.searchParams.get("p");
    const date = pFromURL.split(", "); 
    const dataNodeObj = selectionListDisplay.querySelectorAll("#selectionlistdisplay > div");
    const entries = [["date", date[0]],["time", date[1]]];
    const key = pFromURL;
    const value = {}
    dataNodeObj.forEach(dataEl => {
      let decendentObj = decendents(dataEl,1,"button","remove");  
      decendentObj[1].forEach(el => {
        entries.push([el.name,el.value])
      })
      value[dataEl.id] = entries 
    })
    workoutLogMap.set(key, value);
  }
  else{
    alert("Incomplete exercise data. Please add atleast one set to each exercise to proceed.");
  }
}
*/ 

function presentStats(){
    let snapshotdata = {...finalLog};
    delete snapshotdata.date;
    delete snapshotdata.time;
    snapshotdata = Object.values(snapshotdata).flat().filter(([k,v])=> k==="setCount"||k==="repCount"||k==="vol");
    let sets = snapshotdata.filter(([k,v])=>k==="setCount").reduce(([k1,v1],[k2,v2])=> ["",v1+v2])[1] ;
    let reps = snapshotdata.filter(([k,v])=>k==="repCount").reduce(([k1,v1],[k2,v2])=> ["",v1+v2])[1] ;
    let volume = snapshotdata.filter(([k,v])=>k==="vol").reduce(([k1,v1],[k2,v2])=> ["",v1+v2])[1] ;
    volume = volume > 1000 ? volume/1000+"K" : volume;
    
    const div = document.createElement("div");
    div.textContent = `Volume:${volume}/Sets:${sets}/Reps:${reps}`;
    div.id = "snapshot"
    const button = document.getElementById("addexercises");
    button.style.display = "flex" ;
    button.textContent = "Edit Selection"
    button.style.justifyContent = "space-around"
    button.append(div)

    const flag = document.createElement("div");
    flag.id = "flag";
    let flagColor = "rgba(0%, 100%, 0%, 100%)"
    flag.style.backgroundImage = `linear-gradient(90deg, #232D3F, ${flagColor}, ${flagColor})`;
    button.parentElement.append(flag);
}

