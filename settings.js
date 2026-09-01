const metricUnits = ["kgs","mts",];
const imperialUnits = ["lbs","''"];
const conversionArr = [2.2,[3.28084,39]]
const factoredWeight = document.getElementById("afterfactor");
const unitSelection = document.getElementById("unitval");
const settingsContainer = document.getElementById("settingscontainer");
const personalInfoContainer = document.getElementById("personalinfo");
const preferenceContainer = document.getElementById("preferences");
const weightElem = personalInfoContainer.children[4].lastElementChild.children[0];
const logMeasurementsBtn =  document.getElementById("logmeasurementsbtn");
const measurementsDialog = document.getElementById("addmeasurements");
const doneBtn =  document.getElementById("donebtn");
const importBtn = document.getElementById("importdata");
const exportBtn = document.getElementById("exportdata");
const redirectHome = document.querySelector("#header > h1");
const savedSettings = {};
const settingsObject = localStorage?.savedSettings ? JSON.parse(localStorage.savedSettings) : "";
let importData = [];
const exportHeaders = ["workoutDate","workoutName","workoutStartTime","workoutEndTime","workoutIntensity","workoutUnit","workoutSoreness","exercise","setnum","reps","weight","rest","tut","rir"];
const partsName = ['neck', 'chest', 'shoulders', 'arms', 'forearms', 'abdomen', 'thighs', 'calves','glutes'];
const setUnits = ()=>{
    let targetElems = Array.from(settingsContainer.querySelectorAll("p:not([id='ftsymbol'],[id='afterfactor'])"));
    let inchesEl = personalInfoContainer.querySelector("#inchesval");
    if(unitSelection.value==="metric"){
        targetElems.forEach(el => {
            el.hidden = false
            el.textContent = el.id === "htunit" ? metricUnits[1] : metricUnits[0] ;  
            inchesEl.hidden = true;
            inchesEl.previousElementSibling.hidden = true;
        })
    }
    else if(unitSelection.value==="imperial"){
        targetElems.forEach(el => {
            el.hidden = false
            el.textContent = el.id === "htunit" ? imperialUnits[1] : imperialUnits[0] ;  
            el.id === "inchesval" ? (el.hidden = false, console.log(el.hidden)) : "" ;
            inchesEl.hidden = false;
            inchesEl.style.margin = "0 2px";
            inchesEl.previousElementSibling.hidden = false
            inchesEl.previousElementSibling.style.marginLeft = "2px";
        })
    }
    else{
        targetElems.forEach(el => {
            el.hidden = true;
            el.textContent = "" ;  
        })
    }
}

const saveSettings = () => {
    let personalDataElms = Array.from(personalInfoContainer.children);
    let preferencesElms = Array.from(preferenceContainer.children)
    try{
    // store personal information
        let heightValue = personalDataElms[5].lastElementChild.children[1].hidden ? personalDataElms[5].lastElementChild.children[0].value + " " + personalDataElms[5].lastElementChild.children[3].textContent : [...personalDataElms[5].lastElementChild.children].map((e,i) => i===0||i===2? e.value : e.textContent).join();
        savedSettings["name"] = personalDataElms[0].lastElementChild.value;
        savedSettings["email"] = personalDataElms[1].lastElementChild.value;
        savedSettings["gender"] = personalDataElms[2].lastElementChild.value;
        savedSettings["age"] = personalDataElms[3].lastElementChild.value;
        savedSettings["weight"] = personalDataElms[4].lastElementChild.children[0].value + " " + personalDataElms[4].lastElementChild.children[1].textContent;
        savedSettings["height"] = heightValue;
        // store pereferences
        savedSettings["unit"] = preferencesElms[0].lastElementChild.value;
        savedSettings["bweight"] = preferencesElms[1].lastElementChild.children[0].value + " " + preferencesElms[1].lastElementChild.children[1].textContent;
        savedSettings["dweight"] = preferencesElms[2].lastElementChild.children[0].value + " " + preferencesElms[2].lastElementChild.children[1].textContent;
        savedSettings["bodywt"] = preferencesElms[3].lastElementChild.children[0].value + " " + preferencesElms[3].lastElementChild.children[1].textContent;
        localStorage.savedSettings = JSON.stringify(savedSettings);
    }
    catch(e){
        alert("Please fill out all the fields!: ");
    }
}

const retrieveSettings = () => {
    if(!Object.keys(settingsObject).length) return;
    let personalDataElms = Array.from(personalInfoContainer.children);
    let preferencesElms = Array.from(preferenceContainer.children)
    personalDataElms[0].lastElementChild.value = settingsObject["name"];
    personalDataElms[1].lastElementChild.value = settingsObject["email"];
    personalDataElms[2].lastElementChild.value = settingsObject["gender"];
    personalDataElms[3].lastElementChild.value = settingsObject["age"];
    personalDataElms[4].lastElementChild.children[0].value  = settingsObject["weight"].split(" ")[0];
    personalDataElms[4].lastElementChild.children[1].textContent = settingsObject["weight"].split(" ")[1];
    settingsObject["unit"] === "metric" ? personalDataElms[5].lastElementChild.children[0].value = settingsObject["height"].split(" ")[0] :
        (personalDataElms[5].lastElementChild.children[0].value = settingsObject["height"].split(",")[0], personalDataElms[5].lastElementChild.children[2].value = settingsObject["height"].split(",")[2]); 
    personalDataElms[5].lastElementChild.children[3].textContent = settingsObject["unit"] === "metric" ? settingsObject["height"].split(" ")[1] : settingsObject["height"].split(",")[3];
    // store pereferences
    let heightValue = settingsObject["unit"] === "metric" ? settingsObject["height"].split("")[1]+ " " + personalDataElms[5].lastElementChild.children[3].textContent : [...personalInfoContainer.children[5].lastElementChild.children].map((e,i) => i===0? e.value : e.textContent).join();
    preferencesElms[0].lastElementChild.value = settingsObject["unit"];
    preferencesElms[1].lastElementChild.children[0].value = settingsObject["bweight"].split(" ")[0];
    preferencesElms[1].lastElementChild.children[1].textContent = settingsObject["bweight"].split(" ")[1];
    preferencesElms[2].lastElementChild.children[0].value = settingsObject["dweight"].split(" ")[0];
    preferencesElms[2].lastElementChild.children[1].textContent = settingsObject["dweight"].split(" ")[1];
    preferencesElms[3].lastElementChild.children[0].value = settingsObject["bodywt"].split(" ")[0];
    preferencesElms[3].lastElementChild.children[1].textContent = settingsObject["bodywt"].split(" ")[1];
    setUnits();
    applyWtFactor();
}
const applyWtFactor = () => {
    let actualWeight = weightElem.value;
    if(factoredWeight.previousElementSibling.value <= 0 || !actualWeight) return;
    let displayVal = (actualWeight*factoredWeight.previousElementSibling.value).toFixed(0);
    factoredWeight.hidden = displayVal ? false : true;
    factoredWeight.textContent = displayVal;
}

const recalibrate = (e) => {
    let unit = e.target.value;
    if(!Object.keys(settingsObject).length) return;
    if (unit === "imperial" && settingsObject.unit !== unit){
        settingsObject["unit"] = unit;
        settingsObject["weight"] = (settingsObject["weight"].split(" ")[0]*2.2).toFixed(1) + " " + "lbs";
        settingsObject["bweight"] = (settingsObject["bweight"].split(" ")[0]*2.2).toFixed(1) + " " + "lbs";
        settingsObject["dweight"] = (settingsObject["dweight"].split(" ")[0]*2.2).toFixed(1) + " " + "lbs";
        let ht = settingsObject["height"].split(" ")[0]*3.28084;
        let inches = ht - Math.floor(ht);
        settingsObject["height"] =  Math.floor(ht)+","+"'"+","+(inches*12).toFixed(1)+","+"''";
    }
    else if (unit === "metric" && settingsObject.unit !== unit){
        settingsObject["unit"] = unit;
        settingsObject["weight"] = (settingsObject["weight"].split(" ")[0]/2.2).toFixed(1) + " " + "kgs";
        settingsObject["bweight"] = (settingsObject["bweight"].split(" ")[0]/2.2).toFixed(1) + " " + "kgs";
        settingsObject["dweight"] = (settingsObject["dweight"].split(" ")[0]/2.2).toFixed(1) + " " + "kgs";
        let ht = ((parseFloat(settingsObject["height"].split(",")[0])+parseFloat(settingsObject["height"].split(",")[2]/12))/3.28084).toFixed(2);
        settingsObject["height"] =  ht+' '+"mts";
    }
    else {return}
    localStorage.savedSettings = JSON.stringify(settingsObject);
    retrieveSettings();
}

const readFile = (file) => { 
    let fileReader = new FileReader();
    fileReader.onload = ()=>{
        const decoder = new TextDecoder()
        const contents = new Int8Array(fileReader.result);
        const result = decoder.decode(contents).split("\r\n").filter(f => f).map(e => e.replaceAll(/[\"]/g,"").split(","))
        const keys = result.map(ar => ar[0]+ " " +ar[2]).flatMap((el,i,arr) => i===0? [] : arr[i-1]!==arr[i] ? arr[i] : []);
        // key is "date time meridiem" (e.g. "8/24/2026 06:00:00 AM") -- the
        // time itself already contains a space before AM/PM, so splitting on
        // every space and destructuring the first two tokens was silently
        // dropping the meridiem from tm. That made f.includes(tm) never match
        // any row (the row's own time field always includes AM/PM), so every
        // import silently produced zero rows. Splitting on just the first
        // space keeps "06:00:00 AM" whole.
        const keyValPair = keys.map(key => {let sp = key.indexOf(" "); let dt = key.slice(0,sp); let tm = key.slice(sp+1); return [key,result.filter(f => f.includes(dt)&&f.includes(tm))]});
        const exercises = keys.map(key => {let sp = key.indexOf(" "); let dt = key.slice(0,sp); let tm = key.slice(sp+1); let res = []; result.filter(f => f.includes(dt)&&f.includes(tm)).map(e => res.includes(e[7])?"":res.push(e[7])); return res})
        const exerciseDBLocal = exerciseDB();
        const targets = exercises.map(aoa => {let res = {}; aoa.forEach(exer => res[exer] = exerciseDBLocal[exer]["movers"]); return res});
        const exerciseDetails = keyValPair.map(([k,v],i) => {
            let obj={}; 
            v.forEach((arr) =>{
                let j = arr[8];
                let namedValArr = arr.slice(8).map((e,n)=> [result[0].slice(8)[n]+j,e]);
                if(exercises[i].includes(arr[7]) && !obj?.[arr[7]]){obj[arr[7]] = [["targets",targets[i][arr[7]]]].concat(namedValArr)} else {obj[arr[7]] = [...obj[arr[7]],...namedValArr]}}); return obj}) 
        const commonHeaders = result[0].slice(0,7);
        importData = exerciseDetails;
        run()
        let workoutLog = keyValPair.map(([k,v],i) =>  [k,{[commonHeaders[1]]: v[0][1],[commonHeaders[0]]: v[0][0],[commonHeaders[2]]: v[0][2],[commonHeaders[3]]: v[0][3],[commonHeaders[4]]: v[0][4],[commonHeaders[5]]: v[0][5],[commonHeaders[6]]: v[0][6],"workoutExercises": importData[i]}]);
        // Unset on a first-ever import (no workout has been logged or
        // imported before) -- matches the "[]" fallback logworkout.js
        // already uses in workoutObject() for the same situation.
        let existingWorkoutLog = JSON.parse(localStorage?.workoutLogObject||"[]");
        let existingEntryKeys = existingWorkoutLog.map(arr=>arr[0]);
        let newEntries = workoutLog.filter(([k,v]) => !existingEntryKeys.includes(k))
        workoutLog = existingWorkoutLog.concat(newEntries).sort(([k1,v1],[k2,v2])=>new Date(k1)-new Date(k2));
        localStorage.workoutLogObject = JSON.stringify(workoutLog);
    } 
    fileReader.readAsArrayBuffer(file[0]); 
}

const handleImport = (e) => {
    e.preventDefault();
    const file = document.createElement("input");
    file.type = "file";
    file.accept = ".csv"
    file.click();
    file.addEventListener("change", ()=>{readFile(file.files);} ) ;   
}

const handleExport = (e) => {
    e.preventDefault();
    let csvDataStream = jsonToCSV();
    var blob = new Blob([csvDataStream], { type: 'text/csv;charset=utf-8;'});
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute('download', "export.csv");
    link.click();
}

const openMeasurementsDialog = (e) => {
    e.preventDefault();
    measurementsDialog.show();
    if (measurementsDialog.childElementCount > 1) {
        let values = JSON.parse(localStorage.measuredValues||"{}")
        return
    };
    let tableRows = "";
    for (let i=0; i<partsName.length; i++){
        let htmlFrag = `<tr><td>${partsName[i]}</td><td><input id=${partsName[i]} type=number></td><td><select id = ${partsName[i]}unit ><option value="in">inc</option><option value="cms">cms</option></select></td></tr>`
        tableRows += htmlFrag;
    }
    measurementsDialog.firstElementChild.firstElementChild.insertAdjacentHTML("beforeend",tableRows);
    const savebtn = document.createElement("button");
    const closebtn = document.createElement("button");
    const frag = document.createElement("span");
    savebtn.textContent = "Save";
    closebtn.textContent = "Close";
    savebtn.addEventListener("click", recordMeasurements);
    closebtn.addEventListener("click", closeDialog);
    frag.append(savebtn,closebtn);
    measurementsDialog.append(frag);
}

setUnits();
retrieveSettings()

//redirect to home page
redirectHome.addEventListener("click" , home);

unitSelection.addEventListener("change",recalibrate);
doneBtn.addEventListener("click",saveSettings); 
factoredWeight.previousElementSibling.addEventListener("keyup",applyWtFactor);
weightElem.addEventListener("blur",applyWtFactor);
importBtn.addEventListener("click",handleImport)
exportBtn.addEventListener("click",handleExport)
logMeasurementsBtn.addEventListener("click", openMeasurementsDialog)

function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}

function run(){
    importData.forEach((dataEl,i) => {
    let values = Object.values(dataEl);
    values.forEach((value,j) => {
        const statsExport = getStats(value,["setnum","reps","weight","rir","rest","tut"]);
        const {totalSets, totalReps, totalWeight, totalVol, avgRIR, avgRest, avgTUT} = statsExport;
        if (totalReps==="error" || totalWeight==="error" || avgRest==="error" ){alert("Incorrect or incomplete data. Please enter correct information to proceed."); proceed=false; return}
        value.push(["setCount", totalSets],["repCount", totalReps],["load", totalWeight], ["vol", totalVol], ["meanRIR", avgRIR], ["meanRest", avgRest], ["MeanTUT", avgTUT] ) ;
        // importData[i][Object.keys(dataEl)[j]] = values.flat();
    })
    })
    return importData;
}  

function calculateField(AoA,filter,mainF,transform){
  const input = AoA.filter(([k,v])=> k.includes(filter));
  return function(op,...args){return mainF.call(this,transform.call(this,input,...args),op)}; 
 }

function getStats(array,exports){
    return {
      totalSets: calculateField(array,exports[0],val=>val,arr=>arr.length)(),
      totalReps: calculateField(array,exports[1],reducer,getValuesfromInputs)(),
      totalWeight: calculateField(array,exports[2],reducer,getValuesfromInputs)(),
      totalVol: calculateField([],"",getVolume, () => (arr) => arr.reduce(([k1,v1],[k2,v2])=>["",v1+v2])[1])(array.filter(([k,v])=> k.includes(exports[2])))(array.filter(([k,v])=> k.includes(exports[1]))),
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
    return function(innerarr){
        let args = [];
        for (let i=0; i<outerarr.length;i++){
            args.push(["v", outerarr[i][1]*innerarr[i][1]]);
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

function jsonToCSV(){
    let exerCon = {};
    let fileCon = {};
    let res = [];
    (localStorage?.workoutLogObject ? JSON.parse(localStorage.workoutLogObject) : []).forEach(([k,{workoutExercises,...o}]) => {
        let outemp = [];
        Object.entries(workoutExercises).forEach(([n,arr])=> {
        let temp = [];
        let fArr = arr.filter(([q,r]) => exportHeaders.slice(8).includes(q.slice(0,-1)));
        let ln = fArr.length;
        let i = 0 ;
        while(ln>0){
            let tArr = [n];
            exportHeaders.slice(8).forEach((e,j) => tArr.push(fArr[j][1]))
            ln-=6;
            temp.push(tArr)
        }
        outemp.push(temp)
        }) 
        exerCon[k] = outemp;
    })

    (localStorage?.workoutLogObject ? JSON.parse(localStorage.workoutLogObject) : []).forEach(([k,o])=> {
        let temp=[]; 
        Object.entries(o).forEach(([a,b])=> {
            let i = exportHeaders.findIndex(e => e.includes(a));
            temp[i] = b;
        }); 
        fileCon[k] = temp
    })

    Object.entries(fileCon).forEach(([k,v])=> Object.entries(exerCon).forEach(([q,aoa])=> {
        if (k===q) {
            aoa.forEach(ar => ar.forEach(a => res.push([...v,...a])))
        }
    })
    )
    res.unshift(exportHeaders)
    return res.map(ar => ar.join(",")).join("\r\n");
}

// Alter item (targets in this case)

function alterSavedParam(param,savedName){
    (localStorage?.workoutLogObject ? JSON.parse(localStorage.workoutLogObject) : []).map(([k,{workoutExercises,...o}]) => {
        workoutExercises = Object.fromEntries(Object.entries(workoutExercises).map(([n,arr])=> [n,arr.map(([q,r]) => {
            if (q.includes(savedName)){
             return [q, exerciseDB()[n][param]]
            } else return [q,r]
        })]))
    return [k,{workoutExercises,...o}]
    })
}

function recordMeasurements(){
    let inputs = measurementsDialog.querySelectorAll("#measurementstable input");
    let units = measurementsDialog.querySelectorAll("#measurementstable select");
    let today = new Date().toLocaleDateString();
    let measuredValues = {}
    measuredValues[today] = {};
    for (let i=0; i<inputs.length; i++){
        measuredValues[today][inputs[i].id] = inputs[i].value + " " + units[i].value; 
    }
    localStorage.measuredValues = JSON.stringify(measuredValues);
}

function closeDialog(){
    measurementsDialog.close();
}