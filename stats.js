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
let d = new DataInterface();
d.new(Object.fromEntries(pastWorkoutsObject));

const partsObject = {delts: ["side-delts","front-delts","rear-delts"],chest:["upper-chest","lower-chest"],neck:["neck"],core:["core","obliques"],back:["lats","lower-traps","traps","rhomboids","low-back"],arms:["triceps","biceps","forearms"], legs:["quads","hams","calves"],glutes:["glutes"]}

const nameMap =  new Map(JSON.parse(localStorage.nameMap))

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
const repsCountArr = getStat({stat:"repCount", res:"abs",e:2,r:(a,b)=>((a*1||0)+(b*1||0))/2}).filter(arr => arr[1]>=10);
partsMap = new Map()
const labelStatArr1RM = getStat({stat:"rir",res:"abs",e:2,r:(a,b)=>((a*1||0)+(b*1||0))/2}).filter(arr => arr[1]).flatMap(([k,v])=> {let ar = repsCountArr.find(([p,q])=>k===p) ; return ar ? [[k,(10*(1-v*10/ar[1]).toFixed(2)*1).toFixed(2)*1]] : []}) ;
partsMap = new Map();
const labelStatArrIntensity = Object.entries(partsObject).map(([part,groups]) => {let arr = groups.map(target => d.byTarget(target).map(a =>{ return Object.keys(a[1]).map(k => (allExercises[k]["technicality"]*1 + allExercises[k]["fatigue"]*1 + d.get(a[0])["workoutIntensity"]*1)/3)}).flat()) ; return arr.length? [part,arr.flat().reduce((a,b)=>(((a*1||0)+(b*1||0))/2).toFixed(1)*1)] : 0});
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
