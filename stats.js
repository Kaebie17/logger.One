const container = document.getElementById("container");
const scrollArea = document.getElementById("scrollsvg")
const redirectHome = document.querySelector("#header > h1");
// Was a static <script async src="svgcode.js"> in stats.html with this
// file's own "load" listener attached down below -- on a fast (e.g. local
// file://) load, an async script can finish and fire "load" before this
// later-loading script even runs, let alone reaches the addEventListener
// call, so the listener attached to nothing and every chart below it
// silently never rendered. Creating the element here instead and setting
// its src immediately before attaching the listener -- both in the same
// synchronous run, before any yield to the event loop -- makes the race
// impossible; this is the same pattern index.js/pastworkout.js/logworkout.js
// already use for their own svgcode.js loads.
const svgloader = document.createElement("script");
const exercisesPage = document.getElementById("exercisesJS");
// Was document.getElementById("statsJS") -- functions.js now injects this
// script dynamically (see PAGE_SCRIPTS there) with no fixed id.
const statsPage = document.currentScript;
statsPage.before(svgloader);
svgloader.src = "svgcode.js";
let allExercises;

exercisesPage.onload =  allExercises = exerciseDB();

//redirect to home page
redirectHome.addEventListener("click" , home);


function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}

const pastWorkoutsObject = (window.workoutLogData||[]).sort(([k1,v1],[k2,v2])=> new Date(k1)-new Date(k2));
let d = new DataInterface();
d.new(Object.fromEntries(pastWorkoutsObject));

const partsObject = {delts: ["side-delts","front-delts","rear-delts"],chest:["upper-chest","lower-chest"],neck:["neck"],core:["core","obliques"],back:["lats","lower-traps","traps","rhomboids","low-back"],arms:["triceps","biceps","forearms"], legs:["quads","hams","calves"],glutes:["glutes"]}

// Unguarded JSON.parse(localStorage.nameMap) threw "undefined is not valid
// JSON" whenever this page loaded before nameMap had ever been written
// (it's only populated by index.js's recentWorkouts(), and only when
// there's workout data in the last 7 days) -- same missing-data guard as
// pastWorkoutsObject above already uses.
const nameMap = new Map(localStorage?.nameMap ? JSON.parse(localStorage.nameMap) : [])

let partsMap = new Map()//Object.entries(partsObject).map(([part,arr])=> [part,arr.map(e => nameMap.get(e)).reduce((a,b)=>a+b)]) 
// (key,fn,index=0,factor=1,g= ar => ar,r = ((a,b)=>a+b), res = "relative")
const getStat = ({stat,factor=1,r=((a,b) => (a*1||0)+(b*1||0)),e=1,s=0,res=""}) => {
  Object.entries(partsObject).forEach(([part,groups]) => groups.forEach(target => {
      let totalVal = d.getValue(target,stat,r,e,s);
      partsMap.get(part)? partsMap.set(part, partsMap.get(part)+totalVal*factor) : partsMap.set(part,totalVal*factor);
    })
  )
  if (!res){
    let sum = [...partsMap.values()].reduce((a,b)=>a+b)
    return [...partsMap].map(([k,v])=>[k,Math.round((v/sum)*100)])
  }
  else{
    return [...partsMap].map(([k,v])=>[k,Math.round(v)]);
  }
}

const labelStatArrVol = getStat({stat:"vol",factor:0.65});
partsMap = new Map();
const labelStatArrVolSec = getStat({stat:"vol",factor:0.25,e:2,s:1});
partsMap = new Map();
const labelStatArrReps = getStat({stat:"repCount"});
partsMap = new Map();
const labelStatArrSets = getStat({stat:"setCount"});
partsMap = new Map();
const labelStatArrLoad = getStat({stat:"load"});
partsMap = new Map();
// (a,b)=>(a+b)/2 as a .reduce() callback is NOT a mean -- it's a pairwise
// running halving, so later array elements are weighted more than earlier
// ones (e.g. reduce([10,20,30]) gives 22.5, not the true mean of 20). Using
// reduce's own running-index (3rd arg) gives the standard incremental-mean
// formula instead, which is order-independent and correct with no initial
// value needed: newMean = oldMean + (nextValue - oldMean)/(countSoFar).
const trueAverage = (a,b,i)=> (a*1||0) + ((b*1||0)-(a*1||0))/(i+1);
// This chart does NOT go through getStat -- getStat's cross-sub-name
// combining is a SUM (correct for Volume/Reps/Sets/Load, where "total
// across a muscle's sub-names" is genuinely additive), but an RIR average
// needs the OPPOSITE: averaging the sub-names' own averages together, so a
// muscle with three sub-names (delts: side/front/rear) isn't scored 3x
// higher than a muscle with one (neck) purely because of how many sub-name
// tags it happens to have in partsObject. A sub-name with zero matching
// exercises is excluded rather than counted as 0 -- otherwise an untrained
// sub-name would drag the part's average down as if it had been trained
// hard, instead of just not being represented yet. Reads "meanRIR" (each
// exercise's own real average across its own sets, already computed at
// save/import time) rather than "rir", which only ever matched an
// exercise's first set and silently ignored the rest.
const labelStatArr1RM = Object.entries(partsObject).map(([part,groups]) => {
  const subGroupAverages = groups
    .filter(target => d.byTarget(target,2,0).length > 0)
    .map(target => d.getValue(target,"meanRIR",trueAverage,2,0));
  return [part, subGroupAverages.length ? subGroupAverages.reduce(trueAverage) : null];
}).filter(([part,avg]) => avg !== null)
  // RIR is a manually-entered, uncapped number, not a fixed 0-10 scale --
  // clamping at 0 keeps an unusually high logged RIR from producing a
  // negative chart value instead of just flooring out at "not intense".
  .map(([part,avg]) => [part, Math.max(0, 10-avg).toFixed(2)*1]);
partsMap = new Map();
const labelStatArrIntensity = Object.entries(partsObject).map(([part,groups]) => {let arr = groups.map(target => d.byTarget(target).map(a =>{ return Object.keys(a[1]).map(k => (allExercises[k]["technicality"]*1 + allExercises[k]["fatigue"]*1 + d.get(a[0])["workoutIntensity"]*1)/3)}).flat()) ; let flatArr = arr.flat(); return [part, flatArr.length? (flatArr.reduce(trueAverage)).toFixed(1)*1 : 0]});
partsMap = new Map();

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
