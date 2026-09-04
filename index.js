// Was document.getElementById("indexJS") -- that only worked while this
// page had a static <script id="indexJS">. functions.js now injects this
// script dynamically (see PAGE_SCRIPTS there) with no fixed id, so this
// needs the standard "whichever script tag is currently running" reference
// instead, which works the same for a dynamically-inserted script.
const indexScript = document.currentScript;
const logWorkout = document.getElementById("logworkout");
const createWorkout = document.getElementById("createworkout");
const svgContainer = document.getElementById("svgcontainer");
const redirectHome = document.querySelector("#header > h1");
const dateElements =  document.querySelectorAll("input[type='date']");
const calendarElem = document.getElementById("calendar");
const loadCalendar = document.getElementById("loadcalendar");
const dayNumContainers = document.querySelectorAll("#schedule > div > #week > span");
const monthlyHighlights = document.getElementById("monthlyhighlights");
const liftHighlights = document.getElementById("lifthighlights");
let dateSorter = Intl.Collator(undefined,{numeric:true}).compare;
let monthlyScroll=0;
let liftsScroll=0;
const dataInterface = new DataInterface();

const date = new Date();
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dayNames = ["Su","M","Tu","W","Th","F","Sa"];
let nameMap =  new Map();
let script = document.createElement("script");
sessionStorage.clear();
const existingTemplates = window.templatesData || {};
if (Object.keys(existingTemplates).length){
    const templates = Object.entries(existingTemplates);
    for (let [program,templateContent] of templates){
        createTemplateItem(program);
    }
}
const pastWorkoutsObject = (window.workoutLogData||[]).sort(dateSorter);
dataInterface.new(Object.fromEntries(pastWorkoutsObject));
const currentMonthWorkouts = dataInterface.byMonth(date.getMonth()+1);
const pastMonthWorkouts = dataInterface.byMonth(date.getMonth());
const twoMonthsBeforeWorkouts = dataInterface.byMonth(date.getMonth()-1);
let dailyWorkoutLog = new Map(); 
//  debugger
// render svg content to the application 
let svgcode = script.cloneNode(true);
indexScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", async () => {
    await muscularManSvg(svgContainer,[-30,-25,200,200]);
    const [frontsvg,backsvg] = [document.getElementById("frontHumanSVG"),document.getElementById("backHumanSVG")];
    // svgContainer.append(frontsvg);
    // svgContainer.append(backsvg);
    [...frontsvg.querySelectorAll("[data-name]")].forEach(el => nameMap.set(el.dataset.name, nameMap.get(el.dataset.name) || 0));
    [...backsvg.querySelectorAll("[data-name]")].forEach(el => nameMap.set(el.dataset.name, nameMap.get(el.dataset.name) || 0));
    let temp = window.workoutLogData||[];
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
    redZones =  calcRZ();
})

// let exerciseDBPage = script.cloneNode(true);
// indexScript.before(exerciseDBPage);
// exerciseDBPage.src = "exercisesDB.js";
// exerciseDBPage.onload = () => {
    
// }

// set past week dates in the schedule section and height of the date display elements 
const compareDates = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getDate() === date2.getDate() && date1.getMonth()+1 === date2.getMonth()+1;
}


// create workout button function
logWorkout.addEventListener("click", ()=>document.location = "./logworkout.html" )
createWorkout.addEventListener("click", ()=>document.location = "./template.html" )
loadCalendar.addEventListener( "click", ()=>{createCalendar(date)},{once:true}) ;
monthlyHighlights.firstElementChild.addEventListener("click",enableScroll)
monthlyHighlights.lastElementChild.addEventListener("click",enableScroll)
liftHighlights.firstElementChild.addEventListener("click",enableScroll)
liftHighlights.lastElementChild.addEventListener("click",enableScroll)
monthlyHighlights.firstElementChild.nextElementSibling.lastElementChild.firstElementChild.textContent = currentMonthWorkouts.length;
monthlyHighlights.firstElementChild.nextElementSibling.lastElementChild.lastElementChild.textContent = pastMonthWorkouts.length;
liftHighlights.firstElementChild.nextElementSibling.lastElementChild.firstElementChild.textContent = findHighlight(currentMonthWorkouts,"bestlifts")?.[0] || "-";
liftHighlights.firstElementChild.nextElementSibling.lastElementChild.lastElementChild.textContent = findHighlight(pastMonthWorkouts,"bestlifts")?.[1] || "-";
function recentWorkouts(object){
    const keys = Array.from(object.keys());
    const dates = keys.filter(key => new Date(key) > new Date(date.getTime() - 7*24*60*60*1000) )
    const recentWorkoutDetails = dates.map(date => object.get(date));
    recentWorkoutDetails.forEach(({workoutExercises,...obj},i) => {
        let dayMultiple = (100-(Math.round((new Date() - new Date(dates[i]))/(24*60*60*1000)))*10)/100;
        const movers = Object.values(workoutExercises).map(arr => arr[0][1]);
        const volumes = Object.values(workoutExercises).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]).map(e => Math.round(e*dayMultiple));
        const totalVol = Math.round(volumes.reduce((a,b)=> a+b,0));
        movers.forEach(([primary, secondary, tertiary, quaternary, quinary],i) => { 
            if (primary) {primary = primary.replace("-",""); if(primary==="traps"||primary==="rhomboids"){primary="traps/rhomboids"} };
            if (secondary) {secondary = secondary.replace("-",""); if(secondary==="traps"||secondary==="rhomboids"){secondary="traps/rhomboids"} };
            if (tertiary) {tertiary = tertiary.replace("-",""); if(tertiary==="traps"||tertiary==="rhomboids"){tertiary="traps/rhomboids"} };
            if (quaternary) {quaternary = quaternary.replace("-",""); if(quaternary==="traps"||quaternary==="rhomboids"){quaternary="traps/rhomboids"} };
            if (quinary) {quinary = quinary.replace("-",""); if(quinary==="traps"||quinary==="rhomboids"){quinary="traps/rhomboids"} };
            nameMap.has(primary)? nameMap.set(primary,Math.round(nameMap.get(primary)+(0.65*volumes[i]*100)/totalVol)) : "";
            nameMap.has(secondary)? nameMap.set(secondary,Math.round(nameMap.get(secondary)+(0.25*volumes[i]*100)/totalVol)) : "";
            nameMap.has(tertiary)? nameMap.set(tertiary,Math.round(nameMap.get(tertiary)+(0.05*volumes[i]*100)/totalVol)) : "";
            nameMap.has(quaternary)? nameMap.set(quaternary,Math.round(nameMap.get(quaternary)+(0.03*volumes[i]*100)/totalVol)) : "";
            nameMap.has(quinary)? nameMap.set(quinary,Math.round(nameMap.get(quinary)+(0.02*volumes[i]*100)/totalVol)) : "";
        });
    })

    nameMap.entries().forEach(([key, val])=> {
        let elemArr = val? document.querySelectorAll(`svg [data-name='${key}']`) : [];
        elemArr.forEach(elem => rgbValues(elem,val));
    })
    localStorage.nameMap = JSON.stringify([...nameMap]);
}

// Maps a volume percentage onto the shared TIER_COLORS ramp (functions.js)
// and applies it -- same palette profile.js's per-muscle +/- input uses,
// so both pages agree on what each tier looks like. Previously this
// defaulted to fill:transparent, which made an unworked muscle invisible
// rather than its own authored resting color -- tier 0 (applyTierColor)
// restores that native color instead.
function tierForVol(vol){
    switch(true) {
        case vol>60: return 5;
        case vol>50: return 4;
        case vol>40: return 3;
        case vol>20: return 2;
        case vol>0: return 1;
        default: return 0;
    }
}
function rgbValues(el,vol){
    applyTierColor(el, tierForVol(vol));
}

function createTemplateItem(program,cover){
    const templateContainer = document.getElementById("templates").firstElementChild;
    const templateItem = document.createElement("div");
    const coverImg = document.createElement("img");
    const label = document.createElement("h1");
    
    coverImg.src = cover||"./media/images/default-image.png";
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
    const loc = new URL("logworkout.html", document.location);
    let program = event.target.parentElement.lastElementChild.textContent;
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
    let n = (new Date(`${_date.getMonth()+1}/01/${_date.getFullYear()}`).getDay());
    const workoutDates = monthlyWorkoutDates(); 
    for (i=1;i<=len;i++){
        // debugger
        let clone = dateBody.cloneNode(true);
        n = n > 6 ? 0 : n;
        clone.textContent = `${dayNames[n++]}\n${i}`
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

let monthlyWorkouts = currentMonthWorkouts.length ;
let monthlyWorkoutsPrev = pastMonthWorkouts.length ;
let lowIntensityDays = currentMonthWorkouts.filter(([k,v])=> v["workoutIntensity"]<=5).length|| "-";
let lowIntensityDaysPrev =  pastMonthWorkouts.filter(([k,v])=> v["workoutIntensity"]<=5).length|| "-" ;
let restDays = findHighlight(currentMonthWorkouts,"rest")|| "-";
let restDaysPrev = findHighlight(pastMonthWorkouts,"rest")|| "-";
let deloadDays = findHighlight(currentMonthWorkouts,"deload")|| "-";
let deloadDaysPrev = findHighlight(pastMonthWorkouts,"deload")|| "-";
let rIntenisty = findHighlight("","intensity")?.[0] || "-"  ;
let rIntenistyPrev = findHighlight("","intensity")?.[1] || "-";
let rEfficiency = findHighlight("","efficiency")?.[0] || "-";
let rEfficiencyPrev = findHighlight("","efficiency")?.[1] || "-";
let rFatigue = "NA";
let rFatiguePrev = "NA";
let bestLifts = findHighlight(currentMonthWorkouts,"bestlifts")?.[0] || "-" ;
let bestLiftsPrev =  findHighlight(pastMonthWorkouts,"bestlifts")?.[1] || "-";
let worstLifts =  findHighlight(currentMonthWorkouts,"worstlifts")?.[0] || "-" ;
let worstLiftsPrev =  findHighlight(pastMonthWorkouts,"worstlifts")?.[1] || "-";
let progress =  findHighlight(currentMonthWorkouts,"progress")?.[0] || "-" ;
let progressPrev =  findHighlight(pastMonthWorkouts,"progress")?.[1] || "-";
let regression =  findHighlight(currentMonthWorkouts,"regression")?.[0] || "-" ;
let regressionPrev =  findHighlight(pastMonthWorkouts,"regression")?.[1] || "-";
let PRs =  findHighlight(currentMonthWorkouts,"bestlifts")?.[2] || "-" ;
let PRsPrev =  findHighlight(pastMonthWorkouts,"bestlifts")?.[3] || "-";
let redZones = "NA";
let redZonesPrev =  "NA" ;
let maxThree =  findHighlight(currentMonthWorkouts,"maxthree")?.[0] || "-";
let maxThreePrev =  findHighlight(pastMonthWorkouts,"maxthree")?.[1] || "-";

function enableScroll(e){
    let bool = e.target.parentElement.id.includes("monthly") ? true : false
    let monthlyHighlightArray = [["Monthly Workouts",monthlyWorkouts,monthlyWorkoutsPrev],
        ["Low Intensity Days",lowIntensityDays,lowIntensityDaysPrev],
        ["Rest Days",restDays,restDaysPrev],
        ["Deload Days",deloadDays,deloadDaysPrev],
        ["Relative Intenisty",rIntenisty,rIntenistyPrev],
        ["Relative Efficiency",rEfficiency,rEfficiencyPrev],
        ["Relative Fatigue",rFatigue,rFatiguePrev]
    ];
    let liftHighlightArray = [["Best Lifts",bestLifts,bestLiftsPrev],
        ["Worst Lifts",worstLifts,worstLiftsPrev],
        ["Progressing Lifts",progress,progressPrev],
        ["Regressing Lifts",regression,regressionPrev],
        ["PRs Hit",PRs,PRsPrev],
        ["Red Zone Hits",redZones,redZonesPrev],
        ["Max 3",maxThree,maxThreePrev]
    ]
    let l = bool ? monthlyHighlightArray.length-1 : liftHighlightArray.length-1;
    let i = bool ? monthlyScroll : liftsScroll;
    if(e.target.id.includes("right")) {
        i++ ; 
        i = i > l ? 0 : i ;
        e.target.previousElementSibling.firstElementChild.textContent = bool ? monthlyHighlightArray[i][0] : liftHighlightArray[i][0];
        e.target.previousElementSibling.lastElementChild.firstElementChild.textContent = bool ? monthlyHighlightArray[i][1] : liftHighlightArray[i][1];
        e.target.previousElementSibling.lastElementChild.lastElementChild.textContent = bool ? monthlyHighlightArray[i][2] : liftHighlightArray[i][2];
        if (!bool) e.target.previousElementSibling.lastElementChild.firstElementChild.classList.toggle("stat-number-value", i===4 || i===5);
        bool ? monthlyScroll=i : liftsScroll=i;
    }
    if(e.target.id.includes("left")) {
        i-- ; 
        i = i < 0 ? l : i ;
        e.target.nextElementSibling.firstElementChild.textContent = bool ? monthlyHighlightArray[i][0] : liftHighlightArray[i][0];
        e.target.nextElementSibling.lastElementChild.firstElementChild.textContent = bool ? monthlyHighlightArray[i][1] : liftHighlightArray[i][1];
        e.target.nextElementSibling.lastElementChild.lastElementChild.textContent = bool ? monthlyHighlightArray[i][2] : liftHighlightArray[i][2];
        if (!bool) e.target.nextElementSibling.lastElementChild.firstElementChild.classList.toggle("stat-number-value", i===4 || i===5);
        bool ? monthlyScroll=i : liftsScroll=i;
    }
}

function findHighlight(array,result){
    if(!array.length) return;
    if (result === "rest")
    {
        let n = new Date(array[0]?.[0])?.getMonth() === date.getMonth() ? date.getDate() : new Date(date - date.getDate()*24*60*60*1000).getDate() ;
        let workDates =  array.map(([k,v])=> new Date(k).getDate()).flat()
        let res = new Array(n).fill(0).map((e,i) => i+1);
        res = res.filter(e => !workDates.includes(e));
        return res.length;
    }
    if (result === "deload"){
        let n = new Date(array[0]?.[0])?.getMonth() === date.getMonth() ? date.getDate() : new Date(date - date.getDate()*24*60*60*1000).getDate() ;
        let workDates =  array.map(([k,v])=> new Date(k).getDate()).flat()
        let res = new Array(n).fill(0).map((e,i) => i+1);
        res = res.filter(e => !workDates.includes(e));
        let days = [];
        let temp = {};
        temp.deload = [];
        res.map((e,i,arr) => arr[i] === arr[i+1]-1).forEach((e,i) => { 
            if  (e && !temp[e]) {
                days.push(i);
                temp[e] = 1
            } 
            else if (e && temp[e]) {
                    days.push(i);
                    temp[e] += 1; 
            }
            else if (!e){
                if (temp[true] > 3) {
                    temp.deload.push(days);
                } 
                days=[];
                delete temp[true];
            }
        }) //if (days.length===0){days.push(i)} else if (e===true && days[days.length-1]===i-1){days.push(i)} else days.pop()
        return temp.deload.flat().length > 3 ? temp.deload.flat().length : 0;
    }
    if (result === "intensity" || result === "efficiency" ){
        debugger
        let twoMonthsBeforeVols = dataInterface.getStat("vol",twoMonthsBeforeWorkouts,arr=>arr,arr=>arr.map(e=>e[1]));
        let volumesPast = dataInterface.getStat("vol",pastMonthWorkouts,arr=>arr,arr=>arr.map(e=>e[1])) ;
        let volumesNow = dataInterface.getStat("vol",currentMonthWorkouts,arr=>arr,arr=>arr.map(e=>e[1]));

        let twoMonthsBeforedurations = twoMonthsBeforeWorkouts.map(([k,v],i)=> (new Date(v["workoutDate"]+ " " +v["workoutEndTime"])-new Date(v["workoutDate"]+ " " +v["workoutStartTime"]))/(1000*60));
        let durationsPast = pastMonthWorkouts.map(([k,v],i)=> (new Date(v["workoutDate"]+ " " +v["workoutEndTime"])-new Date(v["workoutDate"]+ " " +v["workoutStartTime"]))/(1000*60));
        let durationsNow = currentMonthWorkouts.map(([k,v],i)=> (new Date(v["workoutDate"]+ " " +v["workoutEndTime"])-new Date(v["workoutDate"]+ " " +v["workoutStartTime"]))/(1000*60));
        let res;
        if (result === "intensity"){
            res = [(volumesNow.reduce((a,b)=>a+b)/volumesNow.length)/(volumesPast.reduce((a,b)=>a+b)/volumesPast.length), (volumesPast.reduce((a,b)=>a+b)/volumesPast.length)/(twoMonthsBeforeVols.reduce((a,b)=>a+b)/twoMonthsBeforeVols.length)]
            return res.map(e => e.toFixed(2));
        }
        else{
            res = [(volumesNow.reduce((a,b)=>a+b)/durationsNow.reduce((a,b)=>a+b))/(volumesPast.reduce((a,b)=>a+b)/durationsPast.reduce((a,b)=>a+b)), (volumesPast.reduce((a,b)=>a+b)/durationsPast.reduce((a,b)=>a+b))/(twoMonthsBeforeVols.reduce((a,b)=>a+b)/twoMonthsBeforedurations.reduce((a,b)=>a+b))]
            return res.map(e => e.toFixed(2));
        }
    }
     
    if (result === "bestlifts"||result === "worstlifts" ){
        let liftLoadPairArrayPrev = dataInterface.getStat("weight",pastMonthWorkouts,arr=>Math.max(...arr),arr=>arr.map(e=>e),arr=>arr).flat().unique((a,b)=> a.toString()+" "+b.toString()).flatMap(arr => {let temp = typeof arr[1] === "string" ? arr[1].split(" ") : arr[1]; return temp.length ? [[arr[0], temp[temp.length-1]*1-temp[0]*1]] : []}) ; 
        let liftLoadPairArrayNow = dataInterface.getStat("weight",currentMonthWorkouts,arr=>Math.max(...arr),arr=>arr.map(e=>e),arr=>arr).flat().unique((a,b)=> a.toString()+" "+b.toString()).flatMap(arr => {let temp = typeof arr[1] === "string" ? arr[1].split(" ") : arr[1]; return temp.length ? [[arr[0], temp[temp.length-1]*1-temp[0]*1]] : []}) ;
        if(result === "bestlifts"){
            let top3Now = liftLoadPairArrayNow.sort((a,b)=> b[1]-a[1]).filter((a,b)=>b>0).slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n")|| "Plateau" ;
            let top2Prev = liftLoadPairArrayPrev.sort((a,b)=> b[1]-a[1]).filter((a,b)=>b>0).slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n") || "Plateau" ;
            return [top3Now,top2Prev];
        }
        if(result === "worstlifts"){
            let top3Now = liftLoadPairArrayNow.sort((a,b)=> a[1]-b[1]).slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n") ;
            let top2Prev = liftLoadPairArrayPrev.sort((a,b)=> a[1]-b[1]).slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            return [top3Now,top2Prev];
        }
    }
    if (result === "progress" || result === "regression"){
        let liftVolPairArrayPrev = dataInterface.getStat("vol",pastMonthWorkouts,arr=>arr,arr=>arr.map(e=>e),arr=>arr).flat().unique((a,b)=> a.toString()+" "+b.toString()).flatMap(arr => {let temp = typeof arr[1] === "string" ? arr[1].split(" ") : arr[1]; return temp.length ? [[arr[0], temp[temp.length-1]*1-temp[0]*1]] : []}) ; 
        let liftVolPairArrayNow = dataInterface.getStat("vol",currentMonthWorkouts,arr=>arr,arr=>arr.map(e=>e),arr=>arr).flat().unique((a,b)=> a.toString()+" "+b.toString()).flatMap(arr => {let temp = typeof arr[1] === "string" ? arr[1].split(" ") : arr[1]; return temp.length ? [[arr[0], temp[temp.length-1]*1-temp[0]*1]] : []}) ;
        if(result === "progress"){
            let top3Now = liftVolPairArrayNow.sort((a,b)=> b[1]-a[1]).slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            let top2Prev = liftVolPairArrayPrev.sort((a,b)=> b[1]-a[1]).slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            return [top3Now,top2Prev];
        }
        if(result === "regression"){
            let top3Now = liftVolPairArrayNow.sort((a,b)=> a[1]-b[1]).slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            let top2Prev = liftVolPairArrayPrev.sort((a,b)=> a[1]-b[1]).slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            return [top3Now,top2Prev];
        }
    }
    if(result === "maxthree"){
        let top3PairArrayNow = dataInterface.getStat("weight",currentMonthWorkouts,arr=>Math.max(...arr),arr=>arr.map(e=>e),arr=>arr).flat().unique(Math.max).sort((a,b)=> b[1]-a[1])
        let top3PairArrayPrev = dataInterface.getStat("weight",pastMonthWorkouts,arr=>Math.max(...arr),arr=>arr.map(e=>e),arr=>arr).flat().unique(Math.max).sort((a,b)=> b[1]-a[1]);
        let top3Now = top3PairArrayNow.slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n");
        let top2Prev = top3PairArrayPrev.slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n");
        return [top3Now,top2Prev];
    }
    
}

function calcRZ(){
    if (date.getMonth() !== new Date(date-24*60*60*1000).getMonth()){ 
        localStorage.rz = JSON.stringify([]);
    }
    let rzArray = localStorage?.rz ? JSON.parse(localStorage?.rz) : [] ; 
    let rzObject = Object.fromEntries(rzArray);
    [...nameMap].filter(arr => arr[1] >= 100).forEach(([k,v]) => { 
        if(rzObject?.[k] < v) {
            rzArray = rzArray.map(([p,q])=>[p, p===k ? v : q])
        } 
        if(!rzObject?.[k]){
            rzArray.push([k,v])
        }
    })
    localStorage.rz =  JSON.stringify(rzArray);
    return rzArray.length;
}