class CustomOptionElement extends HTMLElement {
  constructor(){
    super();
        
    this.attachShadow({mode:"open"});
    this.shadowRoot.append(CustomOptionElement.template.content.cloneNode(true));

    this.option = this.shadowRoot.querySelector("#content");
    let rightSlot = this.shadowRoot.querySelector("slot[name='right']");
    this.slotElem = document.createElement("img");

    rightSlot.append(this.slotElem);

    this.option.ontouchleave = (event) => optionEvent(event,"touchleave"); 
    this.option.onclick = (event) => optionEvent(event,"click");
    this.slotElem.ontouchleave = (event) => slotEvent(event,"touchleave"); 
    this.slotElem.onclick = (event) => slotEvent(event,"click");
    
  }
    
  attributeChangedCallback(name,oldValue,newValue){
    if (name==="value"){
      this.option.textContent = newValue;
    }
    else if (name==="id"){
      this.option.id = newValue;
      this.slotElem.id = `${newValue}_image`;
    }
    else if (name==="src"){
      this.slotElem.src = newValue;
    }
    else if (name==="alt"){
      this.slotElem.alt = newValue;
    }
    else if (name==="width"){
      newValue = newValue.split(",");
      if (newValue.length === 4 && newValue.every(e=>e!=='')){
        this.option.style.width = newValue[0];
        this.option.style.height = newValue[1];
        this.slotElem.style.width =  newValue[2];
        this.slotElem.style.height = newValue[3] ;
      }
    }
    else if (name==="display"){
      if (newValue === "content"){
        this.slotElem.setAttribute("style", `display: none`);
      }
      else if (newValue === "image"){
        this.option.setAttribute("style", `display: none`);
      }
    }
    else if (name==="node"){
        this.option.append(document.createElement(newValue));
    }
    else if (name==="inserthtml"){
        this.option.innerHTML = newValue;
    }
  }
  get value(){
    return this.getAttribute("value");
  }
  get id(){
    return this.getAttribute("id");
  }
  get src(){
    return this.getAttribute("src");
  }
  get alt(){
    return this.getAttribute("alt");
  }
  get width(){
    return this.getAttribute("width");
  }
  get display(){
    return this.getAttribute("display");
  }
  get node(){
    return this.getAttribute("node");
  }
  get inserthtml(){
    return this.getAttribute("inserthtml");
  }
  set value(text){
    return this.setAttribute("value",text);
  }
  set id(text){
    return this.setAttribute("id",text);
  }
  set src(link){
    return this.setAttribute("src",link);
  }
  set alt(text){
    return this.setAttribute("alt",text);
  }
  set width(array){
    return this.setAttribute("width",array);
  }
  set display(string){
    return this.setAttribute("display", string);
  }
  set node(nodename){
    return this.setAttribute("node", nodename);
  }
  set inserthtml(htmlstring){
    return this.setAttribute("inserthtml", htmlstring);
  }
}

CustomOptionElement.observedAttributes = ["value","id","src","alt","width","display","node","inserthtml"];
CustomOptionElement.template = document.createElement("template");
CustomOptionElement.template.innerHTML = `<style>
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
</style>

<div id="content"></div><slot name="right"></slot>`


customElements.define("custom-option-element" , CustomOptionElement );

const defaultScript = document.getElementById("historyJS")
const historyElem = document.getElementById("history");
const logItem = document.createElement("custom-option-element");
const coverItem = document.createElement("span");
const redirectHome = document.querySelector("#header > h1");
const pastWorkouts = JSON.parse(localStorage?.workoutLogObject||"[]");
let numOfWorkouts = pastWorkouts.length; 
// historyElem.style.gridTemplateRows = `repeat(${numOfWorkouts})`

//redirect to home page
redirectHome.addEventListener("click" , home);

logItem.width = ["60vw","fit-content","40vw","fit-content"];
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
  const {date,name,duration,targets,sets,reps,vol,max} = extractData([pastWorkouts[i]]);
  const clone = logItem.cloneNode(true);
  const cloneCover = coverItem.cloneNode(true); 
  const content = logItem.shadowRoot.getElementById("content");
  clone.inserthtml = `<fieldset><p>${targets}</p><legend>${name}</legend></fieldset><fieldset><p>200</p><legend>Fatigue</legend></fieldset><fieldset><p>7</p><legend>Intensity</legend></fieldset><fieldset><p>${sets}</p><legend>Sets</legend></fieldset><fieldset><p>${reps}</p><legend>Reps</legend></fieldset><fieldset><p>${max}</p><legend>Max</legend></fieldset><fieldset><p>${vol}</p><legend>Volume</legend></fieldset>`;
  historyElem.firstElementChild.before(clone,cloneCover);
  clone.style.gridArea = `${i+1}/1/${i+2}/1`;
  cloneCover.style.gridArea = `${i+1}/1/${i+2}/1`;
  cloneCover.className = "date-area";
  cloneCover.textContent = date;
  cloneCover.onclick = ()=>handleClick([pastWorkouts[i]]);
  let h = window.getComputedStyle(clone).height;
  const divEl = document.createElement("div"); 
  const {frontsvg, backsvg} =  humanFigure("12vw",h);
  divEl.append(frontsvg,backsvg);
  divEl.id = "svgcontainer"
  divEl.style.width = "fit-content";  
  divEl.slot= "right"
  clone.append(divEl);
}

function extractData(object){
  const logEntry = Object.fromEntries(object);
  let date = Object.keys(logEntry)[0];
  const name = logEntry[date]["workoutName"];
  const duration = (logEntry[date]["workoutEndTime"] - logEntry[date]["workoutStartTime"])/3600;
  const exerciseData = logEntry[date]["workoutExercises"];
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
  return {date,name,duration,targets,sets,reps,vol,max};
}

function handleClick(object){
  sessionStorage.finalLog = JSON.stringify(object);
  document.location = "file:///C:/Users/krish/Desktop/Web%20Development/Capstone%20projects/Project%207%20-%20LoggerDotOne/pastworkout.html"
}

function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}