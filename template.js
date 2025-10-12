const chooseProgram = document.getElementById("chooseprogram");
const programDisplay = document.getElementById("selectedprogram");
const coverImage = document.getElementById("coverimg");
const addExercises = document.getElementById("addexercises");
const createTemplate = document.getElementById("createtemplate");
const redirectHome = document.querySelector("#header > h1");
existingTemplates = localStorage?.templates ? JSON.parse(localStorage.templates) : {}; 
//redirect to home page
redirectHome.addEventListener("click" , () => document.location = "index.html");

handleRedirectToPg(document.location)

// Choose program section behaviour with select, option group, and option elements as well as text input for custom inputs.
const handleChoiceChange = (e)=>{programDisplay.value = chooseProgram.value; programDisplay.classList.add("mark"); chooseProgram.classList.remove("mark")};
const handleCustomChoice = (e)=>{ chooseProgram.value = chooseProgram[0].value; programDisplay.classList.remove("mark"); chooseProgram.classList.add("mark")};
chooseProgram.addEventListener ("change", handleChoiceChange);
programDisplay.addEventListener("focus", handleCustomChoice);
programDisplay.addEventListener("keydown", (e)=>{if(e.key==="Enter") {e.preventDefault();}});
// coverImage.addEventListener("click", (e)=> {
//     e.preventDefault();
//     loadFile.type = "file";
//     loadFile.accept = ".png,.jpg,.jpeg";
//     loadFile.click()
//     const getUserImage = setInterval (()=>{
//         let file = loadFile?.files?.[0] ;
//         file? (coverImage.src = URL.createObjectURL(file), clearInterval(getUserImage)) : "";
//     },
//      1000  
//     )
// })

// Adding exercises through button click.
addExercises.onclick = () => {
    if(existingTemplates.hasOwnProperty(programDisplay.value)){
        alert("Proceed to edit existing template...") ;
    }
    if (!sessionStorage?.finalLog && !sessionStorage?.restoreSelection){
        if (!programDisplay.value){alert("Choose a program name to proceed."); return}
        sessionStorage.program = programDisplay.value ;
        const loc = new URL("file:///C:/Users/krish/Desktop/Web%20Development/Capstone%20projects/Project%207%20-%20LoggerDotOne/exercises.html");
        loc.searchParams.set("new",true);
        document.location = loc;
    }
    else{
        sessionStorage.program = programDisplay.value ;
        const loc = new URL("file:///C:/Users/krish/Desktop/Web%20Development/Capstone%20projects/Project%207%20-%20LoggerDotOne/exercises.html");
        loc.searchParams.set("new",false);
        document.location = loc;
    }
}

createTemplate.onclick = () => {
    if (new URL(document.location).searchParams.get("eData")){
        existingTemplates[programDisplay.value] = JSON.parse(sessionStorage.finalLog);
        localStorage.templates = JSON.stringify(existingTemplates);
        const loc = new URL("file:///C:/Users/krish/Desktop/Web%20Development/Capstone%20projects/Project%207%20-%20LoggerDotOne/index.html");
        document.location = loc;
        return
    }
    if (!programDisplay.value) {
        alert("Program name cannot be empty."); 
        return;
    }
    else if (sessionStorage?.program && sessionStorage?.finalLog){
        const newEntry = JSON.parse(sessionStorage.finalLog);
        if (!existingTemplates.hasOwnProperty(programDisplay.value)) {
            existingTemplates[programDisplay.value] = newEntry;
            localStorage.templates = JSON.stringify(existingTemplates);
        } else {
            alert("Program with a same name already exists! Either choose a new name or edit the existing entry from the templates carousal.") ;
            return;
        }
        const loc = new URL("index.html");
        // loc.searchParams.set("p","template");
        document.location = loc;
    }
    else{
        alert("Please select at least one exercise to proceed.")
    }
}

function handleRedirectToPg(page){
    const url = new URL(page);
    let p = url.searchParams.get("eData");
    if (!p) {
        sessionStorage.clear();
        if (Object.keys(existingTemplates).length){
            const templates = Object.entries(existingTemplates);
            for (let [program,template] of templates){
                createTemplateItem(program);
            }
        }
    }
    else{
        programDisplay.value = sessionStorage.program;
        chooseProgram.disabled = true;
        chooseProgram.className = "mark";
        programDisplay.disabled = true;
        programDisplay.className = "mark";
        const templateLog = {...JSON.parse(sessionStorage?.finalLog)};
        displaySnapshot(templateLog);
        if (Object.keys(existingTemplates).length){
            const templates = Object.entries(existingTemplates);
            for (let [program,template] of templates){
                createTemplateItem(program);
            }
        }
    } 
}

function getParamStats(arr,param){
   return arr.filter(([k,v])=>k===param).map(([k,v])=>v).reduce((a,b)=> a+b)
}

function typedArrayToURL(typedArray, mimeType) {
    const url =  URL.createObjectURL(
      new Blob([typedArray.buffer], { type: mimeType }),
    );
    const canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
//   link.innerText = "Open the array URL";
    coverImage.after(canvas);

  }
  const bytes = new Uint8Array(59);

  for (let i = 0; i < 59; i++) {
    bytes[i] = 65 + i;
  }

function handleTemplateItemClick(event){
    // document.location
    const labelElem = document.querySelector(`#${event.target.parentElement.id} > h1`);
    const exercisesLog = existingTemplates[labelElem.textContent] ;
    programDisplay.value = labelElem.textContent;
    programDisplay.disabled = true;
    programDisplay.classList.add("mark");
    chooseProgram.disabled = true;
    chooseProgram.classList.add("mark");
    sessionStorage.finalLog = JSON.stringify(exercisesLog);
    sessionStorage.restoreSelection = JSON.stringify(Object.keys(exercisesLog));
    displaySnapshot(exercisesLog);
}
// createTemplateItem(Object.keys(templateLog).join(" "));
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

function displaySnapshot(snapshotdata){

        const snapshotdataValues = Object.values(snapshotdata).flat().filter(([k,v])=> k==="setCount"||k==="repCount"||k==="vol");
        const snapshotdatakeys = Object.keys(snapshotdata).map(k => k.replaceAll("_"," "));

        let sets =  getParamStats(snapshotdataValues,"setCount");
        let reps = getParamStats(snapshotdataValues, "repCount") ;
        let volume = getParamStats(snapshotdataValues,"vol") ;
        volume = volume > 1000 ? volume/1000+"K" : volume;
        
        const div = document.createElement("div");
        div.textContent = `Volume:${volume}/Sets:${sets}/Reps:${reps}`;
        div.id = "snapshot"
        const button = document.getElementById("addexercises");
        button.style.display = "flex" ;
        button.textContent = "Edit Template"
        button.style.justifyContent = "space-around"
        button.append(div)

        const flag = document.createElement("div");
        flag.id = "flag";
        let flagColor = "rgba(0%, 100%, 0%, 100%)"
        flag.style.backgroundImage = `linear-gradient(90deg, #232D3F, ${flagColor}, ${flagColor})`;
        button.parentElement.append(flag);
}