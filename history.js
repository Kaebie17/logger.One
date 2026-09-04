const styleStr = `
div{
    display: flex;
    flex-wrap:wrap;
    align-content: center;
    justify-content: start;
}
img{
    font-size: 0.5rem;
    border: solid 1px white;
}
fieldset:first-child{
    width: 55vw;
}
p{
    width: inherit;
    margin:0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.75rem;
}
.indent{
    opacity: 80%;
    background-image: linear-gradient(to bottom right,var(--template-color-mid),white) ;
}
`
class CustomOptionElement extends CustomHTMLElement {
  constructor(){
    super();
    CustomOptionElement.template.content.children[0].innerHTML = styleStr;
  }
}

customElements.define("custom-option-element" , CustomOptionElement);

// Was document.getElementById("historyJS") -- functions.js now injects
// this script dynamically (see PAGE_SCRIPTS there) with no fixed id.
const defaultScript = document.currentScript;
const historyElem = document.getElementById("history");
const logItem = document.createElement("custom-option-element");
const coverItem = document.createElement("span");
const redirectHome = document.querySelector("#header > h1");
const pastWorkouts = (window.workoutLogData||[]).sort(([k1,v1],[k2,v2])=> new Date(k1) - new Date(k2));
let numOfWorkouts = pastWorkouts.length; 
// historyElem.style.gridTemplateRows = `repeat(${numOfWorkouts})`

//redirect to home page
redirectHome.addEventListener("click" , home);

logItem.width = ["60vw","fit-content","30vw","fit-content"];
logItem.onclick = null;
logItem.ontouchend = null;
let svgcode = document.createElement("script");
defaultScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", () => {
    for (i=0; i<numOfWorkouts; i++){
      addContent(i)
    }
})

function addContent(i){
  const {date,name,duration,targets,sets,reps,vol,max,intensityValue,fatigueValue} = extractData([pastWorkouts[i]]);
  const clone = logItem.cloneNode(true);
  const cloneCover = coverItem.cloneNode(true); 
  const imgSlot = clone.shadowRoot.querySelector("slot[name='right']").firstElementChild;
  clone.inserthtml = `<fieldset><p>${targets}</p><legend>${name}</legend></fieldset><fieldset><p>${fatigueValue}</p><legend>Fatigue</legend></fieldset><fieldset><p>${intensityValue}</p><legend>Intensity</legend></fieldset><fieldset><p>${sets}</p><legend>Sets</legend></fieldset><fieldset><p>${reps}</p><legend>Reps</legend></fieldset><fieldset><p>${max}</p><legend>Max</legend></fieldset><fieldset><p>${vol}</p><legend>Volume</legend></fieldset>`;
  historyElem.firstElementChild.before(clone,cloneCover);
  clone.style.gridArea = `${i+1}/1/${i+2}/1`;
  cloneCover.style.gridArea = `${i+1}/1/${i+2}/1`;
  cloneCover.className = "date-area";
  cloneCover.textContent = date;
  cloneCover.onclick = ()=>handleClick([pastWorkouts[i]]);
  const divEl = document.createElement("img"); 
  imgSlot.src = "./media/images/default_img.png"
  imgSlot.id = "imgcontainer"+i;
  imgSlot.style.height = "10vh";
  imgSlot.addEventListener("click",(e)=>{
    let imgFile = document.createElement("input");
    imgFile.type = "file";
    imgFile.click();
    imgFile.addEventListener("change", () => {
      handleNewImage(imgFile.files[0], e.target);
    }) 
  })
}

function extractData(object){
  const logEntry = Object.fromEntries(object);
  let date = Object.keys(logEntry)[0];
  const name = logEntry[date]["workoutName"];
  const duration = (new Date(logEntry[date]["workoutDate"] + ", "+ logEntry[date]["workoutEndTime"]) - new Date(logEntry[date]["workoutDate"] + ", "+ logEntry[date]["workoutStartTime"]))/(60*1000);
  const exerciseData = logEntry[date]["workoutExercises"];
  const intensityValue = logEntry[date]["workoutIntensity"];
  const fatigueValue = Object.keys(exerciseData).map(e => exerciseDB()[e]["fatigue"]).reduce((a,b) => a+b);
  delete exerciseData.date;
  delete exerciseData.time;
  const exerciseDataValues = Object.values(exerciseData).flat();
  let ar = [];
  exerciseDataValues.filter(([k,v])=>k==="targets").flatMap(([k,v])=> v ).forEach(v => !ar.includes(v)? ar.push(v) : "") ;
  const targets = ar.join(", ");
  const sets = exerciseDataValues.filter(([k,v])=>k.includes("setnum")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const reps = exerciseDataValues.filter(([k,v])=>k.includes("reps")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const vol = exerciseDataValues.filter(([k,v])=>k.includes("vol")).flatMap(([k,v])=> parseFloat(v)).reduce((a,b)=>a+b);
  const max = Math.max(...exerciseDataValues.filter(([k,v])=>k.includes("weight")).flatMap(([k,v])=> parseFloat(v)));
  date = new Date(date).toLocaleDateString();
  return {date,name,duration,targets,sets,reps,vol,max,intensityValue,fatigueValue};
}

function handleClick(object){
  sessionStorage.finalLog = JSON.stringify(object);
  document.location = "./pastworkout.html"
}

function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}

function handleNewImage(imgObject,elem){
  let reader = new FileReader;
  reader.onload = () => {
    let newImage = reader.result;
    elem.src = newImage;
  }
  reader.readAsDataURL(imgObject);
}