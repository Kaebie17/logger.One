const container = document.getElementById("container");
const scrollArea = document.getElementById("scrollsvg")
const redirectHome = document.querySelector("#header > h1");
const svgloader = document.getElementById("svgcodeJS");
const exercisesPage = document.getElementById("exercisesJS");
const statsPage = document.getElementById("statsJS");
let allExercises;

exercisesPage.onload =  allExercises = exerciseDB();

//redirect to home page
redirectHome.addEventListener("click" , home);


function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}

const pastWorkoutsObject = localStorage?.workoutLogObject ? JSON.parse(localStorage.workoutLogObject).sort(([k1,v1],[k2,v2])=> new Date(k1)-new Date(k2)) : {};

const partsObject = {delts: ["side-delts","front-delts","rear-delts"],chest:["upper-chest","lower-chest"],neck:["neck"],core:["core","obliques"],back:["lats","lower-traps","traps/rhomboids","low-back"],arms:["triceps","biceps","forearms"], legs:["quads","hams","calves"],glutes:["glutes"]}

const nameMap =  new Map(JSON.parse(localStorage.nameMap))

let partsMap = new Map()//Object.entries(partsObject).map(([part,arr])=> [part,arr.map(e => nameMap.get(e)).reduce((a,b)=>a+b)]) 

const getStat = (key,fn,index=0,factor=1,g= ar => ar,r = ((a,b)=>a+b), res = "relative") => {
    
  pastWorkoutsObject.forEach(([k,obj]) => {
  let workoutMetric = obj[key];
  const movers = Object.values(workoutMetric).map(arr => arr[0][1][index]);
  const metricArr = g.call(this,Object.entries(workoutMetric).map(([k,arr],i) => fn(arr,k,i)));
  let combined = movers.map((e,i) => [e,metricArr[i]]).filter(([k,v])=> typeof v === "number");
  Object.entries(partsObject).forEach(([part,arr])=> arr.forEach(e => {let res = combined.find(([k,v])=> k===e); let exVal = partsMap.get(part); res ? partsMap.set(part, exVal ? [res[1]*factor,exVal].reduce(r) : (res[1]*factor).toFixed(2)*1) : ""}));
  // Object.entries(partsObject).forEach(([part,arr])=> partsMap.get(part) ? partsMap.set(part, Math.round(partsMap.get(part)+arr.map(e => combined.find(([k,v])=> k===e)[1]).reduce(r))) : partsMap.set(part, Math.round(arr.map(e => metricArr[movers.findIndex(i => i===e)]*factor||0).reduce(r))))
})
  if (res === "relative"){
    let sum = [...partsMap.values()].reduce((a,b)=>a+b)
    return [...partsMap].map(([k,v])=>[k,Math.round((v/sum)*100)])
  }
  if(res === "absolute"){
    return [...partsMap];
  }
}

const labelStatArrVol = getStat("workoutExercises",(arr)=>arr[arr.findIndex(e => e[0] === "vol")][1],0,0.65)
partsMap = new Map();
const labelStatArrVolSec = getStat("workoutExercises",(arr)=>arr[arr.findIndex(e => e[0] === "vol")][1],1,0.25)
partsMap = new Map();
const labelStatArrReps = getStat("workoutExercises",(arr)=>arr[arr.findIndex(e => e[0] === "repCount")][1])
partsMap = new Map();
const labelStatArrSets = getStat("workoutExercises",(arr)=>arr[arr.findIndex(e => e[0] === "setCount")][1])
partsMap = new Map();
const labelStatArrLoad = getStat("workoutExercises",(arr)=>arr[arr.findIndex(e => e[0] === "load")][1])
partsMap = new Map();
const labelStatArr1RM = getStat("workoutExercises",arr => arr.filter(([k,v]) => k.includes("rir")).map(([k,v])=>v).reduce((a,b)=>a*1+b*1)/arr[arr.findIndex(e => e[0] === "repCount")][1],0,1,ar => ar.map(e => e? (100-e.toFixed(2)*100)/10:""),(a,b)=>((a+b)/2).toFixed(1)*1,"absolute")
partsMap = new Map();
const labelStatArrIntensity = getStat("workoutExercises", (arr,k,i) => (allExercises[k]["technicality"]*1 + allExercises[k]["fatigue"]*1)/2 + (pastWorkoutsObject[i][1]["workoutIntensity"]*1)/(arr.length*10),0,1, (ar,i) =>  ar.map(e=> e),(a,b)=>((a+b)/2).toFixed(1)*1,"absolute");

svgloader.addEventListener("load",()=>{
  statsWebGraph(container,labelStatArrVol.sort((a,b) => b[1]-a[1]),"Primary Volume Distribution");
  statsWebGraph(container,labelStatArrVolSec.sort((a,b) => b[1]-a[1]),"Secondary Volume Distribution");
  statsWebGraph(container,labelStatArrReps.sort((a,b) => b[1]-a[1]),"Rep Distribution");
  statsWebGraph(container,labelStatArrSets.sort((a,b) => b[1]-a[1]),"Set Distribution");
  statsWebGraph(container,labelStatArrLoad.sort((a,b) => b[1]-a[1]),"Load Distribution");
  statsWebGraph(container,labelStatArr1RM.sort((a,b) => b[1]-a[1]),"Workout Intensity (RIR)","");
  statsWebGraph(container,labelStatArrIntensity.sort((a,b) => b[1]-a[1]),"Intensity (Exercise Choice)","");
  let fields = Array.from(container.children);
  fields.pop();
  console.log(fields)
  addScroll(scrollArea,fields)
})

container.addEventListener("touchstart",(e)=>{
  let touchStartX = e.touches[0].clientX;
  let touchStartY = e.touches[0].clientY;
  container.addEventListener("touchend",(z)=>{
    z.stopImmediatePropagation();
    let touchEndX = z.changedTouches[0].clientX;
    let touchEndY = z.changedTouches[0].clientY;
    let swipeDistanceX = touchEndX-touchStartX;
    let swipeDistanceY = Math.abs(touchEndY-touchStartY);
    let currentTab = [...scrollArea.firstElementChild.children].find(el => el.getAttribute("fill") === "black");
    let contentFieldTab = [...document.querySelectorAll("legend")].find(el => el.textContent === currentTab.id).parentElement;
    let nextTab = currentTab.nextElementSibling;
    let prevTab = currentTab.previousElementSibling;
    if (Math.abs(swipeDistanceX)>150 && swipeDistanceX < 0 && nextTab) {
      currentTab.setAttribute("fill","white");
      nextTab.setAttribute("fill","black");
      contentFieldTab.style.display="none";
      contentFieldTab.nextElementSibling.style.display="block";
    };
    if (Math.abs(swipeDistanceX)>150 && swipeDistanceX > 0 && prevTab) {
      currentTab.setAttribute("fill","white");
      prevTab.setAttribute("fill","black");
      contentFieldTab.style.display="none";
      contentFieldTab.previousElementSibling.style.display="block";
    };
  })
})
