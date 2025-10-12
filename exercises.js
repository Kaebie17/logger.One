// debugger
const indexScript = document.getElementById("exercisesJS")
const script = document.createElement("script");
let exercises;
let exercisesDBpage = script.cloneNode(true);
indexScript.before(exercisesDBpage);
exercisesDBpage.src = "exercisesDB.js";

const switchListsDisp = (num=0) => {
  exerciseList.style.display = num === 0 ? "grid" : "none"
  suggestionsContainer.style.display = num < 2 ? "none" : "block";
  exerciseDetails.style.display = num < 2 ? "none" : "block" ;
  closeDetails.textContent = num === 1 ? "Add" : "Close"
  closeDetails.style.display = num===0 ? "none" : num===1 ? "flex" : "block";
  selectionListDisplay.style.display = num===0 ? "none" : num === 1 ? "block" : "none" ;
  saveExercises.style.display = num===0 ? "none" : num === 1 ? "flex" : "none" ;
}

// Creating custom element to choose workout program while displaying additional details.

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
    
    function optionEvent(event,type){
      // Add a property in the exercise DB to count the number of lifetime clicks on each exercise by user to sort bt most frequently done exercises..
      //counter increment logic to be implemented here and sorting to be done in loadOptions function. 
      event.target.classList.toggle("indent");
      event.target.classList.value.includes("indent") ? 
        (!CustomOptionElement.selectedOptionArr.includes(event.target.textContent) ? CustomOptionElement.selectedOptionArr.push(event.target.textContent) : "" ) : 
          CustomOptionElement.selectedOptionArr = CustomOptionElement.selectedOptionArr.filter(el => el !== event.target.textContent);
      event.target.removeEventListener(type, (event,type) => optionEvent(event,type));
    };
    
    function slotEvent(event,type){
      event.stopPropagation();
      let id = event.target.alt || event.target.id ;
      id = id.replaceAll(/[ ]|(?<!\d)-/g,"_").replaceAll(/[^-\w]/g,"").toLowerCase();
      const details = exerciseDB()[id];
      const {name,desc,video,categories,targets,equipment,ratings,tags} = {name: details.name, desc: details.description, video: details.media.videolinks || details.media.imagelinks || "./media/images/default-img.png" , categories:details.categories, targets : details.movers, equipment: details.equipment, ratings : [details.effectiveness, details.technicality, details.fatigue], tags: details.categories};
      switchListsDisp(2);
      closeDetails.textContent = "Close";
      legend.textContent = name;
      exerciseDetails.children["media"].children[0].src = video;
      exerciseDetails.children["description"].textContent = desc;
      exerciseDetails.children["ratings"].children[0].style.background =  linearGradient(ratings[0]);
      exerciseDetails.children["ratings"].children[1].style.background =  linearGradient(ratings[1]);
      exerciseDetails.children["ratings"].children[2].style.background =  linearGradient(ratings[2]);
      exerciseDetails.children["otherinfo"].children[0].children["targets"].textContent = targets;
      exerciseDetails.children["otherinfo"].children[1].children["equipment"].textContent = equipment;
      exerciseDetails.children["tags"].replaceChildren();
      suggestions.firstElementChild.replaceChildren();
      [targets[0],targets[1]].forEach(tag => {
        const _exerciseData = Object.values(exerciseDB());
        const suggestionsArray = [];
        let random = randomBetween(0,3);
        const taggedExercises = filterer(tag,_exerciseData.filter(e => e.name !== event.target.alt && e[["effectiveness","technicalality","fatigue"][random]] >= parseInt(ratings[random]) && e.categories.some(c => tags.includes(c))));
        const span = document.createElement("span"); 
        span.textContent = tag; 
        exerciseDetails.children["tags"].append(span);
        taggedExercises.slice(0,3).forEach(e => suggestionsArray.push(e));
        loadOptions(suggestionsArray,"custom-option-element",suggestions.firstElementChild, {value:"name", id:"name", width: ["","","",["100%","100%","100%","100%"]], src: ["media","imagelinks",0,"https://tse3.mm.bing.net/th?id=OIP.oJRcDq2AAsFYW1ab_OQJwgHaEK&pid=Api&P=0&h=180"], alt: "name"});
      });
      suggestions.firstElementChild.childNodes.forEach(el => {
        el.className = "makegrid" ;
        el.shadowRoot.children[1].onclick = (e) => slotEvent(e,type);
        el.shadowRoot.children[1].className = "gridChild";
      });
      event.target.removeEventListener(type, (event,type) => optionEvent(event,type));      
    };
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
    else if (name==="color"){
      this.option.style.color = newValue ;
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
  get color(){
    return this.getAttribute("color");
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
  set color(string){
    return this.setAttribute("color", string);
  }
}

CustomOptionElement.observedAttributes = ["value","id","src","alt","width","display","color","center"];
CustomOptionElement.selectedOptionArr = [];
CustomOptionElement.template = document.createElement("template");
CustomOptionElement.template.innerHTML = `<style>
div{
    width: 85%;
    height: 100%;
    display: flex;
    align-items: center;;
}
img{
    width: 15%;
    height: 95%;
    font-size: 0.5rem;
    grid-area: 1/1/1/1;
}
.indent{
    opacity: 80%;
    background-image: linear-gradient(to bottom right,var(--template-color-mid),white) ;
}
.gridChild{
    grid-area: 1/1/1/1;
    z-index: 1;
}
</style>

<div id="content"></div><slot name="right"></slot>`


customElements.define("custom-option-element" , CustomOptionElement );


const exerciseList = document.getElementById("exerciselist");
const exerciseDetails = document.getElementById("exercisedetails") ;
const suggestionsContainer = document.getElementById("suggestionscontainer") ;
const suggestions = document.getElementById("suggestions") ;
const closeDetails = document.getElementById("closedetails") ;
const doneSelection = document.getElementById("doneselection") ;
const saveExercises = document.getElementById("saveexercises") ;
const selectionListDisplay = document.getElementById("selectionlistdisplay") ;
const selectExercise = document.getElementById("exercises");
const searchExercise = document.getElementById("searchexercise");
const redirectHome = document.querySelector("#header > h1");
const existingTemplates = sessionStorage?.templates?.length>2 ? JSON.parse(sessionStorage.templates) : localStorage?.templates ? JSON.parse(localStorage.templates) : {};
const unitUsed = !localStorage?.savedSettings ? alert("Please update settings before proceeding") : JSON.parse(localStorage?.savedSettings)["unit"]; 

// A pre-built section to be attached to each option when hovered/dblclicked 


//redirect to home page
redirectHome.addEventListener("click" , home); 

// const showExerciseList

const close = (event) => {debugger;
  if (exerciseList.style.display === "none" && selectionListDisplay.style.display === "none") {switchListsDisp();}
  else if (exerciseList.style.display === "none" && selectionListDisplay.style.display === "block" && new URL(document.location).searchParams.size > 1) {
    loadOptions(Object.values(exerciseDB()),"custom-option-element",selectExercise,{value: "name", id:"name", src: ["media","imagelinks",0,""], alt: "name"});
    switchListsDisp();
    searchExercise.addEventListener("keyup", handleSearch);
  // logging new past workout from workoutlog page based edit workout flow-control
    if (sessionStorage?.restoreSelection){
      CustomOptionElement.selectedOptionArr = JSON.parse(sessionStorage.restoreSelection);
      const idArray = JSON.parse(sessionStorage.restoreSelection).map(el => el.toLowerCase().replaceAll(" ","_"));
      idArray.forEach(el => {document.getElementById(el.replaceAll(" ")).shadowRoot.children[el].classList.add("indent");})
    }
  } 
  else if (exerciseList.style.display === "none" && selectionListDisplay.style.display === "block"){
    switchListsDisp();
    // closeDetails.style.display = "none";
    // const url = new URL(document.location)
    // url.searchParams.set("new",true); // THIS IS CREATING PROBLEM AS ITS NOT ALLOWING POPULATING STORED DATA IN SELECTED EXERCISES
    // url.searchParams.delete("temp")
    // url.searchParams.delete("s")
    // url.searchParams.delete("e")
    // // delete CustomOptionElement.selectedOptionArr  ;
    // // closeDetails.removeEventListener(event.type,close);
    // sessionStorage.restoreSelection = JSON.stringify(CustomOptionElement.selectedOptionArr); 
    // // document.location = url;
    // // selectionListDisplay.style.display = "none";   
    // // exerciseList.style.display = "block";
    // document.location = url;
  }
  else {
    document.location = "index.html"; 
    delete CustomOptionElement.selectedOptionArr;
    sessionStorage.clear();
    closeDetails.removeEventListener(event.type,close)
  }    
} 

const doneSelectionFunction = (event) => {
  const allSelection = CustomOptionElement.selectedOptionArr;
  const prevSelection = sessionStorage?.restoreSelection ? JSON.parse(sessionStorage.restoreSelection) : []; 
  if(allSelection.join("") === prevSelection.join("")) {switchListsDisp(1); return;}
  const newSelection = prevSelection.length ? allSelection.filter(el => !prevSelection.includes(el)) : allSelection;
  const _exerciseData = Object.values(exerciseDB());
  if (!CustomOptionElement.selectedOptionArr.length) {
    alert("Please select at least one exercise to proceed.")
  }else{
    switchListsDisp(1);
    const exerciseDetails = newSelection.map(name => _exerciseData.find(e => e.name === name))
    sessionStorage.restoreSelection = JSON.stringify(CustomOptionElement.selectedOptionArr);
    // loadOptions (exerciseDetails, selectionListDisplay);
    const span = document.createElement("span");
    const button = document.createElement("button");
    loadOptions(exerciseDetails,"custom-option-element",selectionListDisplay,{value: "name", id:"name", src: ["media","imagelinks",0,""], alt: "name"});
    [...selectionListDisplay.children].filter(e => e.nodeName === "CUSTOM-OPTION-ELEMENT").forEach(elm => {
      let container = span.cloneNode("true");
      let delBtn = button.cloneNode("true");
      delBtn.textContent = "Delete"
      delBtn.onclick = removeSelectedExercise;
      container.id = elm.id+"_container";
      elm.before(container);
      container.append(elm);
      container.append(delBtn);
      [...elm.shadowRoot.children].forEach(el => {el.id ? el.onclick = "" : el.childElementCount? el.firstElementChild.onclick = "": ""; });
      elm.addEventListener("click", addData) ;
      elm.addEventListener("pointerdown", dragAction) ;
      // event ? doneSelection.removeEventListener(event.type, doneSelectionFunction)  : "" ;  
      if(!window.location.search.includes('new=true')){
        if(existingTemplates?.[sessionStorage.program] && Object.keys(existingTemplates?.[sessionStorage.program]).includes(elm.id)){elm.addEventListener("click", addData,{once: true}); elm.click(); } ;
      }
    })
  }
} 

const saveExercisesFunction = (event) => {
  const exercises = exerciseDB();
  const dataNodeObj = selectionListDisplay.querySelectorAll("#selectionlistdisplay > div");
  let dataNodes = dataNodeObj.length;
  let headerNodes = selectionListDisplay.querySelectorAll("#selectionlistdisplay > span").length; 
  const savedworkouts = {};
  let proceed = true; 
  let url;
  if(dataNodes===headerNodes){
    let searchParams = sessionStorage?.searchParams ? JSON.parse(sessionStorage?.searchParams) : "";
    if (searchParams.length > 1){
      url = "file:///C:/Users/krish/Desktop/Web%20Development/Capstone%20projects/Project%207%20-%20LoggerDotOne/logworkout.html";
      savedworkouts["start"] = searchParams[0] ; 
      savedworkouts["end"] = searchParams[1] ;
    }
    else {
      url = "file:///C:/Users/krish/Desktop/Web%20Development/Capstone%20projects/Project%207%20-%20LoggerDotOne/template.html";
    }
    dataNodeObj.forEach(dataEl => {
      const value = []
      let decendentObj = decendents(dataEl,1,"button","remove");  
      const key = dataEl.id;
      value.push(["targets", exercises[key]["movers"]])
      decendentObj[1].forEach(el => {
        el.name? value.push([el.name,el.value]):"";
      }) 
      const statsExport = getStats(value,["setnum","reps","weight","rir","rest","tut"],decendentObj[1]);
      const {totalSets, totalReps, totalWeight, totalVol, avgRIR, avgRest, avgTUT} = statsExport;
      if (totalReps==="error" || totalWeight==="error" || avgRest==="error" ){alert("Incorrect or incomplete data. Please enter correct information to proceed."); proceed=false; return}
      value.push(["setCount", totalSets],["repCount", totalReps],["load", totalWeight], ["vol", totalVol], ["meanRIR", avgRIR], ["meanRest", avgRest], ["MeanTUT", avgTUT] ) ;
      savedworkouts[key] = value;
    })
    savedworkouts["unit"] = unitUsed;
    if (!proceed) return;
    saveExercises.removeEventListener(event.type,saveExercisesFunction);
    sessionStorage.finalLog = JSON.stringify(savedworkouts);
    sessionStorage.restoreSelection = JSON.stringify(CustomOptionElement.selectedOptionArr);
    loc = new URL(url);
    loc.searchParams.set("eData","true");
    document.location = loc;
  }
  else{
    alert("Incomplete exercise data. Please add atleast one set to each exercise to proceed.");
  }
}

exercisesDBpage.onload = (e,urloption) => {
  let location = urloption||document.location;
  if(JSON.parse(new URL(location).searchParams.get("new"))){
    loadOptions(Object.values(exerciseDB()),"custom-option-element",selectExercise,{value: "name", id:"name", src: ["media","imagelinks",0,""], alt: "name"});
    switchListsDisp();
    searchExercise.addEventListener("keyup", handleSearch);
    sessionStorage.searchParams = JSON.stringify([...new URL(document.location).searchParams.values()]);
  // logging new past workout from workoutlog page based edit workout flow-control
    if (sessionStorage?.restoreSelection){
      CustomOptionElement.selectedOptionArr = JSON.parse(sessionStorage.restoreSelection);
      const idArray = JSON.parse(sessionStorage.restoreSelection).map(el => el.toLowerCase().replaceAll(" ","_"));
      idArray.forEach(el => {document.getElementById(el.replaceAll(" ")).shadowRoot.children[el].classList.add("indent");})
    }
  }
  // Editing exercise selection of a pre-defined workout template via template page
  else {
    // sessionStorage.program = new URL(document.location).searchParams.get("temp");
    let selection = sessionStorage?.restoreSelection ? JSON.parse(sessionStorage?.restoreSelection) : "";
    CustomOptionElement.selectedOptionArr = Object.keys(existingTemplates[sessionStorage.program]);
    CustomOptionElement.selectedOptionArr = CustomOptionElement.selectedOptionArr.map( el => testRegExp((rx,v)=>v.replaceAll(rx," "),"_",{falseVal:el,flags:"g"})(el));
    CustomOptionElement.selectedOptionArr = CustomOptionElement.selectedOptionArr.map(el => testRegExp((rx,v)=>v.replaceAll(rx,(i)=>i.toUpperCase()),/(\b[a-z])/ig)(el)); 
    sessionStorage.searchParams = JSON.stringify([...new URL(document.location).searchParams.values()]);
    doneSelectionFunction();
  }
  // closeDetails.addEventListener("touchend",close) // for mobile device 
  closeDetails.textContent = "Add"
  closeDetails.addEventListener("click",close)
  doneSelection.addEventListener("touchend", doneSelectionFunction) ; 
  doneSelection.addEventListener("click", doneSelectionFunction);
  saveExercises.addEventListener("click",saveExercisesFunction);
  
}


function loadOptions (array,element,parentnode,options) {
  
  const fragment = document.createDocumentFragment();
  const newElement = document.createElement(element);
  for (let i=0; i<array.length;i++){
    let clone = newElement.cloneNode(true);
    const entries = Object.entries(options);
    
    entries.forEach(([key,value]) => clone[key] = typeof value === "object" ? 
      nestedObjectArrayVal(array[i][value[0]],value[1],value[2],value[3]) : 
      key === "id" ?
      array[i][value].replaceAll(/[ ]|(?<!\d)-/g,"_").replaceAll(/[^-\w]/g,"").toLowerCase() :
      array[i][value]||value) ;

    fragment.append(clone)
  }
  parentnode.append(fragment)
}

function filterer(string,arr){
  let filteredArr = arr;
  const queryArr = string.match(/\w+/ig);
  for(let queryfragment of queryArr){
    let regex = new RegExp(queryfragment,"i");
    filteredArr = filteredArr.filter(el => { return regex.test(el.name)||regex.test(el.movers[0])||regex.test(el.categories)||regex.test(el.equipment)})    
  }
  return filteredArr;
}

function linearGradient(n){
  let k = parseInt(n);
  let j = parseFloat(n)-parseInt(n);
  let redVarinant = j!==0 ? "rgb(255 0 0 / j)" : "" ; 
  let arr = [];
  for (let i=1; i<=10; i++){
    let val = i > k && j ? redVarinant : i > k ? "transparent" : ["red","transparent"][i%2]   
    arr.push(val);
  }
  return `linear-gradient(70deg, ${arr[0]} 10%, ${arr[1]} 10% 20%, ${arr[2]} 20% 30%, ${arr[3]} 30% 40%, ${arr[4]} 40% 50%, ${arr[5]} 50% 60%, ${arr[6]} 60% 70%, ${arr[7]} 70% 80%, ${arr[8]} 80% 90%, ${arr[9]} 90%)`
}

function randomBetween(s,e){
  return s+Math.floor(Math.random()*(e-s))
}

function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}

function nestedObjectArrayVal(object,property,index,fallback){
  if (object){ 
    if (Array.isArray(object)) {
      return object[property][index] || fallback;
    }
    else{ 
      let values = Object.values(object)
      for(let i= 0 ; i< values.length ; i++){
        if(object.hasOwnProperty(property) && Array.isArray(values[i])){
          return values[i][index]||fallback;
        }
        else if(object.hasOwnProperty(property)){
          return values[i] || fallback;
        }
        else if(typeof values[i] === "object"){
          return nestedObjectArrayVal(values[i],property,index)
        }
        else {continue;}
      }
    }
  }
  else{
    return fallback
  }
}

const timeOptions = (i,id,name,string,loops,placeholder,step) => {
  let option=`<option>${placeholder}</option>` ;
  loops = step ? loops*step : loops
  let increment = step ? parseFloat((1/step).toFixed(1)) : 1 ;
  for(j=0; j<loops ; j+=increment) {
    let value = (j===0) ? "-" : `${j.toFixed(1)} ${string}` ;
    option += `<option value="${value.replace(" ","")}">${value}</option>`
  }  
  const elem = `<select id="${id}${placeholder}${i}" name="${name}">${option}</select>`;
  return elem;
}

const bodyweight = (e,refElem,i) => {
  e.stopPropagation();
  let bw = JSON.parse(localStorage.savedSettings)['bodywt'].split(" ")[1]-0;
  const targetElem = document.querySelector(`div[id="${refElem}"] [name="weight${i}"]`); 
  !targetElem.disabled ? (targetElem.disabled = true, targetElem.value = bw) : (targetElem.disabled = false, targetElem.value = "")
}
const typeMultiple = (e) => {
  e.stopPropagation();
  let targetEl = e.target.nodeName = "I" ? e.target : e.target.firstElementChild;     
  targetEl.textContent = targetEl.textContent === "1" ? "2" : "1" ;  
}
const autoAssignMultiple = (el1,el2,refElem) => {
  let type = exerciseDB()[refElem]["type"];
  if (type.length === 2){
    el1.textContent = "2";
    el2.textContent = "2";
  }
  else if (type[0] === "reps"){
    el2.textContent = "2";
  }
  else if (type[0] === "weight"){
    el1.textContent = "2";
  }
}
const content = (i,parent) => `
  <span id="line${i}">
    <input type="text" name="setnum${i}" value = ${i} disabled>
    <input type="number" name="reps${i}" placeholder="Reps" required>
    <p>x<i>1</i></p>
    <input type="number" name="weight${i}" placeholder="Load" required>
    <span><p><i>BW</i></p><p>x<i>1</i></p></span>
    ${timeOptions(i,parent,"rest"+i,"Min",60,"Rest",2)}
    ${timeOptions(i,parent,"tut"+i,"Sec",180,"TUT")}
    ${timeOptions(i,parent,"rir"+i,"",11,"RIR")}
    <input type="submit" class="remove" id="${i}" name="${parent}" onclick="removeSet(event,name)" value="X" disabled>
  </span>
  ` 
const addData = (event) => { 
  event.stopPropagation();
  const template = document.createElement("div");
  const button = document.createElement("button");
  template.id = event.target.id.match(/[\d\w]+[a-zA-Z]/g);
  // const repsMultiple = e
  // const loadMultiple = 
  let i = 0;
  template.innerHTML = content(i,template.id);
  template.append(button);
  button.previousElementSibling.children[2].addEventListener("click",(e)=>typeMultiple(e));
  button.previousElementSibling.children[4].firstElementChild.addEventListener("click",(e)=>bodyweight(e,template.id,i))
  button.previousElementSibling.children[4].lastElementChild.addEventListener("click",(e)=>typeMultiple(e));
  autoAssignMultiple(button.previousElementSibling.children[4].lastElementChild.lastElementChild, button.previousElementSibling.children[2].lastElementChild,template.id);
  const keyValPair = existingTemplates?.[sessionStorage.program]?.[template.id] || "";
  if (keyValPair && !window.location.search.includes('new=true')){
    repopulateValues(keyValPair,template,button); 
  }
  button.onclick = (e)=>{
    const referenceNode = e.target.parentElement ;
    let childNum = referenceNode.childElementCount-1; 
    if(Array.from(referenceNode.querySelectorAll(`input[required]`)).some(e => !e.value)){alert("Update sets and weight data to add new column."); return}
    const firstdecendents = decendents(referenceNode.firstElementChild,0,referenceNode.firstElementChild.firstElementChild.name,"remove");
    button.insertAdjacentHTML("beforebegin",content(childNum,template.id));
    button.previousElementSibling.children[2].addEventListener("click",(e)=>typeMultiple(e));
    button.previousElementSibling.children[4].firstElementChild.addEventListener("click",(e)=>bodyweight(e,template.id,i))
    button.previousElementSibling.children[4].lastElementChild.addEventListener("click",(e)=>typeMultiple(e));
    autoAssignMultiple(button.previousElementSibling.children[4].lastElementChild.lastElementChild, button.previousElementSibling.children[2].lastElementChild,template.id);
    button.previousElementSibling.children[4].firstElementChild.addEventListener("click",(e)=>bodyweight(e,template.id,childNum))
    if (childNum > 1){button.previousElementSibling.lastElementChild.disabled = false}
    const nextdecendents = decendents(referenceNode.querySelector(`#line${(childNum)}`),0,`setnum${(childNum)}`,"remove");   
    nextdecendents[0].forEach((el,i) => {let pastEl = firstdecendents[0][i]; if (pastEl.disabled){el.disabled=true}; pastEl.value ? el.value = pastEl.value :  pastEl.innerHTML} );
  };
  button.textContent = "Add Set"
  let container = document.getElementById(`${event.target.id}_container`);
  container.after(template);
  event.target.removeEventListener("click", addData);
  event.target.onclick = () => template.classList.toggle("hide");

}

const onmove = (event) => {
  let parentwidth = parseInt(window.getComputedStyle(selectionListDisplay).width); 
  let elemwidth =  parseInt(window.getComputedStyle(event.target).width);
  let btnwidth =  parseInt(window.getComputedStyle(event.target.nextElementSibling).width);
  let change = (elemwidth + event.movementX < parentwidth*0.8) ? 0 : (elemwidth + event.movementX > parentwidth*0.99) ? 0 : event.movementX;
  let font =  parseInt(window.getComputedStyle(event.target.nextElementSibling).fontSize);
  event.target.style.width =  `${elemwidth + change}px`;
  event.target.nextElementSibling.style.width = `${btnwidth - change}px`;
  event.target.nextElementSibling.style.fontSize = (font - change) > 12 || (font - change) < 0  ? font : `${font - change}px`;
}

const dragAction = (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.target.addEventListener("pointermove",(event) => onmove(event))
  const onup = event => event.target.removeEventListener("pointermove",(event) => onmove(event));
  event.target.addEventListener("pointerup",onup,{once:true})
  
}

const removeSet = (event, parent) => {
  const elm = event.target; 
  elm.classList.add("mark"); 
  document.querySelector(`#selectionlistdisplay > #${parent} > #line${elm.id}`).remove();
  remElements = Array.from(document.querySelectorAll(`#selectionlistdisplay > #${parent} > span`)).splice(elm.id);
  console.log(remElements);
  remElements.forEach(el => {
    el.name? el.name = el.name.replace(/\d+$/,el.name.match(/\d+$/g)[0]-1) : "";
    el.id? el.id = el.id.replace(/\d+$/,el.id.match(/\d+$/g)[0]-1) : "";
    Array.from(el.children).forEach (elchild => {
      if(elchild.name.includes("setnum")){
        elchild.value = parseInt(elchild.value) - 1;
      }
      elchild.id? elchild.id = elchild.id.replace(/\d+$/,elchild.id.match(/\d+$/g)[0]-1) : "";
      elchild.name? elchild.name = elchild.name.replace(/\d+$/,elchild.name.match(/\d+$/g)?.[0]-1||"") : "";
    })
  })        
}

function removeSelectedExercise(event){
  const id = event.target.previousElementSibling.id;
  const container = document.querySelector(`#selectionlistdisplay #${id}_container`) 
  const userInputArea = document.querySelectorAll(`#selectionlistdisplay #${id}`)?.[1];
  container.remove();
  CustomOptionElement.selectedOptionArr = CustomOptionElement.selectedOptionArr.filter(name => name.toLowerCase().replaceAll(" ","_") !== id);
  sessionStorage.restoreSelection = JSON.stringify(JSON.parse(sessionStorage.restoreSelection).filter(name => name.toLowerCase().replaceAll(" ","_") !== id))
  debugger
  if(exerciseList.querySelector(`#${id}`)){
    exerciseList.querySelector(`#${id}`).shadowRoot.children[`${id}`].classList.remove("indent");
  }
  userInputArea ? userInputArea.remove() : "";
  if (!selectionListDisplay.childElementCount) {
    switchListsDisp()
  };
}

function decendents(element,levels,...excludeList){
  const decendents = {};
  if(element.childElementCount > 0){
    decendents[0] = Array.from(element.children).filter(elem => !excludeList.includes(elem.id) && !excludeList.includes(elem.name) && !excludeList.includes(elem.localName) && !excludeList.some(c => elem.className.split(" ").includes(c)) );
    if (!decendents[0].length){
      decendents[0] = [] ; 
      return decendents;
    }
    for (let i = 1; i <= levels; i++){
      if (decendents[i-1].length > 0){
          decendents[i-1].forEach(child => {
            let children = child.children.length ? Array.from(child.children).filter(elem => !excludeList.includes(elem.id) && !excludeList.includes(elem.name) && !excludeList.includes(elem.localName) && !excludeList.some(c => elem.className.split(" ").includes(c)) ) : [];
            decendents[i] ? decendents[i].push(children) : decendents[i] = children; 
            decendents[i] = decendents[i].flat();
        });
      } else {
        decendents[i] = [];
      };
    }
  }
  return decendents;
}

function calculateField(AoA,filter,mainF,transform){
  const input = AoA.filter(([k,v])=> k.includes(filter));
  return function(op,...args){return mainF.call(this,transform.call(this,input,...args),op)}; 
 }


function getStats(array,exports,lineElms){
  let repMultiple = lineElms[2].lastElementChild.textContent;
  let weightMultiple = lineElms[4].lastElementChild.lastElementChild.textContent;
  let equipmentWt = lineElms[6].id.includes("barbell") ? parseFloat(JSON.parse(localStorage.savedSettings).bweight.split(" ")[0]) : lineElms[6].id.includes("dumbbell") ? parseFloat(JSON.parse(localStorage.savedSettings).dweight.split(" ")[0]) : 0 ;
  let allSets = calculateField(array,exports[0],val=>val,arr=>arr.length)();
  return {
    totalSets: allSets,
    totalReps: calculateField(array,exports[1],reducer,getValuesfromInputs)()*repMultiple,
    totalWeight: calculateField(array,exports[2],reducer,getValuesfromInputs)()*weightMultiple+(equipmentWt*allSets),
    totalVol: calculateField([],"",getVolume, () => (arr) => arr.reduce(([k1,v1],[k2,v2])=>["",v1+v2])[1])(array.filter(([k,v])=> k.includes(exports[2])))(array.filter(([k,v])=> k.includes(exports[1])),equipmentWt,repMultiple,weightMultiple),
    avgRIR: calculateField(array,exports[3],reducer,getValuesfromInputs)("average"),
    avgRest: calculateField(array,exports[4],reducer,getValuesfromInputs)("average"),
    avgTUT: calculateField(array,exports[5],reducer,getValuesfromInputs)("average"),
  };
}

function getValuesfromInputs(arr){
  arr = arr.map(([a,b]) => b==="-" ? [a,"0"] : [a,b]).flatMap(([a,b]) => {
    b = testRegExp((regx,text) => text.match(regx)[0],/^\d+.?\d+(?=\w)/g,{falseVal:b})(b||0) 
    return [parseFloat(b)]
  })
  return arr;
}

function reducer(arr,operation=""){
  if (arr.some(e => !/^\d/.test(e) )) {return "error"};
  if (operation === "average") return arr.reduce((a,b)=>(a+b))/arr.length;
  else return arr.reduce((a,b)=>a+b);
}

function getVolume(f,outerarr){
    return function(innerarr,...multiples){
        let args = [];
        for (let i=0; i<outerarr.length;i++){
            args.push(["v", (outerarr[i][1]*multiples[2])*(innerarr[i][1]*multiples[1])+multiples[0]]);
        }
        return f.call(this,args);
    }
}

function testRegExp(f,input,options = {falseVal: "",flags: ""}){
  let testExp = typeof input === "object" ? input : new RegExp(input,options.flags);
  return  function(testValue){
      return testExp.test(testValue) ?  f.call(this, testExp, testValue) : options.falseVal;
    } 
}

function repopulateValues(arr,elem,refElem){
  let sets = arr.filter(([k,v]) => k.includes("setnum"));
  let children = decendents(elem.querySelector(`#line0`),0,`setnum0`,"remove","span","p")[0];
  children.forEach(el => el.value = arr.find(([n,v]) => n===el.name)[1]);
  for (let i = 1; i<sets.length; i++){
    refElem.insertAdjacentHTML("beforebegin",content(i,elem.id));
    let children = decendents(elem.querySelector(`#line${i}`),0,`setnum${i}`,"remove","span","p")[0];
    children.forEach(el => el.value = arr.find(([n,v]) => n===el.name)[1]);
  }
}

function handleSearch(e){
  if (!/[\w]/.test(e.key) && !e.value) return;
  if(e.target.value){  
    const _exerciseData = Object.values(exerciseDB());
    let filteredData = filterer(e.target.value,_exerciseData)
    selectExercise.replaceChildren();
    loadOptions(filteredData,"custom-option-element",selectExercise,{value: "name", id:"name", src: ["media","imagelinks",0,""], alt: "name"});
  }
}
// return to the logworkout page using history mgmt and params