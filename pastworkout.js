// Was document.getElementById("pastWorkoutJS") -- functions.js now injects
// this script dynamically (see PAGE_SCRIPTS there) with no fixed id.
const defaultScript = document.currentScript;
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
const deleteWorkoutBtn = document.getElementById("deleteworkout");
const changeDateBtn = document.getElementById("changedate");
const editSystemicFatigueBtn = document.getElementById("editsystemicfatigue");
const redirectHome = document.querySelector("#header > h1");
const pastWorkoutsObject = (window.workoutLogData||[]).sort((a,b)=>new Date(a[0])-new Date(b[0]));
const finalLog = Object.fromEntries(JSON.parse(sessionStorage.finalLog));
const key = Object.keys(finalLog)[0];
const date = new Date(key).toLocaleDateString();
const intensity = finalLog[key]["workoutIntensity"];
const fatigue = "";
const headingVal = finalLog[key]["workoutName"];
const duration = durationCalc(date);
const savedSettingsFallback = '{"bweight":"0 kgs","dweight":"0 kgs"}';
const dWt = JSON.parse(localStorage.savedSettings||savedSettingsFallback)["dweight"].split(" ")[0]*1;
const bWt = JSON.parse(localStorage.savedSettings||savedSettingsFallback)["bweight"].split(" ")[0]*1;
let exerciseData = finalLog[key]["workoutExercises"];
const totalVol = Object.values(finalLog[key]["workoutExercises"]).flat().filter(([k,v])=> k === "vol").map(([k,v])=>v).reduce((a,b)=>a+b);
delete finalLog[key]["workoutExercises"]['chooseprogram']
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const propNames = ["setnum","reps","repMultiple","weight","wtMultiple","rest","tut","rir"];
let targetExercise;
// const scroll = document.querySelectorAll(".label-area");
// scroll.forEach(el => el.addEventListener("click",scrollMonth));

heading.textContent = headingVal||date;

//redirect to home page
redirectHome.addEventListener("click" , home);

//delete this workout
deleteWorkoutBtn.addEventListener("click", handleDeleteOperation);

//change this workout's date
changeDateBtn.addEventListener("click", handleDateChange);

//rate/edit this workout's systemic fatigue
editSystemicFatigueBtn.addEventListener("click", handleSystemicFatigueEdit);

exerciseDetails.lastElementChild.addEventListener("click", ()=>{
    exerciseDisplay.style.display = "flex";
    exerciseDetails.style.display = "none";
    logDetails.replaceChildren();
    fillShapeColor(exerciseData);
    calendarArea.firstElementChild.children[1].remove();
    calendarArea.lastElementChild.remove();
    createCalendar(date); 
})

const extractData = () => {
  const exerciseDataValues = Object.values(exerciseData).flat();
  let ar = [];
  exerciseDataValues.filter(([k,v])=>k==="targets").flatMap(([k,v])=> v ).forEach(v => !ar.includes(v)? ar.push(v) : "") ;
  const duration = (new Date(date + ", "+ finalLog[key]["workoutEndTime"]) - new Date(date + ", "+ finalLog[key]["workoutStartTime"]))/(60*1000);
  const intensity = finalLog[key]["workoutIntensity"];
  const fatigue = Object.keys(exerciseData).map(e => exerciseDB()[e]["fatigue"]).reduce((a,b) => a+b);
  const targets = ar.join(", ");
  const sets = exerciseDataValues.filter(([k,v])=>k.includes("setnum")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const reps = exerciseDataValues.filter(([k,v])=>k.includes("reps")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const vol = exerciseDataValues.filter(([k,v])=>k.includes("vol")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const max = Math.max(...exerciseDataValues.filter(([k,v])=>k.includes("weight")).flatMap(([k,v])=> parseFloat(v)));
  return [targets,duration,vol,intensity,fatigue,sets,reps,max];
}

const handleClick = (event) => {
    const elem = event.target;
    const id = elem.id;
    const currExercise = exerciseData[id];
    targetExercise = id;
    titleElem.textContent = id.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase());
    exerciseDetails.style.display = "flex";
    exerciseDisplay.style.display= "none" 
    targets.textContent = currExercise.filter(([k,v]) => k==="targets").flat()[1].join(", ")
    const row = document.createElement("div");
    row.className = "row"
    const labelEl = document.createElement("label")
    const output = document.createElement("output");
    output.className = "output"
    let len =  currExercise.find(([k,v]) => k.includes("setCount"))[1]*1;
    addlabels(labelEl,row);
    displayDetails(len,output,row,currExercise);
    fillSummary(currExercise,id);
    fillShapeColor([currExercise],true)
    calendarArea.firstElementChild.children[1].remove();
    calendarArea.lastElementChild.remove();
    createCalendar(date); 
} 

// Each exercise gets its own color rather than a shared meaning (category,
// volume) -- a fixed varied palette, picked by a stable hash of the
// exercise's name so the same exercise always gets the same color across
// different views, without needing every exercise ever seen enumerated
// up front the way a lookup table would.
const BUBBLE_PALETTE = ["#4E79A7","#F28E2B","#E15759","#76B7B2","#59A14F","#EDC948","#B07AA1","#FF9DA7","#9C755F","#BAB0AC","#D37295","#86BCB6"];
function hashColor(str){
    let hash = 0;
    for (let i=0; i<str.length; i++){ hash = (hash*31 + str.charCodeAt(i)) | 0; }
    return BUBBLE_PALETTE[Math.abs(hash) % BUBBLE_PALETTE.length];
}

// Greedy spiral-placement bubble packing -- not a true physics/force
// layout, but gives an organic scattered arrangement with no overlaps
// instead of the old flex-wrap row of same-line, edge-to-edge circles.
// Biggest first so it anchors the center and smaller ones fill the gaps
// around it, the classic bubble-chart look.
function packBubbles(items){
    const gap = 1;
    const placed = [];
    items.forEach((item, i) => {
        if (i === 0){ item.x = 0; item.y = 0; placed.push(item); return; }
        let angle = Math.random() * Math.PI * 2;
        let radius = 0;
        let x = 0, y = 0, tries = 0;
        while (true){
            x = radius * Math.cos(angle);
            y = radius * Math.sin(angle);
            const overlaps = placed.some(p => Math.hypot(p.x - x, p.y - y) < (p.radius + item.radius + gap));
            if (!overlaps || tries > 3000) break;
            angle += 0.35;
            radius += 2.5;
            tries++;
        }
        item.x = x; item.y = y;
        placed.push(item);
    });
    return items;
}

function renderExerciseBubbles(){
    const containerWidth = exerciseDisplay.clientWidth || exerciseDisplay.parentElement.clientWidth || 300;
    const names = Object.keys(exerciseData);
    const volumes = names.map(name => exerciseData[name].find(([k,v])=> k==="vol")[1]);
    const minVol = Math.min(...volumes), maxVol = Math.max(...volumes);
    // Diameter proportional to sqrt(volume) -- not volume directly -- so
    // AREA (what the eye actually reads as "bigger") encodes volume, the
    // standard bubble-chart convention. Min/max normalized against this
    // workout's own actual volume range rather than a fixed constant, so
    // it looks reasonable regardless of whether volumes run in the tens
    // or the thousands.
    const minR = containerWidth * 0.07, maxR = containerWidth * 0.15;
    let items = names.map((name,i) => {
        const volume = volumes[i];
        const t = maxVol === minVol ? 1 : (volume - minVol) / (maxVol - minVol);
        return { name, volume, isFiller: false, color: hashColor(name), radius: minR + (maxR - minR) * Math.sqrt(t) };
    });
    items.sort((a,b) => b.volume - a.volume);

    // Small, unlabeled, non-interactive decorative circles packed into
    // whatever gaps are left around the real exercise bubbles -- placed
    // after them (packBubbles never backtracks earlier bubbles once set),
    // purely for visual density/depth, the way a real bubble chart is
    // usually surrounded by many small low-value points along with the
    // few big labeled ones.
    const fillerCount = 18;
    const fillers = new Array(fillerCount).fill(0).map(() => ({
        name: null, isFiller: true,
        color: BUBBLE_PALETTE[Math.floor(Math.random()*BUBBLE_PALETTE.length)],
        radius: 3 + Math.random()*6,
    }));
    items = packBubbles(items.concat(fillers));

    // Packing above is unconstrained (grows outward from the origin with
    // no width limit) -- if the result is wider than the box actually has
    // room for, scale everything (positions AND radii together) down to
    // fit. Uniform scaling keeps every bubble's size relative to the
    // others intact, just at a smaller absolute size, so it still encodes
    // volume correctly.
    const padding = 8;
    const rawWidth = Math.max(...items.map(it => it.x + it.radius)) - Math.min(...items.map(it => it.x - it.radius)) + padding*2;
    const maxWidth = containerWidth - 2;
    if (rawWidth > maxWidth){
        const scale = maxWidth / rawWidth;
        items.forEach(it => { it.x *= scale; it.y *= scale; it.radius *= scale; });
    }

    const minLeft = Math.min(...items.map(it => it.x - it.radius));
    const minTop = Math.min(...items.map(it => it.y - it.radius));
    const maxRight = Math.max(...items.map(it => it.x + it.radius));
    const maxBottom = Math.max(...items.map(it => it.y + it.radius));
    // Was anchored flush to the left (offset only ever undid the packing's
    // own bounding box, never centered it within the container's actual
    // width) -- this splits whatever width is left over evenly on both
    // sides instead.
    const extraX = Math.max(0, (containerWidth - padding*2) - (maxRight - minLeft)) / 2;

    // Children are absolutely positioned, so the container no longer
    // auto-sizes to fit them the way height:fit-content did before --
    // this sets it explicitly to the packed bubbles' actual extent.
    exerciseDisplay.style.height = `${maxBottom - minTop + padding*2}px`;
    items.forEach(it => {
        const container = document.createElement("div");
        const diameter = it.radius * 2;
        container.style.width = `${diameter}px`;
        container.style.height = `${diameter}px`;
        container.style.left = `${it.x - it.radius - minLeft + padding + extraX}px`;
        container.style.top = `${it.y - it.radius - minTop + padding}px`;
        container.style.backgroundColor = it.color;
        if (it.isFiller){
            exerciseDisplay.append(container);
            return;
        }
        container.id = it.name;
        container.setAttribute("dataVol", it.volume);
        // Below this radius there's no room for legible text (the
        // reference bubble charts this was modeled on leave their
        // smallest bubbles as plain color dots rather than force-fitting
        // a label) -- matches the smallest bubbles now being unlabeled
        // dots rather than illegible or overflowing text.
        if (it.radius >= 20){
            const label = document.createElement("span");
            // Same capitalization pattern as handleClick's title above.
            label.textContent = it.name.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase());
            container.style.fontSize = `${Math.max(7, Math.min(15, it.radius*0.19))}px`;
            container.append(label);
        }
        container.addEventListener("click", handleClick);
        exerciseDisplay.append(container);
    });
}

renderExerciseBubbles();
snapshotContainer.childNodes.forEach((el,i) => el.firstElementChild.textContent = extractData()[i+1] )
// A stored field, not a derived stat like the rest of extractData()'s
// output above -- "" (unrated, see logworkout.js) deliberately falls
// through the || since it isn't a real rating yet.
snapshotContainer.lastElementChild.lastElementChild.textContent = finalLog[key]["workoutSystemicFatigue"] || "Not rated";
let svgcode = document.createElement("script");
defaultScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", async() => {
    const {frontView,backView} =  await muscularManSvg();
    svgContainer.append(frontView,backView)
    fillShapeColor(exerciseData);
})
createCalendar(date);


function durationCalc(date){
    const startMS = new Date(date + " "+finalLog[key]["workoutStartTime"]).getTime();
    const endMS = new Date(date + " "+finalLog[key]["workoutEndTime"]).getTime();
    return Math.round((endMS-startMS)/(60*60*1000));
}
function addlabels(el,outerEl){
    let labels = ["Sets", "Reps", "xR", "Load","xW", "Rest", "TUT", "RIR"];
    let labelsRow = outerEl.cloneNode(true);
    labels.forEach((label,i) => {
        let clone = el.cloneNode(true); 
        clone.textContent = label;
        labelsRow.append(clone);
    })
    logDetails.append(labelsRow);
}
function displayDetails(n,el,outerEl,inputArray){
    let copyArr = inputArray
    copyArr = copyArr.some(arr => arr[0]==="repMultiple") ? copyArr : copyArr.concat([["repMultiple","1"]]);
    copyArr = copyArr.some(arr => arr[0]==="wtMultiple") ? copyArr : copyArr.concat([["wtMultiple","1"]]);   
    let start = inputArray[1][0][6]*1;  
    for (let i=start; i<n+start; i++){
        let clone = outerEl.cloneNode(true);
        clone.id = i;
        sortedArr = copyArr.filter(([key,v])=> key.includes(i) || key.includes("Multiple")).sort((a,b) => {let i = propNames.findIndex(e => a[0].includes(e)) ; let j = propNames.findIndex(e => b[0].includes(e)); return i-j} );
        // debugger
        sortedArr.forEach((arr,k) => {
            let val = arr[1];
            let cloneOutput = el.cloneNode(true);
            cloneOutput.id = arr[0];
            if (k!==0){cloneOutput.addEventListener("touchend",handleEditData)}
            val = val.includes("Min")? val.replace("Min","") : val.includes("TUT") ? "-" : val;
            cloneOutput.value = val;
            clone.append(cloneOutput)
        })
        logDetails.append(clone);
    }
}
function fillSummary(dataArray,exercise){
    summaryArea[0].children[0].children[0].textContent = dataArray.filter(([k,v])=> k.includes("rest")).map(([k,v])=>parseFloat(v.replace("Min",""))).reduce((a,b)=>(a+b)/2);
    summaryArea[0].children[1].children[0].textContent = Math.max(...dataArray.filter(([k,v])=> k.includes("weight")).map(([k,v])=>parseFloat(v)));
    summaryArea[0].children[2].children[0].textContent = dataArray.filter(([k,v])=> k.includes("rir")).map(([k,v])=>parseFloat(v)||parseFloat(v.replaceAll(/\w/g,""))||0).reduce((a,b)=>(a+b)/2)||"-";
    summaryArea[0].children[3].children[0].textContent = dataArray.filter(([k,v])=> k.includes("tut")).map(([k,v])=>parseFloat(v)||parseFloat(v.replaceAll(/\w/g,""))||0).reduce((a,b)=>(a+b)/2)||"-";
    summaryArea[1].children[0].children[0].textContent = dataArray.find(([k,v])=> k.includes("setCount"))[1]||"-";
    summaryArea[1].children[1].children[0].textContent = dataArray.find(([k,v])=> k.includes("repCount"))[1]||"-";
    summaryArea[1].children[2].children[0].textContent = dataArray.find(([k,v])=> k.includes("vol"))[1]||"-";;
    // summaryArea[1].children[1].children[0].textContent = dataArray.filter(([k,v])=> k.includes("reps")).map(([k,v])=>parseFloat(v)).reduce((a,b)=>(a+b))||"-";
    // summaryArea[1].children[2].children[0].textContent = getVolume(arr => arr.flatMap(([a,b]) => [a*b]).reduce((a,b)=>a+b), dataArray.filter(([k,v])=> k.includes("reps")).map(([k,v])=>parseFloat(v)))(dataArray.filter(([k,v])=> k.includes("weight")).map(([k,v])=>parseFloat(v)));
    const lastVolume = findProgress(exercise,date,"vol");
    let progress = !lastVolume ? "↗↗↗" : summaryArea[1].children[2].children[0].textContent*1 === lastVolume ? "⬅➡" : summaryArea[1].children[2].children[0].textContent*1 > lastVolume ? "⬆⬆⬆" : "⬇⬇⬇";  
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
function findProgress(targetMovement,targetDate,targetMetric){
    let targetWorkouts = pastWorkoutsObject.filter(([k,v])=>v["workoutExercises"].hasOwnProperty(targetMovement) && k.split(",")[0]!==targetDate);
    let lastItem = targetWorkouts?.[targetWorkouts.length-2];
    return lastItem ? lastItem[1]["workoutExercises"][targetMovement].find(([k,v])=>k===targetMetric)[1] : "";
}
function fillShapeColor(object,bool=false){
    let combinedTargetsArr ;
    let volumes;
    if(bool){
        combinedTargetsArr =  Object.values(exerciseData).flat().filter(([k,v]) => k==="targets").map(([k,v])=> v).flat();
        volumes = Object.values(exerciseData).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]);
    }else{
        combinedTargetsArr =  Object.values(object).flat().filter(([k,v]) => k==="targets").map(([k,v])=> v).flat();
        volumes = Object.values(object).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]);
    }
    const movers = Object.values(object).map(arr => arr[0][1]);
    const totalVol = volumes.reduce((a,b)=> a+b,0);
    const targetsMap = new Map();
    combinedTargetsArr.forEach(e => {if(e==="traps"||e==="rhomboids"){e="traps/rhomboids"} ; targetsMap.set(e.replace("-",""),0)});
    movers.forEach(([primary, secondary, tertiary, quaternary, quinary],i) => { 
        if (primary) {primary = primary.replace("-",""); if(primary==="traps"||primary==="rhomboids"){primary="traps/rhomboids"} };
        if (secondary) {secondary = secondary.replace("-",""); if(secondary==="traps"||secondary==="rhomboids"){secondary="traps/rhomboids"} };
        if (tertiary) {tertiary = tertiary.replace("-",""); if(tertiary==="traps"||tertiary==="rhomboids"){tertiary="traps/rhomboids"} };
        if (quaternary) {quaternary = quaternary.replace("-",""); if(quaternary==="traps"||quaternary==="rhomboids"){quaternary="traps/rhomboids"} };
        if (quinary) {quinary = quinary.replace("-",""); if(quinary==="traps"||quinary==="rhomboids"){quinary="traps/rhomboids"} };
        targetsMap.has(primary)? targetsMap.set(primary,Math.round(targetsMap.get(primary)+(0.65*volumes[i]*100)/totalVol)) : "";
        targetsMap.has(secondary)? targetsMap.set(secondary,Math.round(targetsMap.get(secondary)+(0.25*volumes[i]*100)/totalVol)) : "";
        targetsMap.has(tertiary)? targetsMap.set(tertiary,Math.round(targetsMap.get(tertiary)+(0.10*volumes[i]*100)/totalVol)) : "";
        targetsMap.has(quaternary)? targetsMap.set(quaternary,Math.round(targetsMap.get(quaternary)+(0.05*volumes[i]*100)/totalVol)) : "";
        targetsMap.has(quinary)? targetsMap.set(quinary,Math.round(targetsMap.get(quinary)+(0.05*volumes[i]*100)/totalVol)) : "";
    });
    targetsMap.entries().forEach(([key, val])=> {
        let elemArr = document.querySelectorAll(`svg [data-name='${key}']`) ;
        elemArr.forEach(elem => rgbValues(elem,val));
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
        return d.getMonth() === monthnum && Object.keys(workoutExercises).includes(nameToId(titleElem.textContent)) ? [d.getDate()] : [] ;
    })
}

// Validated ordinal red ramp (dataviz skill: single hue, monotone
// lightness, checked against the app's actual dark background) for the
// 5 real fatigue tiers, plus the artwork's own baked-in resting pair
// (frontsvg.js/backsvg.js ship muscles as hsl(274,3%,56%)/#222 -- #8f8b92
// is that same color, so "no data" restores the diagram to how it looks
// before any highlighting is applied, rather than an approximate gray).
function rgbValues(el,vol){
    switch(true) {
        case vol>100:{
            el.setAttribute("fill","#c62a1c");
            el.setAttribute("stroke","#c62a1c");
            break;
        };
        case vol>70&&vol<=100: {
            el.setAttribute("fill","#d1543b");
            el.setAttribute("stroke","#d1543b");
            break;
        };
        case vol>40&&vol<=70: {
            el.setAttribute("fill","#dc7a63");
            el.setAttribute("stroke","#dc7a63");
            break;
        };
        case vol>20&&vol<=40: {
            el.setAttribute("fill","#e79a8b");
            el.setAttribute("stroke","#e79a8b");
            break;
        };
        case vol>0&&vol<=20: {
            el.setAttribute("fill","#f6c2ba");
            el.setAttribute("stroke","#f6c2ba");
            break;
        };
        default: {
            el.setAttribute("fill","#8f8b92");
            el.setAttribute("stroke","#222");
            break;
        }

    }
}

function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}

async function handleDeleteOperation(){
    // No restore path here (unlike handleDateChange below) -- this deletes
    // and navigates away immediately, so there's nothing to stash.
    let newHistory = pastWorkoutsObject.filter(([k,v])=>k!==key);
    await window.LoggerDB.saveWorkoutLog(newHistory);
    document.location = "./history.html";
}

async function handleDateChange(){
    let modalEl = document.createElement("dialog");
    let closeBtn = document.createElement("span");
    let datepicker = document.createElement("input");
    let durationEl = document.createElement("input");
    let submit = document.createElement("input");
    let program = document.createElement("input");
    closeBtn.className = "modal-close";
    closeBtn.textContent = "❌";
    program.type = "text";
    program.value = headingVal;
    submit.type = "submit";
    submit.textContent = "Done";
    durationEl.type = "number";
    durationEl.placeholder = "Enter duration (min)";
    durationEl.id = "duration";
    datepicker.type = "datetime-local";
    datepicker.id = "newKey"
    modalEl.append(closeBtn, program, datepicker,durationEl,submit);
    modalEl.className = "changesmodal";
    modalEl.style.marginTop = "40vh";
    let newHistory = pastWorkoutsObject.filter(([k,v])=>k!==key);
    // Same-session-only undo stash -- never needs to survive a reload, so
    // this is just a plain variable now instead of a localStorage.templog
    // round-trip. Closing via the X instead of submitting restores it, or
    // the workout would just be gone with no way to complete or cancel.
    const stashedLog = pastWorkoutsObject;
    await window.LoggerDB.saveWorkoutLog(newHistory);
    closeBtn.addEventListener("click", async () => {
        await window.LoggerDB.saveWorkoutLog(stashedLog);
        modalEl.close();
        modalEl.remove();
    });
    submit.addEventListener("click", async (e) => {
        let el2 = e.target.previousElementSibling;
        let el1 = el2.previousElementSibling;
        let el0 = el1.previousElementSibling;
        let thisWorkout = pastWorkoutsObject.filter(([k,v])=>k===key);
        if (el1.value && el2.value) {
            thisWorkout[0][0] = new Date(el1.value).toLocaleString() ;
            thisWorkout[0][1]["workoutStartTime"] = new Date(el1.value).toLocaleTimeString();
            thisWorkout[0][1]["workoutEndTime"] = new Date(new Date(el1.value).getTime()+60*el2.value*1000).toLocaleTimeString();
            thisWorkout[0][1]["workoutDate"] = new Date(el1.value).toDateString();
        }
        thisWorkout[0][1]["workoutName"] = el0.value ;
        let bool = pastWorkoutsObject.some(([k,v]) => new Date(k).toDateString() === thisWorkout[0][0]);
        if (!bool){
            let newlog = (window.workoutLogData||[]).concat(thisWorkout);
            await window.LoggerDB.saveWorkoutLog(newlog);
        }
        else{
            alert("A workout already exists on selected date. Please select another date to proceed");
            return;
        }
        modalEl.close();
        document.location = "./history.html";
    })
    document.body.append(modalEl);
    modalEl.show();
}

function handleSystemicFatigueEdit(){
    const modalEl = document.createElement("dialog");
    modalEl.className = "systemicfatiguemodal";
    const closeBtn = document.createElement("span");
    closeBtn.className = "modal-close";
    closeBtn.textContent = "❌";
    closeBtn.addEventListener("click", () => {
        modalEl.close();
        modalEl.remove();
    });
    const input = document.createElement("input");
    input.type = "range";
    input.min = 0; input.max = 10; input.step = 1;
    input.value = finalLog[key]["workoutSystemicFatigue"] || 0;
    input.className = "gradient-range";
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "Done";
    doneBtn.addEventListener("click", async () => {
        finalLog[key]["workoutSystemicFatigue"] = input.value;
        sessionStorage.finalLog = JSON.stringify(Object.entries(finalLog));
        const updatedLog = pastWorkoutsObject.map(arr => arr[0] === key ? [arr[0], finalLog[key]] : arr);
        await window.LoggerDB.saveWorkoutLog(updatedLog);
        snapshotContainer.lastElementChild.lastElementChild.textContent = input.value;
        modalEl.close();
        modalEl.remove();
    });
    modalEl.append(closeBtn, input, doneBtn);
    document.body.append(modalEl);
    modalEl.showModal();
}

function handleEditData(e){
    e.stopPropagation();
    let modalEl = document.createElement("dialog");
    let doneBtn = document.createElement("button");
    let input = document.createElement("input");
    input.type = "number";
    // Was never pre-filled -- an untouched number input's value is "",
    // so pressing Done without actually typing a new number wrote "" over
    // the cell's real value instead of leaving it alone. Strips a
    // trailing unit suffix (e.g. displayed TUT values like "40Sec") since
    // type="number" rejects any non-numeric value and would otherwise
    // just show blank again.
    input.value = parseFloat(e.target.value.toString().replace(/[^\d.]/g,"")) || "";
    doneBtn.textContent = "Done";
    doneBtn.addEventListener("touchend", async ()=>{
        if(e.target.id.includes("Multiple")) {
            document.querySelectorAll(`#${e.target.id}`).forEach(el => el.value = input.value)
        }
        else{
            e.target.value = input.value;
        }
        let val = e.target.id.includes("rir") ? (e.target.value*1).toFixed(1)+"Min" : e.target.id.includes("tut") ? (e.target.value*1).toFixed(1)+"Sec" : e.target.value ;  
        let dataArray = exerciseData[targetExercise].map(([k,v])=>[k, k===e.target.id ? v = val : v]);
        // displayDetails() adds these two as a fallback when building the
        // on-screen rows, but only to its own local copy -- the real
        // exerciseData[targetExercise] this reads from never actually
        // gets them. Any exercise without repMultiple/wtMultiple already
        // set (CSV-imported workouts, in particular: workout-import-log.csv
        // has no such columns) hit dataArray.find(...)[1] below on
        // `undefined`, crashing every edit. Same fallback, applied where
        // it actually needs to stick.
        dataArray = dataArray.some(([k])=>k==="repMultiple") ? dataArray : dataArray.concat([["repMultiple","1"]]);
        dataArray = dataArray.some(([k])=>k==="wtMultiple") ? dataArray : dataArray.concat([["wtMultiple","1"]]);
        if(e.target.id.includes("weight") || e.target.id.includes("reps") || e.target.id.includes("Multiple")){
            let eqwt = targetExercise.includes("dumbbell") ? dWt : targetExercise.includes("barbell") ? bWt : 0;  
            let rx = dataArray.find(arr => arr[0]==="repMultiple")[1]*1;
            let wx = dataArray.find(arr => arr[0]==="wtMultiple")[1]*1
            let repsValArr = dataArray.filter(([k,v])=> k.includes("reps")).map(arr => arr[1]*rx)
            let totalReps = repsValArr.reduce((a,b)=>a*1+b*1);
            let weightValArr = dataArray.filter(([k,v])=> k.includes("weight")).map(arr => (arr[1]*1+eqwt)*wx)
            let totalLoad = weightValArr.reduce((a,b)=>a*1+b*1);
            let volTotal = repsValArr.crossMult(weightValArr);
            dataArray = dataArray.map(arr => [arr[0], arr[0]==="repCount" ? arr[1] = totalReps : arr[0]==="load" ? arr[1] = totalLoad : arr[0]==="vol" ? arr[1] = volTotal : arr[1]]);
        }
        if(e.target.id.includes("rir") || e.target.id.includes("tut") || e.target.id.includes("rest") ){
            let totalRIR = dataArray.filter(([k,v])=> k.includes("rir")).flatMap(arr => {let val = arr[1]; return val === "-" ? [0] : val*1 ? [val*1] : []}).reduce((a,b)=>(a*1+b*1)/2);
            let totalTUT = dataArray.filter(([k,v])=> k.includes("tut")).flatMap(arr => {let val = arr[1].replace("Sec",""); return val = val==="-" ? [0] : val*1 ? [val*1] : []}).reduce((a,b)=>(a*1+b*1)/2);
            let totalRest = dataArray.filter(([k,v])=> k.includes("rest")).flatMap(arr => {let val = arr[1].replace("Min",""); return val = val==="-" ? [0] : val*1 ? [val*1] : []}).reduce((a,b)=>(a*1+b*1)/2);
            // Was missing the [arr[0], ...] wrapper the identical map above
            // (repCount/load/vol) has -- this returned bare values instead
            // of [key,value] tuples, so dataArray stopped being an array of
            // pairs. Every later ([k,v]) destructure over this exercise's
            // data (including on the next page load, e.g. the top-level
            // "vol" totalVol calc) then tried to destructure a plain
            // number/string and threw "X is not iterable".
            dataArray = dataArray.map(arr => [arr[0], arr[0]==="meanRIR" ? arr[1] = totalRIR : arr[0]==="meanTUT" ? arr[1] = totalTUT : arr[0]==="meanRest" ? arr[1] = totalRest : arr[1]]);
        }
        finalLog[key]["workoutExercises"][targetExercise] = dataArray;
        sessionStorage.finalLog = JSON.stringify(Object.entries(finalLog));
        let updatedLog = pastWorkoutsObject.map(arr=> arr[0] === key ? [arr[0],arr[1] = finalLog[key]] : arr);
        await window.LoggerDB.saveWorkoutLog(updatedLog);
        modalEl.close();
    })
    modalEl.append(input,doneBtn);
    document.body.append(modalEl);
    modalEl.showModal();
}