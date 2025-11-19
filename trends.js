const indexScript = document.getElementById("trendsJS"); 
const dailyOrCustom = document.getElementById("custom");
const weeklyTrends = document.getElementById("weeklytrends");
const monthlyTrends = document.getElementById("monthlytrends");
const mainFilterRadios = document.querySelectorAll("#mainfilters input[type='radio']");
const mainFilterOptions = document.getElementById("mainfilteroptions");
const dailyFilterOptions = document.getElementById("dailyfilteroptions");
const weeklyFilterOptions = document.getElementById("weeklyfilteroptions");
const monthlyFilterOptions = document.getElementById("monthlyfilteroptions");
const prevButtons = document.querySelectorAll(".prevBtn");
const nextButtons = document.querySelectorAll(".nextBtn");
const redirectHome = document.querySelector("#header > h1");
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const pastWorkoutsArray = localStorage?.workoutLogObject ? JSON.parse(localStorage.workoutLogObject) : {};
const mainFilterEntries = {};
mainFilterEntries.exerciseNameIds = [];
localStorage?.workoutLogObject ? pastWorkoutsArray.forEach(([k,{workoutExercises,...o}])=> Object.keys(workoutExercises).forEach(e => !mainFilterEntries.exerciseNameIds.includes(e)?mainFilterEntries.exerciseNameIds.push(e):"")) : [] ;
mainFilterEntries.exerciseNameIds = mainFilterEntries.exerciseNameIds.sort((a,b)=> (a[0]+a[1]).charCodeAt()-(b[0]+b[1]).charCodeAt())
const workoutDates = localStorage?.workoutLogObject ? pastWorkoutsArray.map(([k,v])=>k) : [] ;
mainFilterEntries.uniqueTargets = [];
localStorage?.workoutLogObject ? pastWorkoutsArray.forEach(([k,{workoutExercises,...v}]) => Object.values(workoutExercises).flat().filter(arr => arr[0]==="targets")[0][1].forEach(t => {if(!mainFilterEntries.uniqueTargets.includes(t)){mainFilterEntries.uniqueTargets.push(t)}})) : [];
mainFilterEntries.uniqueTargets = mainFilterEntries.uniqueTargets.sort((a,b)=> (a[0]+a[1]).charCodeAt()-(b[0]+b[1]).charCodeAt());
mainFilterEntries.uniquePrograms = [] 
pastWorkoutsArray.forEach(([k,{workoutName,...o}])=> !mainFilterEntries.uniquePrograms.includes(workoutName)? mainFilterEntries.uniquePrograms.push(workoutName) : "")
mainFilterEntries.uniquePrograms = mainFilterEntries.uniquePrograms.sort((a,b)=> (a[0]+a[1]).charCodeAt()-(b[0]+b[1]).charCodeAt())

//redirect to home page
redirectHome.addEventListener("click" , home);

// let extractedStats =  
// let exerciesRepsArr = {}

const allDatesArr = getDateRange(7);
const monthSequence = allDatesArr.map(arr => Math.min(...arr.map(e => e.match(/^\d+(?=\/)/)[0]))).flatMap((e,i,arr) => e !== arr?.[i+1] ? [e] : []);
let currentIndex = allDatesArr.length-1;
let customDates;
let xAxisLabelArr , chartLegend=[];
let dateGroupArray;
let dates = Object.keys(Object.fromEntries(pastWorkoutsArray)).map(date => new Date(date).toLocaleDateString());

const reducer = (arr) => arr.length? arr.reduce((a,b)=>a+b) : 0 ;

const statsByChunk = (stat,chunk,index = currentIndex) => {
    let dataArr = [];
    let label = dailyFilterOptions.selectedOptions[0].textContent.toLowerCase();
    let weeklyDates = allDatesArr.length > 7 ? allDatesArr.slice(index-6,index+1) :  allDatesArr ;
    
    if (chunk==="daily"){
        let dates = allDatesArr[index];
        xAxisLabelArr = dates.map((e,i) => {
            let d = new Date(e); 
            let yp = new Date(dates[i-1]).getFullYear();
            let y = d.getFullYear();
            if (yp && !chartLegend.includes(yp)){chartLegend.push(yp)};
            if (y && !chartLegend.includes(y)){chartLegend.push(y)};
            let yearVal = i!==0 && yp!==y ? `-${new Date(allDatesArr[1][0]).getFullYear()}` : "";
            return `${d.getDate()}-${months[d.getMonth()].substring(0,3)}${yearVal}`
        })
        return dataSnippet(stat,label,{targetdates: dates})[label];
    }
    else if (chunk === "weekly"){
        xAxisLabelArr = weeklyDates.map((ar,i) => {
            let lInx = ar.length-1;
            let sd = new Date(ar[0]);
            let ed = new Date(ar[lInx]);
            let sy = `${sd.getFullYear()}`.substring(2,4);
            let ey = `${ed.getFullYear()}`.substring(2,4);
            let fd = new Date("01-01-"+ sd.getFullYear());
            if (ey!==sy){
                let lastValIndex = ar.findIndex(e => sd.getMonth() !== new Date(e).getMonth());
                let nextfd = new Date("01-01-"+ new Date(ar[lastValIndex]).getFullYear());
                let week1 = Math.floor((ar[lastValIndex-1]-fd)/(24*60*60*1000)/7);
                let week2 = Math.floor((ed-nextfd)/(24*60*60*1000)/7);
                if (sy && !chartLegend.includes(sd.getFullYear())){chartLegend.push(sd.getFullYear())};
                if (ey && !chartLegend.includes(ed.getFullYear())){chartLegend.push(ed.getFullYear())};
                return `Week ${week1}-${week2}`;     
            }
            let week = Math.floor((ed-fd)/(24*60*60*1000)/7);
            if (sy && !chartLegend.includes(sd.getFullYear())){chartLegend.push(sd.getFullYear())};
            return `Week ${week}`;
        }) 
        return weeklyDates.map(dates => dataSnippet(stat,label,{targetdates: dates},"", reducer)[label]);
    }
    else if (chunk === "monthly"){
        let monthlyDates = {};
        allDatesArr.forEach(arr=> {
            arr = Array.from(arr);
            let firstIndex = new Date(arr[0]).getMonth();
            if (firstIndex === new Date(arr[arr.length-1]).getMonth()){
                monthlyDates?.[months[firstIndex]] ? monthlyDates?.[months[firstIndex]].push(...arr) : monthlyDates[months[firstIndex]] = arr ; 
            }
            else {
                let lastValIndex = arr.findIndex(e => firstIndex !== new Date(e).getMonth());
                let nextMonthNum = new Date(arr[lastValIndex]).getMonth();
                monthlyDates?.[months[firstIndex]] ? monthlyDates?.[months[firstIndex]].push(...arr.slice(0,lastValIndex)) : monthlyDates[months[firstIndex]] = arr.slice(0,lastValIndex) ;
                monthlyDates?.[months[nextMonthNum]] ? monthlyDates?.[months[nextMonthNum]].push(...arr.slice(lastValIndex,arr.length)) : monthlyDates[months[nextMonthNum]] = arr.slice(lastValIndex, arr.length) ; 
            }
        })
        xAxisLabelArr = Object.entries(monthlyDates).map(([e,v],i) => {
            let yr = new Date(v[i]).getFullYear();
            if (yr && !chartLegend.includes(yr)){chartLegend.push(yr)};
            return e.substring(0,3);
        });
        
        return Object.values(monthlyDates).map(dates =>  dataSnippet(stat,label,{targetdates: dates},"", reducer)[label]);
    }
}

prevButtons.forEach((elem)=> elem.addEventListener("click", handleDirClick));
nextButtons.forEach((elem)=> elem.addEventListener("click", handleDirClick));

dailyFilterOptions.addEventListener("change",handleStatChange)
weeklyFilterOptions.addEventListener("change",handleStatChange)
monthlyFilterOptions.addEventListener("change",handleStatChange)
if(pastWorkoutsArray.length){
let svgcode = document.createElement("script");
indexScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", () => {
    graphics(dailyOrCustom.lastElementChild.firstElementChild,dailyOrCustom.lastElementChild.lastElementChild)([{volume: statsByChunk(dailyFilterOptions.value,"daily")}],xAxisLabelArr,chartLegend);
    graphics(weeklyTrends.lastElementChild.firstElementChild,weeklyTrends.lastElementChild.lastElementChild)([{volume: statsByChunk(weeklyFilterOptions.value,"weekly")}],xAxisLabelArr,chartLegend);
    graphics(monthlyTrends.lastElementChild.firstElementChild,monthlyTrends.lastElementChild.lastElementChild)([{volume: statsByChunk(monthlyFilterOptions.value,"monthly")}],xAxisLabelArr,chartLegend);
})
nextButtons.forEach((elem)=> {
    elem.style.color = "grey";
    let filterElement =  elem.parentElement.id.includes("daily") ?  dailyFilterOptions : elem.parentElement.id.includes("weekly") ? weeklyFilterOptions : monthlyFilterOptions ;
    let chunk = filterElement.id.replace("filteroptions","");
    if (chunk === "monthly" && monthSequence.length < 7) {
        elem.previousElementSibling.style.color = "grey";
        elem.previousElementSibling.removeEventListener("click",handleDirClick);
    }  
    if (chunk === "weeekly" && currentIndex < 7) {
        elem.previousElementSibling.style.color = "grey";
        elem.previousElementSibling.removeEventListener("click",handleDirClick);
    }  
    elem.removeEventListener("click",handleDirClick);
})
}
else{
    alert("No workout database found. Log a workout to access this page.")
    window.location = "index.html";
}
function extractStats(filterStr,f,{targetdates}){
    targetdates =  targetdates||allDatesArr[currentIndex]; 
    let targetprogram =  mainFilterRadios[0].checked ? mainFilterOptions.value : "";
    let targetpart =  mainFilterRadios[2].checked ? mainFilterOptions.value : "" ;
    let targetexercise =  mainFilterRadios[1].checked ? mainFilterOptions.value.replaceAll(" ","_") : "" ;
    let result = {};
    targetdates = targetdates.sort((d1,d2) => new Date(d1) - new Date(d2));
    targetdates.forEach( dt => {
        let workoutOnDt = [pastWorkoutsArray.find(([d,v]) => d.includes(dt))]; // will find the first workout of the day, any subsequent workouts on the same day would be missed.
        if(!workoutOnDt[0]){result[dt] = {}; return;}
        workoutOnDt.forEach(([d,{workoutName, workoutDate, workoutStartTime, workoutExercises,...o}]) =>{
            if (d.includes(dt) && (targetprogram === "" || workoutName === targetprogram) && (targetexercise === "" || Object.keys(workoutExercises).includes(targetexercise))){
                const date = workoutDate, time = workoutStartTime ;
                exercises = targetexercise? {[targetexercise]:workoutExercises[targetexercise]} : workoutExercises ;
                if (targetpart){
                    exercises = Object.entries(exercises).flatMap(([name,arr])=> { 
                        if (arr[0][1].includes(targetpart)){
                            let i =  arr[0][1].findIndex(e => e === targetpart);
                            let statIndex = arr.findIndex(([k,v])=> k===filterStr[0]||k.includes(filterStr[0]));
                            volMultiplier(i,arr,statIndex,1) ;
                            return [[name,arr]]
                        } 
                        else {
                            return []
                        }
                    });
                    if (exercises.length){
                        exercises = Object.fromEntries(exercises);
                    }
                    else{
                      result[dt] = {}; 
                      return;  
                    }
                }
                result[date] = {};
                Object.entries(exercises).map(([e,v])=> {
                    let valObj = {};
                    let valuesArr = [v.find(([k,v])=> k===filterStr[0]||k.includes(filterStr[0]))] //v.filter(([k,v])=> filterStr.some(str => k === str)||filterStr.some(str => k.includes(str)));
                    valuesArr.forEach(([k,v])=>{
                        
                        if (valObj.hasOwnProperty(k.match(/[^\d]+/)[0]))  (valObj[k.match(/[^\d]+/)[0]]).push(parseInt(v)) ;
                        else valObj[k.match(/[^\d]+/)[0]] = [parseInt(v)] ;
                    })

                    filterStr.forEach(k => valObj[k.match(/[^\d]+/)[0]] = f.call(this,valObj[k.match(/[^\d]+/)[0]]));
                    result[date][e] = valObj ;
                }) ;
            }
            else{
                result[dt] = {}
            }
            }) 
    })
    return result
}

function dataSnippet(param,label,obj={},groupBy="",g = (arr) => arr, f=reducer){
  return {[label] : g.call(this, Object.entries(extractStats([param],(arr) => arr.reduce((a,b)=>a+b),obj)).map(([k,o])=> Object.values(o).map((o)=> o[param])).map(arr=>f.call(this, arr)),obj,groupBy,f)}; 
}

function groupData(arr,days,f){
    let dateGroups = [];
    for (let i=0; i<arr.length; i+=days){
        let lastIndex = i+days <= arr.length ? i+days : i+(arr.length-i) 
        dateGroups.push(arr.slice(i,lastIndex))
    }
    return dateGroups.length? f.call(this,dateGroups) : [] ;
}

function getDateRange(groupBy=1,today = new Date(),firstday=new Date(new Date(pastWorkoutsArray[0][0].split(" ")[0]) - new Date(pastWorkoutsArray[0][0].split(" ")[0]).getDay()*24*60*60*1000)){
    const dates =  [];
    let ms = 24*60*60*1000;
    let days = (today-firstday)/ms;
    for (let i=0; i<=days;i++){ 
        dates.push(firstday.toLocaleDateString());
        firstday = new Date(firstday.getTime()+ms); 
    } 
    return groupData.call(this,dates,groupBy,arr=>arr.sort((a,b)=>new Date(a) - new Date(b)))
}

function handleDirClick(e){
    let i = e.target.className.includes("next") ? 1 : -1 ;
    currentIndex = currentIndex+(i);
    if (currentIndex === 0 && e.target.className.includes("prev")){
        e.target.style.color = "grey";
        e.target.removeEventListener("click", handleDirClick)
    }
    if (currentIndex === allDatesArr.length-1 && e.target.className.includes("next")){
        e.target.style.color = "grey";
        e.target.removeEventListener("click", handleDirClick);
    }
    if (e.target.previousElementSibling?.style.color === "grey" && e.target.className.includes("next")) {
        e.target.previousElementSibling.style.color = "white";
        e.target.previousElementSibling.addEventListener("click", handleDirClick)
    }
    if (e.target.nextElementSibling?.style.color === "grey" && e.target.className.includes("prev")) {
        e.target.nextElementSibling.style.color = "white";
        e.target.nextElementSibling.addEventListener("click", handleDirClick);
    }
    let filterElement =  e.target.parentElement.id.includes("daily") ?  dailyFilterOptions : e.target.parentElement.id.includes("weekly") ? weeklyFilterOptions : monthlyFilterOptions ;
    let stat = filterElement.value;
    let label = filterElement.selectedOptions[0].textContent.toLowerCase();
    let chunk = filterElement.id.replace("filteroptions","");
    filterElement.parentElement.lastElementChild.firstElementChild.firstElementChild.remove();
    filterElement.parentElement.lastElementChild.lastElementChild.lastElementChild.remove();
    graphics(filterElement.parentElement.lastElementChild.firstElementChild,filterElement.parentElement.lastElementChild.lastElementChild)([{[label]: statsByChunk(stat,chunk)}],xAxisLabelArr,chartLegend);
}

function handleStatChange(e){
    let targetElem = e.target.nextElementSibling;
    targetElem.firstElementChild.firstElementChild.remove();
    targetElem.lastElementChild.lastElementChild.remove();
    let stat = e.target.value;
    let name = e.target.selectedOptions[0].textContent.toLowerCase();
    if (e.target.id.includes("daily")) graphics(dailyOrCustom.lastElementChild.firstElementChild,dailyOrCustom.lastElementChild.lastElementChild)([{[name]: statsByChunk(stat,"daily")}],xAxisLabelArr,chartLegend);
    if (e.target.id.includes("weekly")) graphics(weeklyTrends.lastElementChild.firstElementChild,weeklyTrends.lastElementChild.lastElementChild)([{[name]: statsByChunk(stat,"weekly")}],xAxisLabelArr.chartLegend);
    if (e.target.id.includes("monthly")) graphics(monthlyTrends.lastElementChild.firstElementChild,monthlyTrends.lastElementChild.lastElementChild)([{[name]: statsByChunk(stat,"monthly")}],xAxisLabelArr,chartLegend);
}

mainFilterRadios.forEach((el)=> el.addEventListener("focus", loadMainFilter));
mainFilterOptions.addEventListener("change",()=>{
    dailyOrCustom.lastElementChild.firstElementChild.replaceChildren(),dailyOrCustom.lastElementChild.lastElementChild.replaceChildren();
    graphics(dailyOrCustom.lastElementChild.firstElementChild,dailyOrCustom.lastElementChild.lastElementChild)([{volume: statsByChunk(dailyFilterOptions.value,"daily")}],xAxisLabelArr,chartLegend);
    weeklyTrends.lastElementChild.firstElementChild.replaceChildren(),weeklyTrends.lastElementChild.lastElementChild.replaceChildren();
    graphics(weeklyTrends.lastElementChild.firstElementChild,weeklyTrends.lastElementChild.lastElementChild)([{volume: statsByChunk(weeklyFilterOptions.value,"weekly")}],xAxisLabelArr,chartLegend);
    monthlyTrends.lastElementChild.firstElementChild.replaceChildren(),monthlyTrends.lastElementChild.lastElementChild.replaceChildren();
    graphics(monthlyTrends.lastElementChild.firstElementChild,monthlyTrends.lastElementChild.lastElementChild)([{volume: statsByChunk(monthlyFilterOptions.value,"monthly")}],xAxisLabelArr,chartLegend);
})
// mainFilterOptions.previousElementSibling.querySelectorAll("input").forEach((el)=> el.addEventListener("blur", e => mainFilterOptions.replaceChildren()))
function loadMainFilter(e){
    mainFilterOptions.replaceChildren(); 
    loadOptions(mainFilterEntries[e.target.value],"option",mainFilterOptions)
}

function loadOptions (array,element,parentnode,options={}) {
  const fragment = document.createDocumentFragment();
  const newElement = document.createElement(element);
  array = [""].concat(array);
  for (let i=0; i<array.length;i++){
    let clone = newElement.cloneNode(true);
    clone.value = array[i];
    clone.textContent = array[i].replaceAll("_"," ");
    clone.id = array[i];
    fragment.append(clone)
  }
  parentnode.append(fragment)
}

function volMultiplier(i,array,ln,index){
    switch(i){
        case 0:{
            array[ln][index] = array[ln][index]*0.65;
            break;
        }
        case 1:{
            array[ln][index] = array[ln][index]*0.25;
            break;
        }
        case 2:{
            array[ln][index] = array[ln][index]*0.1;
            break;
        }
        default:{
            array[ln][index] = array[ln][index]*0.05;
            break;
        }
    }
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
