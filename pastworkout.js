const defaultScript = document.getElementById("pastWorkoutJS");
const heading = document.getElementById("name");
const snapshotContainer = document.getElementById("snapshot");
const exerciseDisplay = document.getElementById("exercises");
const exerciseDetails = document.getElementById("expand");
const titleElem = document.getElementById("exname");
const targets = document.getElementById("mgroups");
const summaryArea = document.querySelectorAll("div[id^='summary']");
const logDetails = document.getElementById("exdetails");
const svgContainer = document.getElementById("svgcontainer");
const calendarArea = document.getElementById("calendar");
const redirectHome = document.querySelector("#header > h1");
const pastWorkoutsObject = JSON.parse(localStorage.workoutLogObject);
const finalLog = Object.fromEntries(JSON.parse(sessionStorage.finalLog));
const key = Object.keys(finalLog)[0];
const date = new Date(key).toLocaleDateString();
const intensity = finalLog[key]["workoutIntensity"];
const fatigue = "";
const headingVal = finalLog[key]["workoutName"];
const duration = durationCalc(date);
const exerciseData = finalLog[key]["workoutExercises"];
const totalVol = Object.values(finalLog[key]["workoutExercises"]).flat().filter(([k,v])=> k === "vol").map(([k,v])=>v).reduce((a,b)=>a+b);
delete finalLog[key]["workoutExercises"]['chooseprogram']
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// const scroll = document.querySelectorAll(".label-area");
// scroll.forEach(el => el.addEventListener("click",scrollMonth));

heading.textContent = headingVal||date;

//redirect to home page
redirectHome.addEventListener("click" , home);

exerciseDetails.lastElementChild.addEventListener("click", ()=>{
    exerciseDisplay.style.display = "flex";
    exerciseDetails.style.display = "none";
    logDetails.replaceChildren();
    fillShapeColor(exerciseData); 
})

const extractData = () => {
  const exerciseDataValues = Object.values(exerciseData).flat();
  let ar = [];
  exerciseDataValues.filter(([k,v])=>k==="targets").flatMap(([k,v])=> v ).forEach(v => !ar.includes(v)? ar.push(v) : "") ;
  const targets = ar.join(", ");
  const sets = exerciseDataValues.filter(([k,v])=>k.includes("setnum")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const reps = exerciseDataValues.filter(([k,v])=>k.includes("reps")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const vol = exerciseDataValues.filter(([k,v])=>k.includes("vol")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const max = Math.max(...exerciseDataValues.filter(([k,v])=>k.includes("weight")).flatMap(([k,v])=> parseFloat(v)));
  return [targets,duration,vol,intensity,fatigue,sets,reps,max];
}

const handleClick = (event) => {
    debugger
    const elem = event.target;
    const id = elem.id;
    const currExercise = exerciseData[id];
    titleElem.textContent = id.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase());
    exerciseDetails.style.display = "flex";
    exerciseDisplay.style.display= "none" 
    targets.textContent = currExercise.filter(([k,v]) => k==="targets").flat()[1].join(", ")
    const row = document.createElement("div");
    row.className = "row"
    const labelEl = document.createElement("label")
    const output = document.createElement("output");
    output.className = "output"
    const dataArray = currExercise.filter(([k,v]) => k.includes("setnum")||k.includes("reps")||k.includes("weight"))
    let len =  dataArray.length/3;
    addlabels(labelEl,row);
    displayDetails(len,output,row,currExercise);
    fillSummary(id);
    fillShapeColor([currExercise],true)
    calendarArea.firstElementChild.children[1].remove();
    calendarArea.lastElementChild.remove();
    createCalendar(date); 
} 

const dynamicDisplay = (exerciseName) => {
    const data = exerciseData[exerciseName];
    const volume = data.find(([k,v])=> k==="vol")[1];
    const container = document.createElement("div");
    const label = document.createElement("p");
    // container.append(label);
    container.id = exerciseName;
    container.textContent = exerciseName.replaceAll("_"," ");
    container.style.width = `${volume/50}vh`;
    container.style.height = `${volume/50}vh`;
    container.setAttribute("dataVol" , volume);
    container.style.backgroundColor = `rgb(${volume/10}% ${100-volume/10}% 0)`
    container.addEventListener("click", handleClick);
    exerciseDisplay.append(container)
}

Object.keys(exerciseData).forEach(key => dynamicDisplay(key))
snapshotContainer.childNodes.forEach((el,i) => el.firstElementChild.textContent = extractData()[i+1] )
let svgcode = document.createElement("script");
defaultScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", () => {
    const {frontsvg, backsvg} =  humanFigure();
    svgContainer.append(frontsvg,backsvg)
    fillShapeColor(exerciseData);
})
createCalendar(date);


function durationCalc(date){
    const startMS = new Date(date + " "+finalLog[key]["workoutStartTime"]).getTime();
    const endMS = new Date(date + " "+finalLog[key]["workoutEndTime"]).getTime();
    return Math.round((endMS-startMS)/(60*60*1000));
}
function addlabels(el,outerEl){
    let labels = ["Sets", "Reps", "Load", "Rest", "TUT", "RIR"];
    let labelsRow = outerEl.cloneNode(true);
    labels.forEach(label => {
        let clone = el.cloneNode(true); 
        clone.textContent = label;
        labelsRow.append(clone);
    })
    logDetails.append(labelsRow);
}
function displayDetails(n,el,outerEl,inputArray){
    for (let i=0; i<n; i++){
        let clone = outerEl.cloneNode(true);
        clone.id = i;
        inputArray.filter(([k,v])=> k.includes(i)).flatMap(([k,v])=> v).forEach(val => {
            let cloneOutput = el.cloneNode(true);
            val = val.includes("Min")? val.replace("Min","") : val.includes("TUT") ? "-" : val;
            cloneOutput.value = val;
            clone.append(cloneOutput)
        })
        logDetails.append(clone);
    }
}
function fillSummary(exercise){
    const dataArray = exerciseData[exercise];
    summaryArea[0].children[0].children[0].textContent = dataArray.filter(([k,v])=> k.includes("rest")).map(([k,v])=>parseFloat(v.replace("Min",""))).reduce((a,b)=>(a+b)/2);
    summaryArea[0].children[1].children[0].textContent = Math.max(...dataArray.filter(([k,v])=> k.includes("weight")).map(([k,v])=>parseFloat(v)));
    summaryArea[0].children[2].children[0].textContent = dataArray.filter(([k,v])=> k.includes("rir")).map(([k,v])=>parseFloat(v)||parseFloat(v.replaceAll(/\w/g,""))||0).reduce((a,b)=>(a+b)/2)||"-";
    summaryArea[0].children[3].children[0].textContent = dataArray.filter(([k,v])=> k.includes("tut")).map(([k,v])=>parseFloat(v)||parseFloat(v.replaceAll(/\w/g,""))||0).reduce((a,b)=>(a+b)/2)||"-";
    summaryArea[1].children[0].children[0].textContent = dataArray.filter(([k,v])=> k.includes("setnum")).map(([k,v])=>parseFloat(v)).length||"-";
    summaryArea[1].children[1].children[0].textContent = dataArray.filter(([k,v])=> k.includes("reps")).map(([k,v])=>parseFloat(v)).reduce((a,b)=>(a+b))||"-";
    summaryArea[1].children[2].children[0].textContent = getVolume(arr => arr.flatMap(([a,b]) => [a*b]).reduce((a,b)=>a+b), dataArray.filter(([k,v])=> k.includes("reps")).map(([k,v])=>parseFloat(v)))(dataArray.filter(([k,v])=> k.includes("weight")).map(([k,v])=>parseFloat(v)));
    const lastVolume = pastVol(exercise,date,"vol")?.reverse()[0][1];
    let progress = !lastVolume ? "↗↗↗" : summaryArea[1].children[2].children[0].textContent === lastVolume ? "⬅➡" : summaryArea[1].children[2].children[0].textContent > lastVolume ? "⬆⬆⬆" : "⬇⬇⬇";  
    summaryArea[1].children[3].children[0].textContent = progress;
}
function getVolume(f,reps) {
    return (loads) => {
        let args=[] ;
        for(let i=0;i<loads.length;i++){
            args.push([reps[i],loads[i]]);
        }
        return f.call(this,args)
    }
}
function pastVol(targetMovement,targetDate,targetMetric){
    return pastWorkoutsObject.map(([k,v]) => v).map(({workoutExercises,...v})=>workoutExercises).flatMap(({date,time,chooseprogram,...v})=> Object.keys(v).includes(targetMovement) && date!==targetDate ? [v[targetMovement]]:[])[0]?.filter(([k,v])=> k===targetMetric);
}
function fillShapeColor(object,bool=false){
    if(bool){
        const combinedTargetsArr =  Object.values(exerciseData).flat().filter(([k,v]) => k==="targets").map(([k,v])=> v).flat();
        const targetsMap = new Map();
        combinedTargetsArr.forEach(e => targetsMap.has(e)? targetsMap.set(e,targetsMap.get(e)+1) : targetsMap.set(e,1));
        Array.from(targetsMap).forEach(([k,v])=>{
        const elements = svgContainer.querySelectorAll(`svg [data-name=${k.replace("-","")}]`); 
        elements.forEach(elem => rgbValues(elem,-1))
    })
    }
    const combinedTargetsArr =  Object.values(object).flat().filter(([k,v]) => k==="targets").map(([k,v])=> v).flat();
    const targetsMap = new Map();
    combinedTargetsArr.forEach(e => targetsMap.has(e)? targetsMap.set(e,targetsMap.get(e)+1) : targetsMap.set(e,1));
    Array.from(targetsMap).forEach(([k,v])=>{
        const elements = svgContainer.querySelectorAll(`svg [data-name=${k.replace("-","")}]`); 
        elements.forEach(elem => rgbValues(elem,v))
    })
}

function createCalendar(d){
    const _date = new Date(d);
    const label = document.createElement("label");
    label.textContent = months[_date.getMonth()] ;
    calendarArea.firstElementChild.firstElementChild.after(label);
    const calendarBody = document.createElement("div");
    calendarBody.className = "calendar-body"
    const dateBody = document.createElement("span");
    dateBody.className = "date-body"
    const frag = document.createDocumentFragment();
    let len = _date.getMonth()+1 === new Date(new Date(_date).getTime()+(31-new Date(_date).getDate())*24*60*60*1000).getMonth()+1 ? 31 : 30;
    const workoutDates = exerciseDisplay.style.display !== "none" ? monthlyWorkoutDates() : monthlyExerciseDates(); 
    for (i=1;i<=len;i++){
        let clone = dateBody.cloneNode(true);
        clone.textContent = i
        workoutDates.includes(i)? clone.style.backgroundColor = "grey" : "";
        frag.append(clone);
    }
    calendarBody.append(frag);
    calendarArea.firstElementChild.after(calendarBody);
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
    let monthnum = months.findIndex(m => m===calendarArea.firstElementChild.children[1].textContent);
    return pastWorkoutsObject.flatMap(([k,{workoutName, ...v}])=> { 
        let d = new Date(k);
        return d.getMonth() === monthnum && workoutName === headingVal ? [d.getDate()] : [] ;
    })
}
function monthlyExerciseDates(){
    let monthnum = months.findIndex(m => m===calendarArea.firstElementChild.children[1].textContent);
    return pastWorkoutsObject.flatMap(([k,{workoutExercises, ...v}])=> { 
        let d = new Date(k);
        return d.getMonth() === monthnum && Object.keys(workoutExercises).includes("push_up_standard") ? [d.getDate()] : [] ;
    })
}
function rgbValues(el,count){
    switch(true) {
        case count>10:{
            el.setAttribute("fill",`rgb(100%, 0%, 0%)`);
            break;
        };
        case count>6&&count<=9: {
            el.setAttribute("fill",`rgb(100%, 25%, 25%)`)
            break;
        };
        case count>3&&count<=6: {
            el.setAttribute("fill",`rgb(100%, 75%, 50%)`)
            break;
        };
        case count>0&&count<=3: {
            el.setAttribute("fill",`rgb(75%, 100%, 100%)`)
            break;
        };
        default : {
            el.setAttribute("fill",`rgb(50%, 50%, 50%)`)
            break;
        }       

    }
}

function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}