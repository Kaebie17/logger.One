const indexScript = document.getElementById("trendsJS"); 
const dailyOrCustom = document.getElementById("custom");
const weeklyTrends = document.getElementById("weeklytrends");
const monthlyTrends = document.getElementById("monthlytrends");
const mainFilterOptions = document.getElementById("mainfilteroptions");
const dailyFilterOptions = document.getElementById("dailyfilteroptions");
const weeklyFilterOptions = document.getElementById("weeklyfilteroptions");
const monthlyFilterOptions = document.getElementById("monthlyilteroptions");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const redirectHome = document.querySelector("#header > h1");

const pastWorkoutsArray = JSON.parse(localStorage.workoutLogObject);
const exerciseNameIds = pastWorkoutsArray.flatMap(([k,{workoutExercises,...v}]) => {let {date,time,...exercises} = workoutExercises; return Object.keys(exercises)}) ;
const workoutDates = pastWorkoutsArray.map(([k,v])=>k) ;
const uniqueTargets = new Map();
const targetsArr = pastWorkoutsArray.flatMap(([k,{workoutExercises,...v}]) => {let {date,time,...exercises} = workoutExercises; return Object.values(exercises).flat().filter(([k,v])=>k==="targets").flatMap(([k,v])=> v);}) ;
targetsArr.forEach((e => {!uniqueTargets.has(e)? uniqueTargets.set(e,1) : uniqueTargets.set(e,uniqueTargets.get(e)+1)}));

//redirect to home page
redirectHome.addEventListener("click" , home);

// let extractedStats =  
// let exerciesRepsArr = {}
let allDatesArr = getDateRange(7);
let currentIndex = 0;
let customDates;
let dates = Object.keys(Object.fromEntries(pastWorkoutsArray)).map(date => new Date(date).toLocaleDateString());
const statsByChunk = (stat,chunk) => {
    customDates = getDateRange(chunk)[currentIndex];
    return getDateRange(chunk).map(e => e.map(d => {let val = dataSnippet(stat,stat,{targetdates:[`${d}`]})[stat][0]; return val? val:0 }));
}

prevButton.addEventListener("click", handleDirClick);
nextButton.addEventListener("click", handleDirClick)
dailyFilterOptions.addEventListener("change",handleStatChange)
weeklyFilterOptions.addEventListener("change",handleStatChange)

let svgcode = document.createElement("script");
indexScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", () => {
    graphics(dailyOrCustom.lastElementChild.firstElementChild,dailyOrCustom.lastElementChild.lastElementChild)([dataSnippet(dailyFilterOptions.value,"volume")],dates);
    graphics(weeklyTrends.lastElementChild.firstElementChild,weeklyTrends.lastElementChild.lastElementChild)([{volume: statsByChunk(weeklyFilterOptions.value,7)[0]}],customDates);
})

function extractStats(filterStr,f,{targetdates,targetprograms,targetparts,targetexercises}){
    targetdates =  targetdates?.length ? (Array.isArray(targetdates)? targetdates : [targetdates]) : pastWorkoutsArray.flatMap(([k,{workoutName, workoutExercises,...v}]) => workoutExercises.date);
    targetprograms =  targetprograms?.length ? (Array.isArray(targetprograms)? targetprograms.map(e => e.toLowerCase()) : [targetprograms].map(e => e.toLowerCase())) : "";
    targetparts =  targetparts?.length ? (Array.isArray(targetparts)? targetparts.map(e => e.toLowerCase()) : [targetparts].map(e => e.toLowerCase())) : "" ;
    let result = {};
    targetdates.forEach( dt => {
        // debugger
        pastWorkoutsArray.forEach(([d,{workoutName, workoutExercises,...o}]) =>{
            if (d.includes(dt) && (targetprograms?.includes(workoutName)||true)){
                const {date,time,chooseprogram,...exercises} = workoutExercises;
                targetexercises?.forEach(e => {
                    if (exercises.hasOwnProperty(e)){
                        delete exercises[e]
                    }
                })
                result[date] = {};
                Object.entries(exercises).map(([e,v])=> {
                    let valObj = {};
                    let valuesArr = v.filter(([k,v])=> filterStr.some(str => k === str)||filterStr.some(str => k.includes(str)));
                    valuesArr.forEach(([k,v])=>{
                        
                        if (valObj.hasOwnProperty(k.match(/[^\d]+/)[0]))  (valObj[k.match(/[^\d]+/)[0]]).push(parseInt(v)) ;
                        else valObj[k.match(/[^\d]+/)[0]] = [parseInt(v)] ;
                    })

                    filterStr.forEach(k => valObj[k.match(/[^\d]+/)[0]] = f.call(this,valObj[k.match(/[^\d]+/)[0]]));
                    result[date][e] = valObj ;
                }) ;
            }
            }) 
    })
    return result
}

function dataSnippet(param,label,obj={},groupBy="",g = (arr) => arr, f=(arr) => arr.reduce((a,b)=>a+b)){
  return {[label] : g.call(this, Object.entries(extractStats([param],(arr) => arr.reduce((a,b)=>a+b),obj)).map(([k,o])=> Object.values(o).map((o)=> o[param])).map(arr=>f.call(this, arr)),groupBy,f)}; 
}

function groupData(arr,days,f){
    return arr.flatMap((e,i,ar) => {
        let j = i*days;
        let arr = [];
        if (ar[j]){
        while(j<days*(i+1)){
            ar[j] ? arr.push(ar[j]) : "";
            j++
        }
        return [f.call(this,arr)];
        }
        else return [];
})

}

function getDateRange(groupBy=1,today = new Date(),firstday=new Date(pastWorkoutsArray[0][0].split(" ")[0])){
    const dates =  [];
    let ms = 24*60*60*1000;
    let days = (today-firstday)/ms;
    for (let i=0; i<=days;i++){ 
        dates.push(today.toLocaleDateString());
        today = new Date(today-ms); 
    } 
    return groupData.call(this,dates,groupBy,arr=>arr)
}

function handleDirClick(e){
    let i = e.target.id.includes("next") ? -1 : 1 ;
    currentIndex = currentIndex+(i); 
    if (currentIndex >= 0 && currentIndex < allDatesArr.length){
        let stat = e.target.parentElement.parentElement.previousElementSibling.value;
        weeklyChartVolData = {volume: statsByChunk(stat,7)?.[currentIndex]};
        weeklyTrends.lastElementChild.firstElementChild.firstElementChild.remove();
        weeklyTrends.lastElementChild.lastElementChild.lastElementChild.remove();
        graphics(weeklyTrends.lastElementChild.firstElementChild,weeklyTrends.lastElementChild.lastElementChild)([{volume: statsByChunk(stat,7)[currentIndex]}],customDates);
    }else{
        currentIndex = currentIndex-(i)
    }
}

function handleStatChange(e){
    let targetElem = e.target.nextElementSibling;
    targetElem.firstElementChild.firstElementChild.remove();
    targetElem.lastElementChild.lastElementChild.remove();
    let stat = e.target.value;
    let name = e.target.textContent.toLowerCase();
    if (e.target.id.includes("daily")) graphics(dailyOrCustom.lastElementChild.firstElementChild,dailyOrCustom.lastElementChild.lastElementChild)([dataSnippet(stat,name)],dates);
    else graphics(targetElem.firstElementChild,targetElem.lastElementChild)([{volume: statsByChunk(stat,7)[currentIndex]}],customDates);
}

function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}
// {[[date,workoutName,targetparts][key]]: Object.entries(exercises).flatMap(([k,v]) => v.filter(([k,v]) => k==="targets").flatMap(([k,v]) => v).some(e => targetparts? targetparts.includes(e) : e) ?  [[k, v.flatMap(([k,v])=> k.includes(filterStr)? parseInt(v) : [])]] : [] )}

// pastWorkoutsArray.flatMap(([k,{workoutName, workoutExercises,...v}]) => {
//         const {date,time,chooseprogram,...exercises} = workoutExercises; 
//         const innerData = Object.values(exercises); 
//         const innerKeys = Object.keys(exercises);
//         if (targetdates.includes(date) && targetprograms.includes(workoutName.toLowerCase())) { 
//             return exercises 
//         } else {
//             return []
//         }
//     }) ;pastWorkoutsArray.flatMap(([k,{workoutName, workoutExercises,...v}]) => workoutName.toLowerCase())