
// Was document.getElementById("exercisesJS") -- functions.js now injects
// this script dynamically (see PAGE_SCRIPTS there) with no fixed id.
const indexScript = document.currentScript;
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
  // Was display:none at num===0 (just browsing the list, nothing selected
  // yet) -- close()'s own fallback branch already does the right thing
  // there (navigates back to index.html), so this was only ever a
  // visibility bug, not a functionality one. Hiding it left the footer
  // with nothing visible in it at all on first load, collapsing to a
  // near-invisible sliver instead of the normal-looking bar every other
  // page always shows. Always "flex" now (not the old "flex"/"block" split
  // either) so it renders as the same chip .footer-row > a styles every
  // other footer link as, in every state, not just num===1.
  closeDetails.style.display = "flex";
  selectionListDisplay.style.display = num===0 ? "none" : num === 1 ? "block" : "none" ;
  saveExercises.style.display = num===0 ? "none" : num === 1 ? "flex" : "none" ;
}

// Creating custom element to choose workout program while displaying additional details.
   
class CustomOptionElement extends CustomHTMLElement{
    constructor(){
        super();
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
}

customElements.define("custom-option-element" , CustomOptionElement );
CustomOptionElement.selectedOptionArr = [];


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
const existingTemplates = sessionStorage?.templates?.length>2 ? JSON.parse(sessionStorage.templates) : (window.templatesData || {});
// Was a blocking alert() here if savedSettings was missing entirely, with
// nothing the user could actually do about it except leave the page --
// ensureWeightSettings() (functions.js), awaited at the top of addData()
// below, replaces this with an inline popup that actually lets them fill
// the missing fields in and continue, instead of just being told to.

// A pre-built section to be attached to each option when hovered/dblclicked 


//redirect to home page
redirectHome.addEventListener("click" , home);

// #selectionlistdisplay is its own overflow-y:scroll container (not the
// page itself, which html{position:fixed} already keeps the browser from
// natively scrolling -- see styles.css). Focusing an input inside it still
// triggers the browser's OWN "scroll this into view" against that nearest
// scrollable ancestor, independent of our own --vh keyboard-aware resize
// (setRealViewportHeight, functions.js). For the first selected exercise's
// rows -- sitting right at the top of an initially near-empty list -- that
// native scroll is a no-op, nothing visibly happens. For the second
// exercise onward, its rows sit further down and actually need scrolling,
// so the native scroll runs for real -- and if it runs before --vh's own
// resize (driven by visualViewport's resize event) has settled for the
// now-keyboard-shrunk viewport, it scrolls against stale dimensions,
// landing the footer up near the header with unpainted space below it
// (reported: exercises.html, second exercise onward). Doing the scroll
// ourselves after two animation frames (long enough for the resize to have
// already fired and laid out) replaces the native one instead of racing it.
selectionListDisplay.addEventListener("focusin", (e) => {
  if (e.target.tagName !== "INPUT" && e.target.tagName !== "SELECT") return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    e.target.scrollIntoView({block: "center", behavior: "instant"});
  }));
});

// const showExerciseList

const close = (event) => {
  if (exerciseList.style.display === "none" && selectionListDisplay.style.display === "none") {switchListsDisp();}
  else if (exerciseList.style.display === "none" && selectionListDisplay.style.display === "block" && new URL(document.location).searchParams.get("new")!=="true") {
    loadOptions(Object.values(exerciseDB()),"custom-option-element",selectExercise,{value: "name", id:"name", src: ["media","imagelinks",0,""], alt: "name"});
    switchListsDisp();
    searchExercise.addEventListener("keyup", handleSearch);
  // logging new past workout from workoutlog page based edit workout flow-control
    if (sessionStorage?.restoreSelection){
      CustomOptionElement.selectedOptionArr = JSON.parse(sessionStorage.restoreSelection);
      const idArray = JSON.parse(sessionStorage.restoreSelection).map(el => nameToId(el));
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

// The real saved template/workout for the current program, OR -- when it
// hasn't actually been persisted yet (still mid first-time creation, or a
// brand-new ad-hoc past workout) -- the selection this exact page's own
// saveExercisesFunction just wrote to sessionStorage.finalLog before the
// eData round trip. start/end (present only on a logworkout.html-originated
// round trip) aren't real exercise keys, so they're stripped the same way
// logworkout.js itself always strips them before a workout becomes
// template data. Shared by exercisesDBpage.onload (to know what to
// pre-populate the selection list with) and doneSelectionFunction (to know
// which items should auto-open pre-filled instead of blank).
function getEffectiveTemplateData(){
  if (existingTemplates?.[sessionStorage.program]) return existingTemplates[sessionStorage.program];
  if (sessionStorage.finalLog){
    const {start, end, ...rest} = JSON.parse(sessionStorage.finalLog);
    return rest;
  }
  return undefined;
}

const doneSelectionFunction = (event) => {
  const allSelection = CustomOptionElement.selectedOptionArr;
  const prevSelection = sessionStorage?.restoreSelection ? JSON.parse(sessionStorage.restoreSelection) : []; 
  if(allSelection.join("") === prevSelection.join("")) {switchListsDisp(1); return;}
  const newSelection = prevSelection.length ? allSelection.filter(el => !prevSelection.includes(el)) : allSelection;
  const _exerciseData = exerciseDB();
  if (!CustomOptionElement.selectedOptionArr.length) {
    alert("Please select at least one exercise to proceed.")
  }else{
    switchListsDisp(1);
    const exerciseDetails = newSelection.map(e => nameToId(e)).map(k => _exerciseData[k])
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
        const effectiveTemplateData = getEffectiveTemplateData();
        if(effectiveTemplateData && Object.keys(effectiveTemplateData).includes(elm.id)){elm.addEventListener("click", addData,{once: true}); elm.click(); } ;
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
      url = "logworkout.html";
      savedworkouts["start"] = searchParams[0] ;
      savedworkouts["end"] = searchParams[1] ;
    }
    else {
      url = "template.html";
    }
    dataNodeObj.forEach(dataEl => {
      const value = []
      let decendentObj = decendents(dataEl,1,"button","remove");
      const key = dataEl.id;
      value.push(["targets", exercises[key]["movers"]])
      decendentObj[1].forEach(el => {
        el.name? value.push([el.name,el.value]):"";
        if(el.nodeName==="SPAN") {
          let i = value.findIndex(([k,v])=> k==="wtMultiple") 
          i>=0 ? "" : value.push(["wtMultiple", el.lastElementChild.lastElementChild.textContent]);
        }
        if(el.nodeName==="P") {
          let i = value.findIndex(([k,v])=> k==="repMultiple") 
          i>=0 ? "" : value.push(["repMultiple", el.lastElementChild.textContent]);
        }
      }) 
      const isIso = exercises[key]?.type === "isometric";
      const statsExport = getStats(value,["setnum","reps","weight","rir","rest","tut"],decendentObj[1],isIso);
      const {totalSets, totalReps, totalWeight, totalVol, avgRIR, avgRest, avgTUT} = statsExport;
      if (totalReps==="error" || totalWeight==="error" || avgRest==="error" ){alert("Incorrect or incomplete data. Please enter correct information to proceed."); proceed=false; return}
      value.push(["setCount", totalSets],["repCount", totalReps],["load", totalWeight], ["vol", totalVol], ["meanRIR", avgRIR], ["meanRest", avgRest], ["MeanTUT", avgTUT] ) ;
      savedworkouts[key] = value;
    })
    // Was the stale unitUsed const (computed once at script load) -- if
    // settings were only just completed via ensureWeightSettings() this
    // same session, unitUsed still held whatever it evaluated to before
    // that (undefined, if savedSettings didn't exist at all yet). Reading
    // fresh here reflects a mid-session settings completion correctly.
    savedworkouts["unit"] = JSON.parse(localStorage.savedSettings || "{}").unit;
    if (!proceed) return;
    saveExercises.removeEventListener(event.type,saveExercisesFunction);
    sessionStorage.finalLog = JSON.stringify(savedworkouts);
    sessionStorage.restoreSelection = JSON.stringify(CustomOptionElement.selectedOptionArr);
    loc = new URL(url, document.location);
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
      const idArray = JSON.parse(sessionStorage.restoreSelection).map(el => nameToId(el));
      idArray.forEach(el => {document.getElementById(el.replaceAll(" ")).shadowRoot.children[el].classList.add("indent");})
    }
  }
  // Editing exercise selection of a pre-defined workout template via template page
  else {
    // sessionStorage.program = new URL(document.location).searchParams.get("temp");
    // let selection = sessionStorage?.restoreSelection ? JSON.parse(sessionStorage?.restoreSelection) : "";
    // Falls back to sessionStorage.finalLog (see getEffectiveTemplateData)
    // when the program hasn't actually been saved as a template yet --
    // still mid first-time creation (template.html) or a brand-new ad-hoc
    // past workout (logworkout.html). Without that fallback,
    // Object.keys(undefined) below threw, aborting before
    // doneSelectionFunction() ever ran -- which is what left the selection
    // list empty and the footer stuck on its default Close-only state
    // instead of showing Add/Save with the selection restored.
    let templateData = getEffectiveTemplateData();
    sessionStorage.unit = templateData?.["unit"];
    sessionStorage.unit ? delete templateData["unit"] : ""
    // Was el.capitalizeAllFirst("_") -- reconstructing a "clean" name from
    // the key (underscores to spaces, title-case) instead of reading the
    // real name back from the database. That only worked while every name
    // was itself just underscore-separated words with no other punctuation;
    // now that names can include things like "(Flat)" or "Farmer's", the
    // reconstructed version silently stops matching the actual rendered
    // text (a fresh click on the same exercise produces the real name),
    // so the two can't recognize each other as the same selection.
    CustomOptionElement.selectedOptionArr = Object.keys(templateData).map(k => exerciseDB()[k].name);
    sessionStorage.searchParams = JSON.stringify([...new URL(document.location).searchParams.values()]);
    doneSelectionFunction();
  }
  // closeDetails.addEventListener("touchend",close) // for mobile device
  // Was an unconditional closeDetails.textContent = "Add" here, stomping
  // switchListsDisp's own correct per-state label right after either
  // branch above already set it properly (num=0 -> "Close" for a brand
  // new selection, num=1 -> "Add" once an existing template's exercises
  // are pre-loaded) -- always showing "Add" even on first load, when the
  // button's actual behavior (close()'s fallback branch) is to leave the
  // page, not add anything.
  closeDetails.addEventListener("click",close)
  doneSelection.addEventListener("touchend", doneSelectionFunction) ; 
  doneSelection.addEventListener("click", doneSelectionFunction);
  saveExercises.addEventListener("click",saveExercisesFunction);
  
}


function loadOptions (array,element,parentnode,options) {
  array = array.filter(o => typeof o !== "undefined");
  const fragment = document.createDocumentFragment();
  const newElement = document.createElement(element);
  for (let i=0; i<array.length;i++){
    let clone = newElement.cloneNode(true);
    const entries = Object.entries(options);
    
    entries.forEach(([key,value]) => clone[key] = typeof value === "object" ? 
      nestedObjectArrayVal(array[i][value[0]],value[1],value[2],value[3]) : 
      key === "id" ?
      nameToId(array[i][value]) :
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

// Rest, specifically -- 1-second steps for the first minute (fine enough
// to tell a true 0-rest drop set, a sub-15s rest-pause, and a real short
// rest apart), then the ORIGINAL 0.5-minute steps unchanged beyond that
// (nobody needs 1-second precision on a 2-minute rest). The "-" and
// "X.XMin" options are IDENTICAL to what timeOptions("Min",60,...,2)
// already produced, so every already-saved rest value still matches an
// option exactly -- no migration pass needed over existing history.
const restOptions = (i,parent) => {
  let option = `<option>Rest</option><option value="-">-</option>`;
  for (let s=1; s<60; s++) option += `<option value="${s}Sec">${s} Sec</option>`;
  for (let j=0.5; j<120; j+=0.5) option += `<option value="${j.toFixed(1)}Min">${j.toFixed(1)} Min</option>`;
  return `<select id="${parent}Rest${i}" name="rest${i}">${option}</select>`;
}

// Cycles off -> 1/4 -> 1/2 -> 3/4 -> 1x -> off on each tap, instead of the
// old plain on/off, since many bodyweight-loaded movements (a plank vs a
// pull-up, an incline vs decline push-up) only put a FRACTION of
// bodyweight on the target muscles, not all of it -- the exact fraction
// is a judgment call the user makes live per exercise/variation, not
// something this app tries to guess. e.currentTarget (not e.target) is
// used for the toggle's own identity, since a tap can land on either the
// <p> this listener is attached to or its inner <i>BW</i> text -- state
// needs a stable element to live on regardless of which one was hit.
// Reads savedSettings.weight (real bodyweight), NOT bodywt (settings.html's
// unrelated "Bodyweight factor" multiplier feature).
const bodyweight = (e,refElem,i) => {
  e.stopPropagation();
  const toggleEl = e.currentTarget;
  const bw = parseFloat(JSON.parse(localStorage.savedSettings||"{}").weight?.split(" ")[0]) || 0;
  const state = ((parseInt(toggleEl.dataset.bwState) || 0) + 1) % BW_FRACTIONS.length;
  toggleEl.dataset.bwState = state;
  toggleEl.firstElementChild.textContent = BW_LABELS[state];
  const targetElem = document.querySelector(`div[id="${refElem}"] [name="weight${i}"]`);
  if (state === 0) { targetElem.disabled = false; targetElem.value = ""; }
  else { targetElem.disabled = true; targetElem.value = (bw * BW_FRACTIONS[state]).toFixed(1); }
}
const typeMultiple = (e) => {
  e.stopPropagation();
  let targetEl = e.target.nodeName === "I" ? e.target : e.target.firstElementChild;     
  targetEl.textContent = targetEl.textContent === "1" ? "2" : "1" ;  
}
// Whether an exercise defaults its weight multiplier or its rep
// multiplier to 2 lives on the exercise's OWN database entry now
// (exerciseDB()[refElem].loadMultiplier, "weight"|"reps"|absent) instead
// of two hardcoded Sets of exercise keys maintained separately here --
// that data belongs next to the exercise's other metadata (bodypart,
// categories, movers), not duplicated in UI logic. See exercisesDB.js.
// Only ever runs ONCE, when a set/exercise is first created (addData's
// new-exercise branch, button.onclick's new-set branch) -- never on
// repopulating already-saved data, so it can never clobber a value the
// user already saved, including one they manually flipped via
// typeMultiple. That one-shot timing is also why there's no separate
// "manual lock" needed here the way set-type classification has: nothing
// ever re-runs this after the user's own click, so a manual flip already
// wins by construction.
const autoAssignMultiple = (el1,el2,refElem) => {
  const loadMultiplier = exerciseDB()[refElem]?.loadMultiplier;
  if (loadMultiplier === "weight") el1.textContent = "2";
  else if (loadMultiplier === "reps") el2.textContent = "2";
}
// RIR's replacement for isometric exercises -- keeps name="rir${i}", the
// EXACT same tuple key dynamic RIR uses, so getStats, pastworkout.js, and
// settings.js's CSV export/import all keep working with zero schema
// change; only exercises.js's own volume formula (see getStats below)
// treats this exercise type's rir value differently. Option values (2/4/6)
// ARE the volume formula's seconds-per-rep-equivalent divisor directly --
// Hard earns more volume credit per second held (it's inherently brief),
// Easy earns less (sustaining it a long time at low effort shouldn't be
// over-credited just for lasting).
const effortOptions = (i,parent) => `<select id="${parent}Effort${i}" name="rir${i}"><option>Effort</option><option value="2">Hard</option><option value="4">Moderate</option><option value="6">Easy</option></select>`;
// Isometric branch keeps the EXACT same 8-child order/count as the dynamic
// template (setnum, reps, repX, weight, BW-span, rest, tut, rir/effort,
// remove) -- getStats below finds its equipment-weight carrier by
// searching for an .id rather than a fixed index, but repopulateValues/
// addData's own per-index child access elsewhere still depends on this
// shape staying put. "TUT first" for isometrics is done with CSS
// order:-1 (styles.css, .isometric-row) instead of physically reordering
// the markup.
const content = (i,parent) => {
  const isIso = exerciseDB()[parent]?.type === "isometric";
  return `
  <span id="line${i}"${isIso ? ' class="isometric-row"' : ""}>
    <input type="submit" class="setnum-btn" name="setnum${i}" value="${i}" onclick="cycleSetTypeState(event,'${parent}')">
    <input type="number" name="reps${i}" placeholder="${isIso ? "Holds" : "Reps"}" required>
    <p>x<i name="repX${i}">1</i></p>
    <input type="number" name="weight${i}" placeholder="Load" required>
    <span><p><i>BW</i></p><p>x<i name="wtX${i}">1</i></p></span>
    ${restOptions(i,parent)}
    ${timeOptions(i,parent,"tut"+i,"Sec",180,"TUT")}
    ${isIso ? effortOptions(i,parent) : timeOptions(i,parent,"rir"+i,"",11,"RIR")}
    <input type="hidden" name="superset${i}" value="">
    <input type="submit" class="remove" id="${i}" name="${parent}" onclick="removeSet(event,name)" value="X" disabled>
  </span>
  `;
}
// classifySetType/isWarmupSet/excludeWarmupSets/mergeRestPauseSets live in
// functions.js -- shared with pastworkout.js's history view, which needs
// the exact same classification to color its own read-only set-number
// display the same way and to keep its own averages/volume consistent
// with these. In THIS file, they're only ever used for AUTO-classifying
// from Rest/RIR/superset data (seedSetTypeFromData below) -- a manual
// edit of those fields, or a set being repopulated from already-saved
// data, where there's no click to say what was meant. A button click
// already knows the answer directly (cycleSetTypeState), so it never
// routes through these to figure out what it just did.
function seedSetTypeFromData(restValue, rirValue, supersetValue){
  if (supersetValue) return "superset";
  if (isWarmupSet(rirValue)) return "warmup";
  return classifySetType(restValue, rirValue) || "normal";
}
// A rest-pause set isn't a separate set at all (it's the SAME set
// continued after a near-zero pause -- see mergeRestPauseSets), so it
// shows the SAME NUMBER as the real set it continues, but its OWN
// dedicated color regardless of what that real set's own color is --
// copying the real set's color too would mean no color at all whenever
// that set is just a plain normal set (the common case), which would
// make a rest-pause invisible instead of standing out like the other
// three types do. A warmup's position in the raw array shouldn't count
// toward numbering either -- it shows "W" instead. Every OTHER set is
// renumbered 0,1,2... counting only itself, independent of where it
// actually sits in the underlying array. Re-run fresh over every line
// each time (not toggled incrementally), since any one set's type
// changing can shift every number after it and change what a later
// rest-pause set is continuing.
// A rest-pause set is only meaningful as the continuation of a REAL
// (non-warmup) working set before it -- there's nothing for it to
// continue if it IS the first real set in the exercise. A warmup before
// it doesn't count as that real predecessor either (see renumberSets --
// warmups never become prevLabel), so this walks every line up to i and
// only returns false once it actually finds a non-warmup one.
function isFirstWorkingSet(exerciseEl, i){
  if (!exerciseEl) return true;
  const lines = [...exerciseEl.children].filter(el => el.id?.startsWith("line"));
  for (const lineEl of lines){
    const setnumEl = lineEl.children[0];
    if (!setnumEl) continue;
    const lineIdx = setnumEl.name.match(/\d+$/)?.[0];
    if (Number(lineIdx) === Number(i)) return true; // reached this set with no real predecessor found yet
    if ((setnumEl.dataset.setType || "normal") !== "warmup") return false; // a real set precedes it
  }
  return true;
}
// Puts the right class directly on the given setnum element for the
// given type -- nothing else, no querying, no other element involved.
// Called right at the point something already knows both the element
// and the type (a click, or an auto-classified field edit), instead of
// being decided by a separate pass over the whole exercise.
function colorSetnum(el, type){
  el.classList.remove("dropset-cell","restpause-cell","warmup-cell","superset-cell");
  if (type === "dropset") el.classList.add("dropset-cell");
  else if (type === "restpause") el.classList.add("restpause-cell");
  else if (type === "warmup") el.classList.add("warmup-cell");
  else if (type === "superset") el.classList.add("superset-cell");
}
// Numbering only -- color is never decided here (colorSetnum, called
// directly wherever a type is actually assigned, already handled it).
// This still has to look at every set, because a warmup's position
// shouldn't count and a rest-pause set shows whatever real set precedes
// it -- both are inherently about the set's neighbors, not itself, so
// there's no way around a full pass for THIS part specifically.
function renumberSets(exerciseEl){
  if (!exerciseEl) return;
  const lines = [...exerciseEl.children].filter(el => el.id?.startsWith("line"));
  let displayIdx = 0;
  let prevLabel = "0";
  lines.forEach(lineEl => {
    // Indexed, not querySelector -- content()'s own fixed child order
    // (setnum,reps,repX,weight,BWspan,rest,tut,rir,superset,remove),
    // same lookup every other function here already relies on.
    const setnumEl = lineEl.children[0];
    if (!setnumEl) return;
    const type = setnumEl.dataset.setType || "normal";
    if (type === "restpause"){
      setnumEl.value = prevLabel;
    } else if (type === "warmup"){
      setnumEl.value = "W";
    } else {
      const label = String(displayIdx++);
      setnumEl.value = label;
      prevLabel = label;
    }
  });
}
// Undoes a superset pairing on BOTH sides -- the paired (non-main)
// exercise's Rest selector and setnum button were disabled specifically
// because they were following this set's pairing, so they need to come
// back when that pairing goes away, not stay locked forever. Reads the
// pairing off the SAME superset{i} hidden field applySupersetPair wrote,
// so there's one source of truth for "what is this paired with" in both
// directions.
// Indexed lookup -- content()'s fixed child order again (setnum=0,
// rest=5, rir=7, superset=8), same pattern renumberSets/cycleSetTypeState
// use. Takes the exercise's own ELEMENT directly, never its key -- see
// findExerciseEl below for why.
function getSetLine(exerciseEl, i){
  return exerciseEl?.children[Number(i)];
}
// The exercise's sets div shares its id with the custom-option-element
// sitting above it in the selection list (loadOptions assigns BOTH the
// same nameToId'd key) -- document.getElementById(key) would silently
// return whichever one comes first in the DOM, which is the
// custom-option-element (it's nested in a container inserted before
// this div), NOT the div actually holding the line/set rows. Every
// function here that used to look an exercise up by bare key alone was
// finding the wrong element and quietly doing nothing to it -- that's
// the real reason numbering/first-working-set checks weren't working.
// Scoped to a DIRECT child of #selectionlistdisplay instead -- only the
// sets div qualifies; the custom-option-element is a grandchild, nested
// inside its own _container. Needed only where there's genuinely no
// element reference on hand already (a key parsed out of saved data) --
// everywhere else, derive the element directly from whatever was
// clicked/edited (btn.parentElement.parentElement) instead of calling
// this at all.
function findExerciseEl(key){
  return document.querySelector(`#selectionlistdisplay > #${key}`);
}
function unpairSuperset(exerciseEl, i){
  const thisLine = getSetLine(exerciseEl, i);
  const thisSuperset = thisLine?.children[8];
  if (!thisSuperset?.value) return;
  const [otherKey, j] = thisSuperset.value.split(":");
  const otherEl = findExerciseEl(otherKey); // only a key is stored, no element reference to reuse here
  const otherLine = getSetLine(otherEl, j);
  const otherSuperset = otherLine?.children[8];
  const otherRest = otherLine?.children[5];
  const otherSetnum = otherLine?.children[0];
  if (otherSuperset) otherSuperset.value = "";
  if (otherRest){
    otherRest.disabled = false;
    otherRest.value = "Rest";
    otherRest.dispatchEvent(new Event("change"));
  }
  if (otherSetnum){
    otherSetnum.disabled = false;
    otherSetnum.dataset.setType = "normal";
    otherSetnum.dataset.typeSource = "auto"; // back to normal auto-tracking now that it's unpaired
    colorSetnum(otherSetnum, "normal");
  }
  thisSuperset.value = "";
  renumberSets(otherEl);
}
// Writes the pairing onto BOTH sides symmetrically (so either exercise's
// own data can tell what it's paired with) and disables + forces "-" on
// the PAIRED exercise's Rest -- never this one's, since this is the
// exercise the popup was opened FROM, and openSupersetPopup's own design
// keeps IT as the "main" side that retains a live Rest selector (that's
// where the real rest after both exercises' sets gets logged). The
// paired exercise's own setnum button is also disabled, so a stray tap
// over there can't silently desync its visual state from this pairing
// (cycling it would otherwise flip it to Warmup and strip the color
// while the hidden field still claimed it was paired).
function applySupersetPair(exerciseEl, i, otherEl, j){
  const thisLine = getSetLine(exerciseEl, i);
  const otherLine = getSetLine(otherEl, j);
  const thisSuperset = thisLine?.children[8];
  const otherSuperset = otherLine?.children[8];
  const otherRest = otherLine?.children[5];
  const otherSetnum = otherLine?.children[0];
  if (!thisSuperset || !otherSuperset || !otherRest) return;
  // The STORED reference still has to be the key string (that's what's
  // actually saved/read back later) -- exerciseEl.id/otherEl.id already
  // IS that key, so there's no need to also carry the string separately.
  thisSuperset.value = `${otherEl.id}:${j}`;
  otherSuperset.value = `${exerciseEl.id}:${i}`;
  otherRest.value = "-";
  otherRest.disabled = true;
  if (otherSetnum){
    otherSetnum.disabled = true;
    otherSetnum.dataset.setType = "superset";
    otherSetnum.dataset.typeSource = "manual"; // locked while paired; unpairSuperset is what releases it
    colorSetnum(otherSetnum, "superset");
  }
}
function pairSingleSet(exerciseEl, i, otherEl, j){
  applySupersetPair(exerciseEl, i, otherEl, j);
  renumberSets(exerciseEl);
  renumberSets(otherEl);
}
// "An option in the corner to select alternating sets... corresponding
// sets for each exercise" -- pairs set 0 with set 0, set 1 with set 1,
// and so on, up to however many sets the SHORTER exercise has (nothing
// to pair a leftover set against on the longer one).
function pairAlternatingSets(exerciseEl, otherEl){
  const thisCount = [...exerciseEl.children].filter(el => el.id?.startsWith("line")).length;
  const otherCount = [...otherEl.children].filter(el => el.id?.startsWith("line")).length;
  const count = Math.min(thisCount, otherCount);
  for (let s=0; s<count; s++){
    applySupersetPair(exerciseEl, s, otherEl, s);
    const btn = getSetLine(exerciseEl, s)?.children[0];
    if (btn){
      // So re-tapping any of THIS exercise's own paired sets continues
      // the cycle from the right place instead of "normal".
      btn.dataset.setType = "superset";
      btn.dataset.typeSource = "manual";
      colorSetnum(btn, "superset");
    }
  }
  renumberSets(exerciseEl);
  renumberSets(otherEl);
}
// The real superset UI: pick another exercise already open in this same
// workout, then either pair just the one set that was tapped or every
// corresponding set at once (pairAlternatingSets). Only lists exercises
// that are actually expanded (have at least one set row) -- nothing to
// pair against otherwise. Cancelling (or there being nothing to pair
// with at all) moves the button ON to "Normal", the next stop after
// Superset in the cycle -- NOT back to whatever it was before this tap.
// Reverting to the previous state would mean the next tap lands on
// Superset again, which can fail the exact same way, forever -- any
// failure here has to advance the cycle, not repeat the state that led
// to it, or the button gets stuck unable to reach Normal at all.
function openSupersetPopup(exerciseKey, i, btn){
  const exerciseEl = btn.parentElement.parentElement; // the clicked element's own row's parent -- not a key lookup
  const otherDivs = [...document.querySelectorAll('#selectionlistdisplay > div')]
    .filter(div => div.id !== exerciseKey && div.querySelector('span[id^="line"]'));
  const skipToNormal = () => {
    const lineEl = btn.parentElement;
    const restSelect = lineEl.children[5];
    const rirSelect = lineEl.children[7];
    btn.dataset.setType = "normal";
    btn.dataset.typeSource = "auto";
    colorSetnum(btn, "normal");
    restSelect.value = "Rest";
    rirSelect.value = "RIR";
    renumberSets(exerciseEl);
    restSelect.dispatchEvent(new Event("change"));
  };
  if (!otherDivs.length){
    alert("No other exercise is open in this workout yet to pair with.");
    skipToNormal();
    return;
  }
  const dialog = document.createElement("dialog");
  dialog.id = "supersetprompt";
  const title = document.createElement("p");
  title.textContent = "Pair with another exercise";
  dialog.append(title);
  const exerciseSelect = document.createElement("select");
  otherDivs.forEach(div => {
    const opt = document.createElement("option");
    opt.value = div.id;
    opt.textContent = exerciseDB()[div.id]?.name || div.id;
    exerciseSelect.append(opt);
  });
  dialog.append(exerciseSelect);
  const altLabel = document.createElement("label");
  const altCheckbox = document.createElement("input");
  altCheckbox.type = "checkbox";
  altLabel.append(altCheckbox, document.createTextNode(" Alternating sets (pair every corresponding set)"));
  dialog.append(altLabel);
  const setSelect = document.createElement("select");
  dialog.append(setSelect);
  const populateSetOptions = () => {
    const otherSetCount = document.querySelectorAll(`#${exerciseSelect.value} > span[id^="line"]`).length;
    setSelect.replaceChildren();
    for (let s=0; s<otherSetCount; s++){
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = `Set ${s}`;
      setSelect.append(opt);
    }
  };
  populateSetOptions();
  exerciseSelect.addEventListener("change", populateSetOptions);
  altCheckbox.addEventListener("change", () => { setSelect.disabled = altCheckbox.checked; });
  const pairBtn = document.createElement("button");
  pairBtn.type = "button";
  pairBtn.textContent = "Pair";
  pairBtn.addEventListener("click", () => {
    const otherEl = findExerciseEl(exerciseSelect.value); // only a key here -- it's a dropdown selection, not a clicked element
    if (altCheckbox.checked) pairAlternatingSets(exerciseEl, otherEl);
    else pairSingleSet(exerciseEl, i, otherEl, parseInt(setSelect.value));
    dialog.close();
    dialog.remove();
  });
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => {
    skipToNormal();
    dialog.close();
    dialog.remove();
  });
  const actions = document.createElement("div");
  actions.className = "supersetprompt-actions";
  actions.append(pairBtn, cancelBtn);
  dialog.append(actions);
  document.body.append(dialog);
  dialog.showModal();
}
// Cycles through Warmup -> Drop set -> Rest-pause -> Superset -> Normal
// each tap. The click already says exactly what was meant, so everything
// about THIS element -- its dataset.setType, its own color, its own
// Rest/RIR -- is assigned directly, right here, on the clicked element
// (btn) and its own parent row's children. No other function decides
// any of that. renumberSets is called afterward only for the NUMBER
// (which genuinely needs the whole exercise, since it depends on
// whichever other sets are warmup/rest-pause) -- it never touches color.
const SET_TYPE_CYCLE = ["normal","warmup","dropset","restpause","superset"];
function cycleSetTypeState(event, exerciseKey){
  event.stopPropagation();
  if (exerciseDB()[exerciseKey]?.type === "isometric") return; // Effort/TUT-first rows don't participate
  const btn = event.target;
  const lineEl = btn.parentElement;
  const exerciseEl = lineEl.parentElement; // the clicked element's own row's parent -- not a key lookup (see findExerciseEl for why that matters)
  const i = btn.name.match(/\d+$/)[0];
  // Indexed, not closest()+querySelector -- same fixed child order
  // content() always generates (setnum,reps,repX,weight,BWspan,rest,tut,
  // rir,superset,remove); btn's own direct parent IS the row.
  const restSelect = lineEl.children[5];
  const rirSelect = lineEl.children[7];
  const current = btn.dataset.setType || "normal";
  let next = SET_TYPE_CYCLE[(SET_TYPE_CYCLE.indexOf(current)+1) % SET_TYPE_CYCLE.length];
  // Rest-pause is invalid for the first working set in the exercise --
  // skip straight past it to Superset instead of landing on a state
  // that doesn't mean anything here (same "any failure skips forward,
  // never stays put" rule Superset's own popup failure already follows).
  if (next === "restpause" && isFirstWorkingSet(exerciseEl, i)){
    next = SET_TYPE_CYCLE[(SET_TYPE_CYCLE.indexOf(next)+1) % SET_TYPE_CYCLE.length];
  }
  if (current === "superset") unpairSuperset(exerciseEl, i);
  switch (next){
    case "warmup":
      // Reset to the neutral placeholder first, THEN this case's own
      // value -- otherwise a value left over from the PREVIOUS tap (e.g.
      // Rest still at "-" from one click ago, when this tap moves to
      // Warmup) would make a later manual Rest/RIR edit's own
      // auto-classify pass disagree with what's being set here.
      restSelect.value = "Rest";
      // Lowest value that actually satisfies isWarmupSet's own rule
      // (RIR >= WARMUP_RIR_THRESHOLD, currently 5) -- not an arbitrary
      // pick above it.
      rirSelect.value = `${WARMUP_RIR_THRESHOLD}.0`;
      btn.dataset.setType = "warmup";
      btn.dataset.typeSource = "manual";
      colorSetnum(btn, "warmup");
      break;
    case "dropset":
      rirSelect.value = "RIR";
      restSelect.value = "-";
      btn.dataset.setType = "dropset";
      btn.dataset.typeSource = "manual";
      colorSetnum(btn, "dropset");
      break;
    case "restpause":
      // Lowest value that satisfies classifySetType's own rule for this
      // (0 < secs < 15) -- "0" itself is the dropset sentinel "-", so 1
      // is the actual floor.
      restSelect.value = "1Sec";
      rirSelect.value = "-";
      btn.dataset.setType = "restpause";
      btn.dataset.typeSource = "manual";
      colorSetnum(btn, "restpause");
      break;
    case "superset":
      // Superset defines no Rest/RIR value of its own -- unlike the other
      // three, it must NOT touch either field. This is the exercise the
      // popup was opened FROM, and it stays the "main" side that keeps a
      // live, user-entered Rest value (that's where the real rest after
      // BOTH exercises' sets gets logged) -- resetting it here would wipe
      // out whatever the user had already typed for no reason.
      btn.dataset.setType = "superset";
      btn.dataset.typeSource = "manual";
      colorSetnum(btn, "superset");
      // Pairing itself happens asynchronously (the popup); if it fails
      // or is cancelled, openSupersetPopup moves this on to "normal"
      // itself rather than leaving it stuck on "superset" with nothing
      // actually paired -- see its own skipToNormal.
      openSupersetPopup(exerciseKey, i, btn);
      break;
    default: // normal
      restSelect.value = "Rest";
      rirSelect.value = "RIR";
      btn.dataset.setType = "normal";
      // No special classification to protect, so this releases the lock
      // instead of setting it -- a direct Rest/RIR edit after this point
      // can still auto-classify the set normally, same as if it had
      // never been clicked.
      btn.dataset.typeSource = "auto";
      colorSetnum(btn, "normal");
  }
  renumberSets(exerciseEl); // numbering only -- needs the whole exercise, color above didn't
  restSelect.dispatchEvent(new Event("change"));
  rirSelect.dispatchEvent(new Event("change"));
}
// Reads this row's own reps/weight against the just-changed RIR value to
// pre-fill a suggested TUT (functions.js's suggestTUTSeconds) -- skipped
// entirely for isometric exercises (Effort isn't RIR, and TUT there is a
// direct user entry, not something to estimate). Only ever sets an
// initial value into the existing TUT select; freely overridable
// afterward like any other field.
//
// autoClassify (seedSetTypeFromData) is the AUTO path -- it runs once
// when a set is repopulated from saved data, and again on any direct
// Rest/RIR edit, since in both cases there's no button click to say
// what was meant. It is NOT how cycleSetTypeState's own clicks get
// their color -- those write dataset.setType directly, see there.
//
// applyNow=true only for a BRAND NEW set (addData/button.onclick); false
// when repopulating an already-saved set (addData's own repopulateValues
// path), so restoring saved data never silently overwrites the TUT the
// user actually entered and saved -- the drop-set/rest-pause coloring
// itself still shows either way, it's just the TUT auto-fill that's
// creation-only. Drop sets get no RIR/TUT adjustment at all (per the
// user's own call: a drop set's lighter sets are usually rep-target-
// driven, not RIR-driven, so each entered RIR is trusted as its own
// independent value) -- label only.
const wireTUTSuggestion = (rirSelect, weightInput, repsInput, tutSelect, exerciseKey, i, applyNow=false) => {
  if (exerciseDB()[exerciseKey]?.type === "isometric") return;
  const lineEl = rirSelect.parentElement;
  const exerciseEl = lineEl.parentElement; // the row's own parent -- not a key lookup (see findExerciseEl for why that matters)
  const setnumEl = lineEl.children[0];
  const restSelect = lineEl.children[5];
  const supersetField = lineEl.children[8];
  // A manual button click (cycleSetTypeState) is a deliberate choice and
  // stays put -- a LATER edit to Rest/RIR (typing 16 min into Rest on a
  // set the user already clicked to Rest-pause, say) doesn't get to
  // silently re-judge and override it, even though that 16 min plainly
  // isn't a rest-pause value by the auto rule. User input supersedes our
  // judgement here. Only sets still on "auto" (never clicked, or seeded
  // fresh from saved data) get re-derived on every field change.
  const autoClassify = () => {
    // A locked set's OWN type never changes here, and nothing else in
    // the exercise changed either -- no renumberSets call belongs on
    // this branch, it would just recompute numbers that are already
    // correct.
    if (setnumEl.dataset.typeSource === "manual") return;
    let type = seedSetTypeFromData(restSelect.value, rirSelect.value, supersetField.value);
    // Same rule as cycleSetTypeState's own click path -- a direct Rest/RIR
    // edit that happens to match the rest-pause pattern still can't mean
    // anything for the first working set, since there's nothing before it
    // to continue.
    if (type === "restpause" && isFirstWorkingSet(exerciseEl, i)) type = "normal";
    setnumEl.dataset.setType = type;
    setnumEl.dataset.typeSource = "auto";
    colorSetnum(setnumEl, type); // direct -- this row's own element, right here
    renumberSets(exerciseEl);
  };
  const recompute = () => {
    autoClassify();
    const isRestPause = setnumEl.dataset.setType === "restpause";
    const reps = parseFloat(repsInput.value) || 0;
    const weight = parseFloat(weightInput.value) || 0;
    const rir = rirSelect.value === "-" ? 0 : parseFloat(rirSelect.value);
    if (!reps || isNaN(rir)) return;
    const ref = getReferenceWeight(exerciseKey);
    const seconds = Math.min(179, Math.max(1, suggestTUTSeconds(reps, rir, weight, ref, exerciseKey, isRestPause)));
    tutSelect.value = `${seconds.toFixed(1)}Sec`;
  };
  if (applyNow) recompute();
  else autoClassify(); // repopulate path -- classify from saved data without touching TUT
  restSelect.addEventListener("change", autoClassify);
  repsInput.addEventListener("change", recompute);
  weightInput.addEventListener("change", recompute);
  rirSelect.addEventListener("change", recompute);
};
const addData = async (event) => {
  event.stopPropagation();
  await ensureWeightSettings();
  const template = document.createElement("div");
  const button = document.createElement("button");
  template.id = event.target.id.match(/[\d\w]+[a-zA-Z]/g);
  let i = 0;
  template.innerHTML = content(i,template.id);
  template.append(button);
  const keyValPair = getEffectiveTemplateData()?.[template.id] || "";
  if (keyValPair && !window.location.search.includes('new=true')){
    repopulateValues(keyValPair,template,button);
  }
  else{
    button.previousElementSibling.children[2].addEventListener("click",(e)=>typeMultiple(e));
    button.previousElementSibling.children[4].firstElementChild.addEventListener("click",(e)=>bodyweight(e,template.id,i))
    button.previousElementSibling.children[4].lastElementChild.addEventListener("click",(e)=>typeMultiple(e));
    autoAssignMultiple(button.previousElementSibling.children[4].lastElementChild.lastElementChild, button.previousElementSibling.children[2].lastElementChild,template.id);
    wireTUTSuggestion(button.previousElementSibling.children[7], button.previousElementSibling.children[3], button.previousElementSibling.children[1], button.previousElementSibling.children[6], template.id, i, true);
  }
  button.onclick = (e)=>{
    const referenceNode = e.target.parentElement ;
    let childNum = referenceNode.childElementCount-1;
    if(Array.from(referenceNode.querySelectorAll(`input[required]`)).some(e => !e.value)){alert("Update sets and weight data to add new column."); return}
    const firstdecendents = decendents(referenceNode.firstElementChild,0,referenceNode.firstElementChild.firstElementChild.name,"remove");
    button.insertAdjacentHTML("beforebegin",content(childNum,template.id));
    button.previousElementSibling.children[2].addEventListener("click",(e)=>typeMultiple(e));
    button.previousElementSibling.children[4].firstElementChild.addEventListener("click",(e)=>bodyweight(e,template.id,childNum))
    button.previousElementSibling.children[4].lastElementChild.addEventListener("click",(e)=>typeMultiple(e));
    autoAssignMultiple(button.previousElementSibling.children[4].lastElementChild.lastElementChild, button.previousElementSibling.children[2].lastElementChild,template.id);
    wireTUTSuggestion(button.previousElementSibling.children[7], button.previousElementSibling.children[3], button.previousElementSibling.children[1], button.previousElementSibling.children[6], template.id, childNum, true);
    // button.previousElementSibling.children[4].firstElementChild.addEventListener("click",(e)=>bodyweight(e,template.id,childNum))
    // if (childNum > 1){button.previousElementSibling.lastElementChild.disabled = false}
    const nextdecendents = decendents(referenceNode.querySelector(`#line${(childNum)}`),0,`setnum${(childNum)}`);
    nextdecendents[0].forEach((el,i) => {let pastEl = firstdecendents[0][i]; if (!pastEl){el.disabled=false} else {if (pastEl.disabled){el.disabled=true} ; pastEl.value ? el.value = pastEl.value : el.lastElementChild?.textContent?.length === 1 ?  el.lastElementChild.textContent =  pastEl.lastElementChild.textContent : el.lastElementChild?.textContent?.length > 1 ?  el.lastElementChild.lastElementChild.textContent =  pastEl.lastElementChild.lastElementChild.textContent : ""}} );
    // The copy-forward loop above blindly copies the first set's own
    // value into whatever lands at the same position in a new set --
    // which, now that superset{i} sits where this loop expects a plain
    // field, would make a brand new set silently inherit the FIRST set's
    // superset pairing. A new set is never paired with anything until the
    // user explicitly cycles it there.
    const newSupersetField = referenceNode.querySelector(`[name="superset${childNum}"]`);
    if (newSupersetField) newSupersetField.value = "";
  };
  button.textContent = "Add Set"
  let container = document.getElementById(`${event.target.id}_container`);
  container.after(template);
  event.target.removeEventListener("click", addData);
  event.target.onclick = () => template.classList.toggle("hide");

}

// Swipe-to-delete reveal width, as a fraction of the row's own width -- 0.2
// matches the effective cap the old clamp-based version settled at.
const SWIPE_REVEAL_FRACTION = 0.2;
// How far into the reveal (as a fraction of SWIPE_REVEAL_FRACTION) a drag
// has to get before release snaps it open instead of back closed.
const SWIPE_SNAP_THRESHOLD = 0.4;
const SWIPE_TRANSITION = "width 0.18s ease-out";

const dragAction = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const elm = event.target;
  const delBtn = elm.nextElementSibling;
  const parentWidth = elm.parentElement.getBoundingClientRect().width;
  const revealWidth = parentWidth * SWIPE_REVEAL_FRACTION;
  // Start from whatever width the row is already at (mid-swipe re-grab, or
  // already-open from a previous swipe) rather than assuming closed, so a
  // second swipe on an already-open row doesn't jump.
  let btnWidth = delBtn.getBoundingClientRect().width;
  const fullFont = 1.25 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  // No transition while actively dragging -- it fights 1:1 finger tracking,
  // producing exactly the laggy/clunky feel being fixed here. Transition is
  // reserved for the deliberate snap-open/snap-closed on release below.
  elm.style.transition = "none";
  delBtn.style.transition = "none";

  const onmove = (moveEvent) => {
    btnWidth = Math.max(0, Math.min(revealWidth, btnWidth - moveEvent.movementX));
    delBtn.style.width = `${btnWidth}px`;
    delBtn.style.fontSize = `${(btnWidth / revealWidth) * fullFont}px`;
    elm.style.width = `${parentWidth - btnWidth}px`;
  };

  const onEnd = () => {
    elm.removeEventListener("pointermove", onmove);
    elm.removeEventListener("pointerup", onEnd);
    elm.removeEventListener("pointercancel", onEnd);
    const openEnough = btnWidth > revealWidth * SWIPE_SNAP_THRESHOLD;
    elm.style.transition = SWIPE_TRANSITION;
    delBtn.style.transition = SWIPE_TRANSITION;
    delBtn.style.width = openEnough ? `${revealWidth}px` : "0px";
    delBtn.style.fontSize = openEnough ? `${fullFont}px` : "0px";
    elm.style.width = openEnough ? `${parentWidth - revealWidth}px` : `${parentWidth}px`;
  };

  elm.addEventListener("pointermove", onmove);
  elm.addEventListener("pointerup", onEnd, {once:true});
  elm.addEventListener("pointercancel", onEnd, {once:true});
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
      // setnum's displayed value is no longer a plain decrement -- it's
      // "W", a rest-pause's copied-over number, or a recount that skips
      // both (renumberSets below), so this element's own name/id still
      // get shifted like every other field, but its VALUE is left alone
      // here and overwritten fresh after the loop.
      if (elchild.childElementCount){
        let child = elchild.lastElementChild;
        if (child.localName === "p" || child.localName === "i") {
        let name = child.getAttribute("name");
        if (name) child.setAttribute("name", name.replace(/\d+$/,name.match(/\d+$/g)?.[0]-1)) ;
        else {
          child = elchild.lastElementChild.lastElementChild;
          name = child.getAttribute("name");
          child.setAttribute("name", name.replace(/\d+$/,name.match(/\d+$/g)?.[0]-1)) ;
        }
      }
      }
      elchild.id? elchild.id = elchild.id.replace(/\d+$/,elchild.id.match(/\d+$/g)[0]-1) : "";
      elchild.name? elchild.name = elchild.name.replace(/\d+$/,elchild.name.match(/\d+$/g)?.[0]-1||"") : "";
    })
  })
  // elm (the removed row's own remove button) is detached by now, so its
  // own .parentElement chain is gone -- findExerciseEl looks the exercise
  // div up by key instead, safe here since this selector (unlike a bare
  // getElementById) requires the match to be a direct child of
  // #selectionlistdisplay, which only the exercise's own sets div is.
  renumberSets(findExerciseEl(parent)); // color's untouched by a removal -- only numbering needs recomputing here
}

function removeSelectedExercise(event){
  const id = event.target.previousElementSibling.id;
  const container = document.querySelector(`#selectionlistdisplay #${id}_container`) 
  const userInputArea = document.querySelectorAll(`#selectionlistdisplay #${id}`)?.[1];
  container.remove();
  CustomOptionElement.selectedOptionArr = CustomOptionElement.selectedOptionArr.filter(name => nameToId(name) !== id);
  sessionStorage.restoreSelection = JSON.stringify(JSON.parse(sessionStorage.restoreSelection).filter(name => nameToId(name) !== id))
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


function getStats(array,exports,lineElms,isIsometric=false){
  if (!isIsometric){
    array = mergeRestPauseSets(array);
    array = excludeWarmupSets(array);
  }
  let repMultiple = lineElms[2].lastElementChild.textContent;
  let weightMultiple = lineElms[4].lastElementChild.lastElementChild.textContent;
  const savedSettingsFallback = '{"bweight":"0 kgs","dweight":"0 kgs"}';
  // Was lineElms[6].id -- a hardcoded index that happened to land on the
  // TUT select (the only elements carrying a real .id are the rest/tut/
  // rir-or-effort selects, all three of which embed the same parent
  // exercise key in their id regardless of which one this finds first).
  // Searching by "has an id" instead of a fixed position is robust to any
  // future field-order change instead of silently reading the wrong
  // element.
  const idCarrier = lineElms.find(el => el.id)?.id || "";
  let equipmentWt = idCarrier.includes("barbell") ? parseFloat(JSON.parse(localStorage.savedSettings||savedSettingsFallback).bweight.split(" ")[0]) : idCarrier.includes("dumbbell") ? parseFloat(JSON.parse(localStorage.savedSettings||savedSettingsFallback).dweight.split(" ")[0]) : 0 ;
  let allSets = calculateField(array,exports[0],val=>val,arr=>arr.length)();
  // Raw per-set number arrays (not yet summed/multiplied) -- handed to the
  // shared computeWeightVolume (functions.js) so this and index.js's
  // template quick-log popup compute totalWeight/totalVol identically.
  const setWeights = calculateField(array,exports[2],val=>val,getValuesfromInputs)();
  const setReps = calculateField(array,exports[1],val=>val,getValuesfromInputs)();
  let totalWeight, totalVol;
  if (isIsometric){
    // getValuesfromInputs already strips the "Sec" suffix off TUT values
    // and parses the Effort select's plain "2"/"4"/"6" values correctly
    // with no special-casing needed -- same extraction pipeline as
    // weight/reps above, just handed to the isometric formula instead.
    const setTUTs = calculateField(array,exports[5],val=>val,getValuesfromInputs)();
    const setEfforts = calculateField(array,exports[3],val=>val,getValuesfromInputs)();
    ({totalWeight, totalVol} = computeIsometricVolume(setWeights, setReps, setTUTs, setEfforts, repMultiple, weightMultiple, equipmentWt));
  } else {
    ({totalWeight, totalVol} = computeWeightVolume(setWeights, setReps, repMultiple, weightMultiple, equipmentWt));
  }
  return {
    totalSets: allSets,
    totalReps: reducer(setReps)*repMultiple,
    totalWeight,
    totalVol,
    avgRIR: calculateField(array,exports[3],reducer,getValuesfromInputs)("average"),
    avgRest: calculateField(array,exports[4],reducer,getValuesfromInputs)("average"),
    avgTUT: calculateField(array,exports[5],reducer,getValuesfromInputs)("average"),
  };
}

function getValuesfromInputs(arr){
  arr = arr.map(([a,b]) => b==="-" ? [a,"0"] : [a,b])
    // Rest moved to 1-second steps under a minute (restOptions above), but
    // this function is shared with weight/reps/TUT too and has no idea
    // which field it's looking at beyond the key name -- without this, a
    // "47Sec" rest value gets averaged directly against an old "2.0Min"
    // one from the same exercise, blending two different units into a
    // meaningless number. Only rest keys with a "Sec" value get converted
    // back to their minute equivalent; TUT's own "Sec" values (a
    // completely different field that was never in minutes) are untouched.
    .map(([a,b]) => (a.includes("rest") && typeof b === "string" && b.endsWith("Sec")) ? [a, `${(parseFloat(b)/60).toFixed(2)}Min`] : [a,b])
    .flatMap(([a,b]) => {
    b = testRegExp((regx,text) => text.match(regx)[0],/^\d+.?\d+(?=\w)/g,{falseVal:b})(b||0)
    return [parseFloat(b)]
  })
  return arr;
}

function reducer(arr,operation=""){
  // Reachable now that a whole exercise's sets can all be excluded as
  // warmup (excludeWarmupSets above) -- reduce with no seed throws on an
  // empty array otherwise.
  if (!arr.length) return operation === "average" ? "-" : 0;
  if (arr.some(e => !/^\d/.test(e) )) {return "error"};
  if (operation === "average") return arr.reduce((a,b)=>(a+b))/arr.length;
  else return arr.reduce((a,b)=>a+b);
}


function testRegExp(f,input,options = {falseVal: "",flags: ""}){
  let testExp = typeof input === "object" ? input : new RegExp(input,options.flags);
  return  function(testValue){
      return testExp.test(testValue) ?  f.call(this, testExp, testValue) : options.falseVal;
    } 
}

function repopulateValues(arr,elem,refElem){
  let sets = arr.filter(([k,v]) => k.includes("setnum"));
  let repX = arr.find(([k,v]) => k.includes("repMultiple"))?.[1]||1;
  let wtX = arr.find(([k,v]) => k.includes("wtMultiple"))?.[1]||1;
  let children = decendents(elem.querySelector(`#line0`),0,`setnum0`,"remove","span","p")[0];
  refElem.previousElementSibling.children[2].addEventListener("click",(e)=>typeMultiple(e));
  refElem.previousElementSibling.children[4].firstElementChild.addEventListener("click",(e)=>bodyweight(e,elem.id,0))
  refElem.previousElementSibling.children[4].lastElementChild.addEventListener("click",(e)=>typeMultiple(e));
  // autoAssignMultiple(refElem.previousElementSibling.children[4].lastElementChild.lastElementChild, refElem.previousElementSibling.children[2].lastElementChild, elem.id);
  refElem.previousElementSibling.children[2].lastElementChild.textContent = repX;
  refElem.previousElementSibling.children[4].lastElementChild.lastElementChild.textContent = wtX;
  // ?.[1] ?? "" -- a workout saved before the superset hidden field
  // existed has no "superset0" entry at all; a bare [1] on find()'s
  // undefined would throw and break opening every pre-existing workout.
  children.forEach(el => el.value = arr.find(([n,v]) => n===el.name)?.[1] ?? "");
  // wireTUTSuggestion AFTER the real saved values are set above, not
  // before -- its own classification read (applyLabel) runs synchronously
  // at call time, so calling it while rest/rir still held their blank
  // placeholder meant a repopulated set's drop-set/rest-pause/warmup
  // coloring never showed until some later live edit happened to trigger
  // a change event.
  wireTUTSuggestion(refElem.previousElementSibling.children[7], refElem.previousElementSibling.children[3], refElem.previousElementSibling.children[1], refElem.previousElementSibling.children[6], elem.id, 0);
  for (let i = 1; i<sets.length; i++){
    refElem.insertAdjacentHTML("beforebegin",content(i,elem.id));
    refElem.previousElementSibling.children[2].addEventListener("click",(e)=>typeMultiple(e));
    refElem.previousElementSibling.children[4].firstElementChild.addEventListener("click",(e)=>bodyweight(e,elem.id,i))
    refElem.previousElementSibling.children[4].lastElementChild.addEventListener("click",(e)=>typeMultiple(e));
    // autoAssignMultiple(refElem.previousElementSibling.children[4].lastElementChild.lastElementChild, refElem.previousElementSibling.children[2].lastElementChild, elem.id);
    refElem.previousElementSibling.children[2].lastElementChild.textContent = repX;
    refElem.previousElementSibling.children[4].lastElementChild.lastElementChild.textContent = wtX;
    let children = decendents(elem.querySelector(`#line${i}`),0,`setnum${i}`,"span","p")[0];
    let remSymbol = children.pop();
    remSymbol.disabled = false;
    children.forEach(el => el.value = arr.find(([n,v]) => n===el.name)?.[1] ?? "");
    wireTUTSuggestion(refElem.previousElementSibling.children[7], refElem.previousElementSibling.children[3], refElem.previousElementSibling.children[1], refElem.previousElementSibling.children[6], elem.id, i);
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