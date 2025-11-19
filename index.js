const indexScript = document.getElementById("indexJS"); 
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
let monthlyScroll=0;
let liftsScroll=0;

const date = new Date();
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dayNames = ["Su","M","Tu","W","Th","F","Sa"];
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
const pastWorkoutsObject = localStorage?.workoutLogObject ? JSON.parse(localStorage.workoutLogObject).sort(([k1,v1],[k2,v2])=> new Date(k1)-new Date(k2)) : {};
const getMonthlyWorkoutData = (i) => pastWorkoutsObject.filter(([k,v])=> new Date(k).getMonth() === date.getMonth()-i); 
const currentMonthWorkouts = getMonthlyWorkoutData(0);
const pastMonthWorkouts = getMonthlyWorkoutData(1);
const twoMonthsBeforeWorkouts = getMonthlyWorkoutData(2);
let dailyWorkoutLog = new Map(); 
//  debugger
// render svg content to the application 
let svgcode = script.cloneNode(true);
indexScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", () => {
    muscularManSvg(svgContainer,[-30,-25,200,200]);
    const [frontsvg,backsvg] = [document.getElementById("frontHumanSVG"),document.getElementById("backHumanSVG")];
    // svgContainer.append(frontsvg);
    // svgContainer.append(backsvg);
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
monthlyHighlights.firstElementChild.addEventListener("click",enableScroll)
monthlyHighlights.lastElementChild.addEventListener("click",enableScroll)
liftHighlights.firstElementChild.addEventListener("click",enableScroll)
liftHighlights.lastElementChild.addEventListener("click",enableScroll)
monthlyHighlights.firstElementChild.nextElementSibling.lastElementChild.firstElementChild.textContent = currentMonthWorkouts.length;
monthlyHighlights.firstElementChild.nextElementSibling.lastElementChild.lastElementChild.textContent = pastMonthWorkouts.length;
liftHighlights.firstElementChild.nextElementSibling.lastElementChild.firstElementChild.textContent = findHighlight("","bestlifts")[0];
liftHighlights.firstElementChild.nextElementSibling.lastElementChild.lastElementChild.textContent = findHighlight("","bestlifts")[1];
function recentWorkouts(object){
    const keys = Array.from(object.keys());
    const dates = keys.filter(key => new Date(key) > new Date(date.getTime() - 7*24*60*60*1000) )
    const recentWorkoutDetails = dates.map(date => object.get(date));
    recentWorkoutDetails.forEach(({workoutExercises,...obj},i) => {
        let dayMultiple = (100-(new Date().getDate() - new Date(dates[i]).getDate())*10)/100;
        const movers = Object.values(workoutExercises).map(arr => arr[0][1]);
        const volumes = Object.values(workoutExercises).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]).map(e => Math.round(e*dayMultiple));
        const totalVol = Math.round(volumes.reduce((a,b)=> a+b,0)/dayMultiple);
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

function rgbValues(el,vol){
    switch(true) {
        case vol>100:{
            el.setAttribute("stroke",`rgb(100%, 0%, 0%)`);
            el.setAttribute("fill",`rgb(100%, 0%, 0%)`)
            break;
        };
        case vol>70&&vol<=100: {
            el.setAttribute("stroke",`rgb(100%, 25%, 25%)`);
            el.setAttribute("fill",`rgb(100%, 25%, 25%)`);
            break;
        };
        case vol>40&&vol<=70: {
            el.setAttribute("stroke",`rgb(100%, 75%, 50%)`);
            el.setAttribute("fill",`rgb(100%, 75%, 50%)`);
            break;
        };
        case vol>20&&vol<=40: {
            el.setAttribute("stroke",`rgb(75%, 100%, 100%)`);
            el.setAttribute("fill",`rgb(75%, 100%, 100%)`);
            break;
        };
        case vol>0&&vol<=20: {
            el.setAttribute("stroke",`rgb(100%, 100%, 100%)`);
            el.setAttribute("fill",`rgb(100%, 100%, 100%)`);
            break;
        };
        default: {
            el.setAttribute("stroke",`rgb(0%, 0%, 0%)`);
            el.setAttribute("fill",`transparent`);
            break;
        }       

    }
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
    const loc = new URL("file:///C:/Users/krish/Desktop/Web%20Development/Capstone%20projects/Project%207%20-%20LoggerDotOne/logworkout.html");
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
let lowIntensityDays = currentMonthWorkouts.filter(([k,v])=> v["workoutIntensity"]<=5).length;
let lowIntensityDaysPrev =  pastMonthWorkouts.filter(([k,v])=> v["workoutIntensity"]<=5).length ;
let restDays = findHighlight(currentMonthWorkouts,"rest");
let restDaysPrev = findHighlight(pastMonthWorkouts,"rest");
let deloadDays = findHighlight(currentMonthWorkouts,"deload");
let deloadDaysPrev = findHighlight(pastMonthWorkouts,"deload");
let rIntenisty = findHighlight("","intensity")[0] ;
let rIntenistyPrev = findHighlight("","intensity")[1];
let rEfficiency = findHighlight("","efficiency")[0];
let rEfficiencyPrev = findHighlight("","efficiency")[1];
let rFatigue = "NA";
let rFatiguePrev = "NA";
let bestLifts = findHighlight("","bestlifts")[0] ;
let bestLiftsPrev =  findHighlight("","bestlifts")[1];
let worstLifts =  findHighlight("","worstlifts")[0] ;
let worstLiftsPrev =  findHighlight("","worstlifts")[1];
let progress =  findHighlight("","progress")[0] ;
let progressPrev =  findHighlight("","progress")[1];
let regression =  findHighlight("","regression")[0] ;
let regressionPrev =  findHighlight("","regression")[1];
let PRs =  findHighlight("","bestlifts")[2] ;
let PRsPrev =  findHighlight("","bestlifts")[3];
let redZones =  [...nameMap].filter((k,v) => v>100).length;
let redZonesPrev =  "NA" ;
let maxThree =  findHighlight("","maxthree")[0];
let maxThreePrev =  findHighlight("","maxthree")[1];

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
        !bool ? e.target.previousElementSibling.lastElementChild.firstElementChild.style.fontSize = i===4 || i===5 ? "5.5rem" : "1.25rem" : "";
        bool ? monthlyScroll=i : liftsScroll=i;
    }
    if(e.target.id.includes("left")) {
        i-- ; 
        i = i < 0 ? l : i ;
        e.target.nextElementSibling.firstElementChild.textContent = bool ? monthlyHighlightArray[i][0] : liftHighlightArray[i][0];
        e.target.nextElementSibling.lastElementChild.firstElementChild.textContent = bool ? monthlyHighlightArray[i][1] : liftHighlightArray[i][1];
        e.target.nextElementSibling.lastElementChild.lastElementChild.textContent = bool ? monthlyHighlightArray[i][2] : liftHighlightArray[i][2];
        !bool ? e.target.nextElementSibling.lastElementChild.firstElementChild.style.fontSize = i===4 || i===5  ? "5.5rem" : "1.25rem" : "";
        bool ? monthlyScroll=i : liftsScroll=i;
    }
}

function findHighlight(array,result){
    if (result === "rest")
    {
        return array.map(([k,v])=> new Date(k).getDate()).flatMap((d,i,arr)=>{
            let res = [...new Array(arr[arr.length-1]).keys()].map(i => i+1);
            res = res.filter(e => !arr.includes(e));
            if(i===0) {return res} else return []
        }).length ;
    }
    if (result === "deload"){
        let res = []
        let restArr =  array.map(([k,v])=> new Date(k).getDate()).flatMap((d,i,arr)=>{
            let res = [...new Array(arr[arr.length-1]).keys()].map(i => i+1);
            res = res.filter(e => !arr.includes(e));
            if(i===0) {return res} else return [] ;
        })
        restArr.forEach(e => !res.length ? res.push([e]) : e-res[res.length-1].findLast(l=>l)===1 ? res[res.length-1].push(e) : res.push([e]));
        res = res.filter(e => e.length>=3) ;
        return res.length ? res.reduce((a,b)=>(a.length-3)+(b.length-3)) : 0;
    }
    if (result === "intensity" || result === "efficiency" ){
        let twoMonthsBeforeVols = twoMonthsBeforeWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.values(obj).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]).reduce((a,b)=>a+b)); 
        let volumesPast = pastMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.values(obj).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]).reduce((a,b)=>a+b));
        let volumesNow = currentMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.values(obj).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]).reduce((a,b)=>a+b))

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
    let referenceLiftsNow  = [];
    currentMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.keys(obj)).forEach(arr => {arr.forEach(lift => {!referenceLiftsNow.includes(lift) ? referenceLiftsNow.push(lift) : ""})})    
    const statProgressArrray = (array) => referenceLiftsNow.map(lift => {let val = array.filter(([k,v])=> k === lift).map(arr => arr[1]); return [lift,val.length>1 ? (val[val.length-1]-val.slice(0,val.length-1).reduce((a,b)=>a+b)/val.slice(0,val.length-1).length).toFixed(2)*1 : 0]});
        
    if (result === "bestlifts"||result === "worstlifts" ){
        let liftLoadPairArrayPrev = pastMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.entries(obj).map(([k,v]) => [k,Math.max(...v.map(([p,q])=> p.includes("weight") ? q : ""))*(v.find(([p,q])=> p.includes("wtMultiple"))?.[1]||1)])).flat(); 
        let liftLoadPairArrayNow = currentMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.entries(obj).map(([k,v]) => [k,Math.max(...v.map(([p,q])=> p.includes("weight") ? q : ""))*(v.find(([p,q])=> p.includes("wtMultiple"))?.[1]||1)])).flat();
        
        if(result === "bestlifts"){
            let decendingArrayNow = statProgressArrray(liftLoadPairArrayNow).sort(([k1,v1],[k2,v2])=> v2-v1);
            let decendingArrayPrev = statProgressArrray(liftLoadPairArrayPrev).sort(([k1,v1],[k2,v2])=> v2-v1);
            let top3Now = decendingArrayNow.slice(0,3).filter(([k,v])=>v>0);
            top3Now = top3Now.length > 1 ? top3Now.map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top3Now[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-"
            let top2Prev = decendingArrayPrev.slice(0,2).filter(([k,v])=>v>0);
            top2Prev = top2Prev.length > 1 ? top2Prev.map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top2Prev[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-"
            return [top3Now,top2Prev,decendingArrayNow.filter(([k,v])=>v>0).length,decendingArrayPrev.filter(([k,v])=>v>0).length]
        }
        if(result === "worstlifts"){
            let top3Now = statProgressArrray(liftLoadPairArrayNow).sort(([k1,v1],[k2,v2])=> v1-v2).slice(0,3).filter(([k,v])=>v<0);
            top3Now = top3Now.length > 1 ? top3Now.map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top3Now[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-"
            let top2Prev = statProgressArrray(liftLoadPairArrayPrev).sort(([k1,v1],[k2,v2])=> v1-v2).slice(0,2).filter(([k,v])=>v<0);
            top2Prev = top2Prev.length > 1 ? top2Prev.map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top2Prev[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-"
            return [top3Now,top2Prev]
        }
    }
    if (result === "progress" || result === "regression"){
        let liftVolPairArrayPrev = pastMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.entries(obj).map(([k,v]) => [k,Math.max(...v.map(([p,q])=> p.includes("vol") ? q : ""))])).flat(); 
        let liftVolPairArrayNow = currentMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.entries(obj).map(([k,v]) => [k,Math.max(...v.map(([p,q])=> p.includes("vol") ? q : ""))])).flat();
        if(result === "progress"){
            let top3Now = statProgressArrray(liftVolPairArrayNow).sort(([k1,v1],[k2,v2])=> v2-v1).slice(0,3).filter(([k,v])=>v>0);
            top3Now = top3Now.length > 1 ? top3Now.map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top3Now[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-"
            let top2Prev = statProgressArrray(liftVolPairArrayPrev).sort(([k1,v1],[k2,v2])=> v2-v1).slice(0,2).filter(([k,v])=>v>0);
            top2Prev = top2Prev.length > 1 ? top2Prev.map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top2Prev[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-"
            return [top3Now,top2Prev]
        }
        if(result === "regression"){
            let top3Now = statProgressArrray(liftVolPairArrayNow).sort(([k1,v1],[k2,v2])=> v1-v2).slice(0,3).filter(([k,v])=>v<0);
            top3Now = top3Now.length > 1 ? top3Now.map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top3Now[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-"
            let top2Prev = statProgressArrray(liftVolPairArrayPrev).sort(([k1,v1],[k2,v2])=> v1-v2).slice(0,2).filter(([k,v])=>v<0);
            top2Prev = top2Prev.length > 1 ? top2Prev.map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top2Prev[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-"
            return [top3Now,top2Prev]
        }
    }
    if(result = "maxthree"){
        let top3PairArrayNow = currentMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.entries(obj).map(([k,v]) => [k, (v[0][1][0].includes("chest") || v[0][1][0].includes("back") || v[0][1][0].includes("lats") || v[0][1][0].includes("quads") || v[0][1][0].includes("hams"))? Math.max(...v.flatMap(([k,v],i,arr)=> k.includes("weight") ? [v*(arr.find(([p,q])=> p.includes("wtMultiple"))?.[1]||1)]:[])) : ""]).filter(([k,v])=>v)).filter(arr => arr.length)
        let top3PairArrayPrev = pastMonthWorkouts.map(([k,v])=> v["workoutExercises"]).map(obj=> Object.entries(obj).map(([k,v]) => [k, (v[0][1][0].includes("chest") || v[0][1][0].includes("back") || v[0][1][0].includes("lats") || v[0][1][0].includes("quads") || v[0][1][0].includes("hams"))? Math.max(...v.flatMap(([k,v],i,arr)=> k.includes("weight") ? [v*(arr.find(([p,q])=> p.includes("wtMultiple"))?.[1]||1)]:[])) : ""]).filter(([k,v])=>v)).filter(arr => arr.length)
        let referenceLiftsNow = [];
        top3PairArrayNow.forEach(arr => arr.forEach(([lift,v])=>!referenceLiftsNow.includes(lift) ? referenceLiftsNow.push(lift) : ""));
        let top3Now = referenceLiftsNow.map(lift => {let ary = top3PairArrayNow.map(arr => arr.find(([k,v]) => k===lift)); return ary.length > 1 ? ary.sort(([k1,v1],[k2,v2])=> v2-v1)[0] : ary});
        top3Now = top3Now.length>1 ? top3Now.sort(([k1,v1],[k2,v2])=> v2-v1).slice(0,3).map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top3Now[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-";
        let top2Prev = referenceLiftsNow.map(lift => {let ary = top3PairArrayPrev.map(arr => arr.find(([k,v]) => k===lift)) ;return ary.length > 1 ? ary.sort(([k1,v1],[k2,v2])=> v2-v1)[0] : ary})
        top2Prev = top2Prev.length>1 ? top2Prev.sort(([k1,v1],[k2,v2])=> v2-v1).slice(0,2).map(arr => arr[0].replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase())).join("\n") : top2Prev[0]?.[0]?.replaceAll("_"," ").replaceAll(/\b\w/g,(e)=>e.toUpperCase()) || "-";;
        return [top3Now,top2Prev];
    }
    
}