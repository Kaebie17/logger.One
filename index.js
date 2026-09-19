// Was document.getElementById("indexJS") -- that only worked while this
// page had a static <script id="indexJS">. functions.js now injects this
// script dynamically (see PAGE_SCRIPTS there) with no fixed id, so this
// needs the standard "whichever script tag is currently running" reference
// instead, which works the same for a dynamically-inserted script.
const indexScript = document.currentScript;
const logWorkout = document.getElementById("logworkout");
const createWorkout = document.getElementById("createworkout");
const svgContainer = document.getElementById("svgcontainer");
const redirectHome = document.querySelector("#header > h1");
const dateElements =  document.querySelectorAll("input[type='date']");
const calendarElem = document.getElementById("calendar");
const loadCalendar = document.getElementById("loadcalendar");
const dayNumContainers = document.querySelectorAll("#schedule > div > #week > span");
const monthlyHighlights = document.getElementById("monthlyhighlights");
const liftHighlights = document.getElementById("lifthighlights");
let dateSorter = Intl.Collator(undefined,{numeric:true}).compare;
let monthlyScroll=0;
let liftsScroll=0;
const dataInterface = new DataInterface();

const date = new Date();
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dayNames = ["Su","M","Tu","W","Th","F","Sa"];
let nameMap =  new Map();
let script = document.createElement("script");
sessionStorage.clear();
const existingTemplates = window.templatesData || {};
if (Object.keys(existingTemplates).length){
    const templates = Object.entries(existingTemplates);
    for (let [program,templateContent] of templates){
        createTemplateItem(program);
    }
}
const pastWorkoutsObject = (window.workoutLogData||[]).sort(dateSorter);
dataInterface.new(Object.fromEntries(pastWorkoutsObject));
const currentMonthWorkouts = dataInterface.byMonth(date.getMonth()+1);
const pastMonthWorkouts = dataInterface.byMonth(date.getMonth());
const twoMonthsBeforeWorkouts = dataInterface.byMonth(date.getMonth()-1);
let dailyWorkoutLog = new Map(); 
//  debugger
// render svg content to the application 
let svgcode = script.cloneNode(true);
indexScript.before(svgcode);
svgcode.src = "svgcode.js";
svgcode.addEventListener ("load", async () => {
    await muscularManSvg(svgContainer,[-30,-25,200,200]);
    const [frontsvg,backsvg] = [document.getElementById("frontHumanSVG"),document.getElementById("backHumanSVG")];
    // svgContainer.append(frontsvg);
    // svgContainer.append(backsvg);
    [...frontsvg.querySelectorAll("[data-name]")].forEach(el => nameMap.set(el.dataset.name, nameMap.get(el.dataset.name) || 0));
    [...backsvg.querySelectorAll("[data-name]")].forEach(el => nameMap.set(el.dataset.name, nameMap.get(el.dataset.name) || 0));
    let temp = window.workoutLogData||[];
    temp.forEach(([k,v]) => dailyWorkoutLog.set(v.workoutDate + " " + v.workoutStartTime,v));
    temp = "";
    dailyWorkoutLog.size? recentWorkouts(dailyWorkoutLog) : "";
    renderMuscleSorenessMap();
    dayNumContainers.forEach(el => {
        let dimentionRatio = ((window.innerWidth/window.innerHeight)); 
        let h = parseInt(window.getComputedStyle(el).width)-dimentionRatio ;     
        el.style.height =  `${h}px`;  
        let date = new Date();
        date.setDate(date.getDate()-(el.textContent-1)); 
        el.textContent = date.getDate();
        dailyWorkoutLog.keys().some(e => compareDates(new Date(e), date) ? el.classList.add("indent") : "");    
    })
    redZones =  calcRZ();
})

// let exerciseDBPage = script.cloneNode(true);
// indexScript.before(exerciseDBPage);
// exerciseDBPage.src = "exercisesDB.js";
// exerciseDBPage.onload = () => {
    
// }

// set past week dates in the schedule section and height of the date display elements 
const compareDates = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getDate() === date2.getDate() && date1.getMonth()+1 === date2.getMonth()+1;
}


// create workout button function
logWorkout.addEventListener("click", ()=>document.location = "./logworkout.html" )
createWorkout.addEventListener("click", ()=>document.location = "./template.html" )
loadCalendar.addEventListener( "click", ()=>{createCalendar(date)},{once:true}) ;
monthlyHighlights.firstElementChild.addEventListener("click",enableScroll)
monthlyHighlights.lastElementChild.addEventListener("click",enableScroll)
liftHighlights.firstElementChild.addEventListener("click",enableScroll)
liftHighlights.lastElementChild.addEventListener("click",enableScroll)
monthlyHighlights.firstElementChild.nextElementSibling.lastElementChild.firstElementChild.textContent = currentMonthWorkouts.length;
monthlyHighlights.firstElementChild.nextElementSibling.lastElementChild.lastElementChild.textContent = pastMonthWorkouts.length;
liftHighlights.firstElementChild.nextElementSibling.lastElementChild.firstElementChild.textContent = findHighlight(currentMonthWorkouts,"bestlifts")?.[0] || "-";
liftHighlights.firstElementChild.nextElementSibling.lastElementChild.lastElementChild.textContent = findHighlight(pastMonthWorkouts,"bestlifts")?.[1] || "-";
function recentWorkouts(object){
    const keys = Array.from(object.keys());
    const dates = keys.filter(key => new Date(key) > new Date(date.getTime() - 7*24*60*60*1000) )
    const recentWorkoutDetails = dates.map(date => object.get(date));
    recentWorkoutDetails.forEach(({workoutExercises,...obj},i) => {
        let dayMultiple = (100-(Math.round((new Date() - new Date(dates[i]))/(24*60*60*1000)))*10)/100;
        const movers = Object.values(workoutExercises).map(arr => arr[0][1]);
        const volumes = Object.values(workoutExercises).map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]).map(e => Math.round(e*dayMultiple));
        const totalVol = Math.round(volumes.reduce((a,b)=> a+b,0));
        movers.forEach(([primary, secondary, tertiary, quaternary, quinary],i) => { 
            if (primary) {primary = primary.replace("-",""); if(primary==="traps"||primary==="rhomboids"){primary="traps/rhomboids"} };
            if (secondary) {secondary = secondary.replace("-",""); if(secondary==="traps"||secondary==="rhomboids"){secondary="traps/rhomboids"} };
            if (tertiary) {tertiary = tertiary.replace("-",""); if(tertiary==="traps"||tertiary==="rhomboids"){tertiary="traps/rhomboids"} };
            if (quaternary) {quaternary = quaternary.replace("-",""); if(quaternary==="traps"||quaternary==="rhomboids"){quaternary="traps/rhomboids"} };
            if (quinary) {quinary = quinary.replace("-",""); if(quinary==="traps"||quinary==="rhomboids"){quinary="traps/rhomboids"} };
            nameMap.has(primary)? nameMap.set(primary,Math.round(nameMap.get(primary)+(0.65*volumes[i]*100)/totalVol)) : "";
            nameMap.has(secondary)? nameMap.set(secondary,Math.round(nameMap.get(secondary)+(0.25*volumes[i]*100)/totalVol)) : "";
            nameMap.has(tertiary)? nameMap.set(tertiary,Math.round(nameMap.get(tertiary)+(0.05*volumes[i]*100)/totalVol)) : "";
            nameMap.has(quaternary)? nameMap.set(quaternary,Math.round(nameMap.get(quaternary)+(0.03*volumes[i]*100)/totalVol)) : "";
            nameMap.has(quinary)? nameMap.set(quinary,Math.round(nameMap.get(quinary)+(0.02*volumes[i]*100)/totalVol)) : "";
        });
    })

    // nameMap itself still feeds calcRZ() (Red Zone Hits, below) and
    // stats.js's muscle-group volume chart (reads localStorage.nameMap) --
    // both a rolling 7-day volume view, unrelated to and unchanged by the
    // persisted/decaying muscleSorenessData the SVG is now colored from
    // (see renderMuscleSorenessMap). Only the coloring this function used
    // to also do here was removed.
    localStorage.nameMap = JSON.stringify([...nameMap]);
}

// Paints the muscle SVG from the shared, persisted, decaying soreness
// store (functions.js: window.muscleSorenessData / decayedTier /
// TIER_COLORS / applyTierColor) instead of the old from-scratch 7-day
// volume recompute -- so this page and profile.js's soreness page always
// agree on a given muscle's color. Called unconditionally (tier 0
// included) so a muscle that's fully decayed since the last visit
// actively restores its native color rather than staying stuck on a
// stale one.
function renderMuscleSorenessMap(){
    const data = window.muscleSorenessData || {};
    const now = Date.now();
    // Matches the old rgbValues call site's own selector (document.querySelectorAll(`svg [data-name='${key}']`))
    // rather than assuming svgContainer is the SVGs' direct container.
    document.querySelectorAll("svg [data-name]").forEach(el => applyTierColor(el, decayedTier(data[el.dataset.name], now)));
}

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

function handleTemplateItemClick(event){
    let program = event.target.parentElement.lastElementChild.textContent;
    openQuickLogPopup(program);
}

// Full page flow (clock-face time pickers, full exercise editor) -- still
// the answer whenever the quick popup's premise (no new exercise/set)
// doesn't hold. This is exactly what handleTemplateItemClick used to do
// unconditionally before the popup existed.
function openFullEditor(program){
    const loc = new URL("logworkout.html", document.location);
    loc.searchParams.set("temp", program);
    document.location = loc;
}

function appendZero2(val){
    return (val*1) < 10 ? "0"+val : ""+val;
}

// mins is minutes-since-midnight (0-1439, wrapped). Matches the exact
// "HH:MM:SS AM/PM" string format workoutStartTime/workoutEndTime are
// stored in everywhere else (see logworkout.js's periodObject).
function formatTime12(mins){
    mins = ((mins % 1440) + 1440) % 1440;
    const h24 = Math.floor(mins/60);
    const m = mins % 60;
    const ampm = h24 < 12 ? "AM" : "PM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${appendZero2(h12)}:${appendZero2(m)}:00 ${ampm}`;
}

function getTupleValue(tuples, key){
    return tuples.find(([k]) => k === key)?.[1];
}
function setTupleValue(tuples, key, value){
    const entry = tuples.find(([k]) => k === key);
    if (entry) entry[1] = value;
}
// Set numbers as they actually exist on this exercise (setnum1, setnum2,
// ...), not assumed contiguous from a possibly-stale setCount.
function getSetIndices(tuples){
    return tuples.filter(([k]) => /^setnum\d+$/.test(k)).map(([k]) => k.slice(6)*1).sort((a,b) => a-b);
}

// Same equipment/settings lookup exercises.js's getStats does (line ~611),
// just against exerciseDB()'s own equipment array instead of a DOM
// element's id, since there's no DOM here to read from.
function getEquipmentWeight(exerciseKey){
    const equipment = exerciseDB()[exerciseKey]?.["equipment"] || [];
    const savedSettingsFallback = '{"bweight":"0 kgs","dweight":"0 kgs"}';
    const settings = JSON.parse(localStorage.savedSettings || savedSettingsFallback);
    if (equipment.includes("barbell")) return parseFloat(settings.bweight.split(" ")[0]) || 0;
    if (equipment.includes("dumbbell")) return parseFloat(settings.dweight.split(" ")[0]) || 0;
    return 0;
}

// Refreshes load/vol/setCount/repCount on one exercise's tuples after its
// weight/reps have been edited -- via the shared computeWeightVolume
// (functions.js), the exact same formula exercises.js's editor uses, so
// stats/muscle-map volume stay correct for a quick-logged workout.
function recomputeExerciseTuples(tuples, exerciseKey){
    const setIdx = getSetIndices(tuples);
    const setWeights = setIdx.map(i => parseFloat(getTupleValue(tuples, `weight${i}`)) || 0);
    const setReps = setIdx.map(i => parseFloat(getTupleValue(tuples, `reps${i}`)) || 0);
    const repMultiple = parseFloat(getTupleValue(tuples, "repMultiple")) || 1;
    const weightMultiple = parseFloat(getTupleValue(tuples, "wtMultiple")) || 1;
    const equipmentWt = getEquipmentWeight(exerciseKey);
    const {totalWeight, totalVol} = computeWeightVolume(setWeights, setReps, repMultiple, weightMultiple, equipmentWt);
    setTupleValue(tuples, "load", totalWeight);
    setTupleValue(tuples, "vol", totalVol);
    setTupleValue(tuples, "setCount", setIdx.length);
    setTupleValue(tuples, "repCount", setReps.reduce((a,b) => a+b, 0) * repMultiple);
}

// A small "label  −  value  +" row shared by every stepper in the popup.
// onStep(delta) mutates whatever backing value this row represents and
// returns the new display string -- this function only owns the DOM.
function buildStepperRow(label, initialDisplay, onStep){
    const row = document.createElement("div");
    row.className = "quicklog-stepper-row";
    const labelEl = document.createElement("span");
    labelEl.className = "quicklog-stepper-label";
    labelEl.textContent = label;
    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "quicklog-stepper-btn";
    minusBtn.textContent = "−";
    const valueEl = document.createElement("span");
    valueEl.className = "quicklog-stepper-value";
    valueEl.textContent = initialDisplay;
    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "quicklog-stepper-btn";
    plusBtn.textContent = "+";
    minusBtn.addEventListener("click", () => { valueEl.textContent = onStep(-1); });
    plusBtn.addEventListener("click", () => { valueEl.textContent = onStep(1); });
    row.append(labelEl, minusBtn, valueEl, plusBtn);
    return row;
}

// The "just tweak a couple of weights and log it" fast path -- for the
// common case where a template's exercises/sets don't need to change at
// all. openFullEditor (the existing logworkout.html?temp= flow) is one tap
// away for whenever that's not true.
//
// One page per logical step (Start/Duration/Intensity, then one exercise
// per page) instead of a single long scroll -- the program name and the
// escape hatches (Full Editor, close) live in a header that's the same on
// every page, and a prev/dots/next bar at the bottom drives which page is
// showing; the next button becomes "Save" on the last page instead of
// being a separate action outside the page flow.
function openQuickLogPopup(program){
    const template = existingTemplates[program];
    if (!template) return;
    const unit = template.unit === "imperial" ? "imperial" : "metric";
    const weightStep = unit === "imperial" ? 5 : 2.5;
    const exerciseKeys = Object.keys(template).filter(k => k !== "unit" && k !== "start" && k !== "end");
    // Deep clone -- closing must never mutate the real, saved template.
    const workingLog = JSON.parse(JSON.stringify(template));
    const exDB = exerciseDB();

    const dialog = document.createElement("dialog");
    dialog.id = "quicklogprompt";

    // ---- Header: program name, Full Editor, close -- same on every page ----
    const header = document.createElement("div");
    header.className = "quicklog-header";
    const progName = document.createElement("span");
    progName.className = "quicklog-progname";
    progName.textContent = program;
    const editBtn = document.createElement("a");
    editBtn.className = "quicklog-fulleditor";
    editBtn.textContent = "Full Editor";
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "quicklog-close";
    closeBtn.textContent = "×";
    header.append(progName, editBtn, closeBtn);
    dialog.append(header);

    const now = new Date();
    let startMinutes = Math.round((now.getHours()*60 + now.getMinutes())/5)*5;
    let durationMinutes = 45;
    let intensity = 5;

    // ---- Page 0: Start/Duration/Intensity ----
    const detailsPage = document.createElement("div");
    detailsPage.className = "quicklog-page";
    detailsPage.append(
        buildStepperRow("Start", formatTime12(startMinutes), (delta) => {
            startMinutes = startMinutes + delta*5;
            return formatTime12(startMinutes);
        }),
        buildStepperRow("Duration", `${durationMinutes} min`, (delta) => {
            durationMinutes = Math.max(5, durationMinutes + delta*5);
            return `${durationMinutes} min`;
        }),
        buildStepperRow("Intensity", `${intensity}`, (delta) => {
            intensity = Math.max(0, Math.min(10, intensity + delta));
            return `${intensity}`;
        })
    );

    // ---- One page per exercise ----
    const exercisePages = exerciseKeys.map(key => {
        const tuples = workingLog[key];
        const page = document.createElement("div");
        page.className = "quicklog-page";
        const name = document.createElement("h1");
        name.textContent = exDB[key]?.["name"] || key;
        page.append(name);
        // A full-page-per-exercise gives each set room for its own two
        // FULL-WIDTH stepper rows (same width as Start/Duration/Intensity
        // on page 0) instead of cramming a Wt stepper and a Reps stepper
        // side by side on one line, which overflowed the dialog's edge.
        getSetIndices(tuples).forEach(i => {
            const setGroup = document.createElement("div");
            setGroup.className = "quicklog-set-group";
            const setLabel = document.createElement("p");
            setLabel.className = "quicklog-set-label";
            setLabel.textContent = `Set ${i}`;
            setGroup.append(
                setLabel,
                buildStepperRow("Weight", `${getTupleValue(tuples, `weight${i}`)}`, (delta) => {
                    const next = Math.max(0, (parseFloat(getTupleValue(tuples, `weight${i}`))||0) + delta*weightStep);
                    setTupleValue(tuples, `weight${i}`, next);
                    return `${next}`;
                }),
                buildStepperRow("Reps", `${getTupleValue(tuples, `reps${i}`)}`, (delta) => {
                    const next = Math.max(0, (parseFloat(getTupleValue(tuples, `reps${i}`))||0) + delta);
                    setTupleValue(tuples, `reps${i}`, next);
                    return `${next}`;
                })
            );
            page.append(setGroup);
        });
        return page;
    });

    const pages = [detailsPage, ...exercisePages];
    const pageViewport = document.createElement("div");
    pageViewport.className = "quicklog-viewport";
    pageViewport.append(...pages);
    dialog.append(pageViewport);

    // ---- Nav: prev, page dots, next/save ----
    const nav = document.createElement("div");
    nav.className = "quicklog-nav";
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "quicklog-nav-btn";
    prevBtn.textContent = "‹";
    const dots = pages.map(() => {
        const dot = document.createElement("span");
        dot.className = "quicklog-dot";
        return dot;
    });
    const dotsRow = document.createElement("div");
    dotsRow.className = "quicklog-dots";
    dotsRow.append(...dots);
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "quicklog-nav-btn";
    nav.append(prevBtn, dotsRow, nextBtn);
    dialog.append(nav);

    let currentIndex = 0;
    function showPage(i){
        currentIndex = i;
        pages.forEach((p, idx) => { p.hidden = idx !== i; });
        dots.forEach((d, idx) => d.classList.toggle("quicklog-dot-active", idx === i));
        prevBtn.disabled = i === 0;
        const isLast = i === pages.length - 1;
        nextBtn.textContent = isLast ? "Save" : "›";
        nextBtn.className = isLast ? "quicklog-nav-btn quicklog-nav-save" : "quicklog-nav-btn";
    }
    showPage(0);
    prevBtn.addEventListener("click", () => { if (currentIndex > 0) showPage(currentIndex - 1); });

    const closeDialog = () => { dialog.close(); dialog.remove(); };
    closeBtn.addEventListener("click", closeDialog);
    editBtn.addEventListener("click", () => { closeDialog(); openFullEditor(program); });
    nextBtn.addEventListener("click", async () => {
        if (currentIndex < pages.length - 1){ showPage(currentIndex + 1); return; }

        exerciseKeys.forEach(key => recomputeExerciseTuples(workingLog[key], key));

        // Weight/reps edits become the new template default for next time.
        existingTemplates[program] = workingLog;
        await window.LoggerDB.saveTemplates(existingTemplates);

        // workoutExercises must hold ONLY per-exercise tuple arrays --
        // workingLog is a clone of the whole template, which also carries
        // "unit" (a plain string, not a tuple array) alongside the real
        // exercise keys. Saving workingLog itself here leaked "unit" into
        // every quick-logged workout's workoutExercises, which then broke
        // settings.js's export (jsonToCSV tries to .filter() that string
        // as if it were a tuple array) for any workout logged this way.
        const workoutExercises = Object.fromEntries(exerciseKeys.map(key => [key, workingLog[key]]));

        // Log today's workout, same shape logworkout.js's saveWorkoutFunction
        // produces -- workoutSystemicFatigue is "" for the same reason it
        // always is on a same-day save (see updateSystemicFatigueAvailability).
        const workoutDate = new Date().toLocaleDateString();
        const workoutStartTime = formatTime12(startMinutes);
        const workoutEndTime = formatTime12(startMinutes + durationMinutes);
        const key = workoutDate + " " + workoutStartTime;
        const entryMap = new Map(window.workoutLogData || []);
        entryMap.set(key, {
            workoutName: program,
            workoutDate,
            workoutStartTime,
            workoutEndTime,
            workoutIntensity: `${intensity}`,
            workoutSystemicFatigue: "",
            workoutExercises,
            workoutUnit: unit,
        });
        await window.LoggerDB.saveWorkoutLog(Array.from(entryMap));
        // workoutDate here is always today's (line above), so this always
        // contributes -- unlike logworkout.js's saveWorkoutFunction, which
        // also handles deliberately backdated "log past workout" saves and
        // gates on that.
        await applyWorkoutToMuscleSoreness(workoutExercises);

        closeDialog();
        document.location.reload();
    });

    document.body.append(dialog);
    dialog.showModal();
}

function showorhideElem(el,value){
    console.log(el)
    el.style.display = value;
}

function createCalendar(d){
    const _date = new Date(d);
    const label = document.createElement("label");
    label.textContent = months[_date.getMonth()] ;
    calendarElem.firstElementChild.firstElementChild.after(label);
    const calendarBody = document.createElement("div");
    calendarBody.className = "calendar-body"
    const dateBody = document.createElement("span");
    dateBody.className = "date-body"
    const frag = document.createDocumentFragment();
    let len = _date.getMonth()+1 === new Date(new Date(_date).getTime()+(31-new Date(_date).getDate())*24*60*60*1000).getMonth()+1 ? 31 : 30;
    let n = (new Date(`${_date.getMonth()+1}/01/${_date.getFullYear()}`).getDay());
    const workoutDates = monthlyWorkoutDates(); 
    for (i=1;i<=len;i++){
        // debugger
        let clone = dateBody.cloneNode(true);
        n = n > 6 ? 0 : n;
        clone.textContent = `${dayNames[n++]}\n${i}`
        workoutDates.includes(i)? clone.style.backgroundColor = "grey" : "";
        frag.append(clone);
    }
    calendarBody.append(frag);
    calendarElem.firstElementChild.after(calendarBody);
}

function scrollMonth(e){
    const d = new Date(date);
    let monthnum = months.findIndex(m => m===e.target.parentElement.children[1].textContent)+1;
    if(e.target.textContent === "<<"){
        monthnum -= 1;
    }
    else if(e.target.textContent === ">>"){
        monthnum += 1;
    }
    e.target.parentElement.children[1].remove();
    e.target.parentElement.parentElement.lastElementChild.remove();
    createCalendar(`${monthnum}/${d.getDate()}/${d.getFullYear()}`);
}

function monthlyWorkoutDates(){
    let monthnum = months.findIndex(m => m===calendarElem.firstElementChild.children[1].textContent);
    return pastWorkoutsObject.flatMap(([k,{workoutName, ...v}])=> { 
        let d = new Date(k);
        return d.getMonth() === monthnum ? [d.getDate()] : [] ;
    })
}

let monthlyWorkouts = currentMonthWorkouts.length ;
let monthlyWorkoutsPrev = pastMonthWorkouts.length ;
let lowIntensityDays = currentMonthWorkouts.filter(([k,v])=> v["workoutIntensity"]<=5).length|| "-";
let lowIntensityDaysPrev =  pastMonthWorkouts.filter(([k,v])=> v["workoutIntensity"]<=5).length|| "-" ;
let restDays = findHighlight(currentMonthWorkouts,"rest")|| "-";
let restDaysPrev = findHighlight(pastMonthWorkouts,"rest")|| "-";
let deloadDays = findHighlight(currentMonthWorkouts,"deload")|| "-";
let deloadDaysPrev = findHighlight(pastMonthWorkouts,"deload")|| "-";
let rIntenisty = findHighlight("","intensity")?.[0] || "-"  ;
let rIntenistyPrev = findHighlight("","intensity")?.[1] || "-";
let rEfficiency = findHighlight("","efficiency")?.[0] || "-";
let rEfficiencyPrev = findHighlight("","efficiency")?.[1] || "-";
let rFatigue = "NA";
let rFatiguePrev = "NA";
let bestLifts = findHighlight(currentMonthWorkouts,"bestlifts")?.[0] || "-" ;
let bestLiftsPrev =  findHighlight(pastMonthWorkouts,"bestlifts")?.[1] || "-";
let worstLifts =  findHighlight(currentMonthWorkouts,"worstlifts")?.[0] || "-" ;
let worstLiftsPrev =  findHighlight(pastMonthWorkouts,"worstlifts")?.[1] || "-";
let progress =  findHighlight(currentMonthWorkouts,"progress")?.[0] || "-" ;
let progressPrev =  findHighlight(pastMonthWorkouts,"progress")?.[1] || "-";
let regression =  findHighlight(currentMonthWorkouts,"regression")?.[0] || "-" ;
let regressionPrev =  findHighlight(pastMonthWorkouts,"regression")?.[1] || "-";
let PRs =  findHighlight(currentMonthWorkouts,"bestlifts")?.[2] || "-" ;
let PRsPrev =  findHighlight(pastMonthWorkouts,"bestlifts")?.[3] || "-";
let redZones = "NA";
let redZonesPrev =  "NA" ;
let maxThree =  findHighlight(currentMonthWorkouts,"maxthree")?.[0] || "-";
let maxThreePrev =  findHighlight(pastMonthWorkouts,"maxthree")?.[1] || "-";

function enableScroll(e){
    let bool = e.target.parentElement.id.includes("monthly") ? true : false
    let monthlyHighlightArray = [["Monthly Workouts",monthlyWorkouts,monthlyWorkoutsPrev],
        ["Low Intensity Days",lowIntensityDays,lowIntensityDaysPrev],
        ["Rest Days",restDays,restDaysPrev],
        ["Deload Days",deloadDays,deloadDaysPrev],
        ["Relative Intenisty",rIntenisty,rIntenistyPrev],
        ["Relative Efficiency",rEfficiency,rEfficiencyPrev],
        ["Relative Fatigue",rFatigue,rFatiguePrev]
    ];
    let liftHighlightArray = [["Best Lifts",bestLifts,bestLiftsPrev],
        ["Worst Lifts",worstLifts,worstLiftsPrev],
        ["Progressing Lifts",progress,progressPrev],
        ["Regressing Lifts",regression,regressionPrev],
        ["PRs Hit",PRs,PRsPrev],
        ["Red Zone Hits",redZones,redZonesPrev],
        ["Max 3",maxThree,maxThreePrev]
    ]
    let l = bool ? monthlyHighlightArray.length-1 : liftHighlightArray.length-1;
    let i = bool ? monthlyScroll : liftsScroll;
    if(e.target.id.includes("right")) {
        i++ ; 
        i = i > l ? 0 : i ;
        e.target.previousElementSibling.firstElementChild.textContent = bool ? monthlyHighlightArray[i][0] : liftHighlightArray[i][0];
        e.target.previousElementSibling.lastElementChild.firstElementChild.textContent = bool ? monthlyHighlightArray[i][1] : liftHighlightArray[i][1];
        e.target.previousElementSibling.lastElementChild.lastElementChild.textContent = bool ? monthlyHighlightArray[i][2] : liftHighlightArray[i][2];
        if (!bool) e.target.previousElementSibling.lastElementChild.firstElementChild.classList.toggle("stat-number-value", i===4 || i===5);
        bool ? monthlyScroll=i : liftsScroll=i;
    }
    if(e.target.id.includes("left")) {
        i-- ; 
        i = i < 0 ? l : i ;
        e.target.nextElementSibling.firstElementChild.textContent = bool ? monthlyHighlightArray[i][0] : liftHighlightArray[i][0];
        e.target.nextElementSibling.lastElementChild.firstElementChild.textContent = bool ? monthlyHighlightArray[i][1] : liftHighlightArray[i][1];
        e.target.nextElementSibling.lastElementChild.lastElementChild.textContent = bool ? monthlyHighlightArray[i][2] : liftHighlightArray[i][2];
        if (!bool) e.target.nextElementSibling.lastElementChild.firstElementChild.classList.toggle("stat-number-value", i===4 || i===5);
        bool ? monthlyScroll=i : liftsScroll=i;
    }
}

function findHighlight(array,result){
    if(!array.length) return;
    if (result === "rest")
    {
        let n = new Date(array[0]?.[0])?.getMonth() === date.getMonth() ? date.getDate() : new Date(date - date.getDate()*24*60*60*1000).getDate() ;
        let workDates =  array.map(([k,v])=> new Date(k).getDate()).flat()
        let res = new Array(n).fill(0).map((e,i) => i+1);
        res = res.filter(e => !workDates.includes(e));
        return res.length;
    }
    if (result === "deload"){
        let n = new Date(array[0]?.[0])?.getMonth() === date.getMonth() ? date.getDate() : new Date(date - date.getDate()*24*60*60*1000).getDate() ;
        let workDates =  array.map(([k,v])=> new Date(k).getDate()).flat()
        let res = new Array(n).fill(0).map((e,i) => i+1);
        res = res.filter(e => !workDates.includes(e));
        let days = [];
        let temp = {};
        temp.deload = [];
        res.map((e,i,arr) => arr[i] === arr[i+1]-1).forEach((e,i) => { 
            if  (e && !temp[e]) {
                days.push(i);
                temp[e] = 1
            } 
            else if (e && temp[e]) {
                    days.push(i);
                    temp[e] += 1; 
            }
            else if (!e){
                if (temp[true] > 3) {
                    temp.deload.push(days);
                } 
                days=[];
                delete temp[true];
            }
        }) //if (days.length===0){days.push(i)} else if (e===true && days[days.length-1]===i-1){days.push(i)} else days.pop()
        return temp.deload.flat().length > 3 ? temp.deload.flat().length : 0;
    }
    if (result === "intensity" || result === "efficiency" ){
        debugger
        let twoMonthsBeforeVols = dataInterface.getStat("vol",twoMonthsBeforeWorkouts,arr=>arr,arr=>arr.map(e=>e[1]));
        let volumesPast = dataInterface.getStat("vol",pastMonthWorkouts,arr=>arr,arr=>arr.map(e=>e[1])) ;
        let volumesNow = dataInterface.getStat("vol",currentMonthWorkouts,arr=>arr,arr=>arr.map(e=>e[1]));

        let twoMonthsBeforedurations = twoMonthsBeforeWorkouts.map(([k,v],i)=> (new Date(v["workoutDate"]+ " " +v["workoutEndTime"])-new Date(v["workoutDate"]+ " " +v["workoutStartTime"]))/(1000*60));
        let durationsPast = pastMonthWorkouts.map(([k,v],i)=> (new Date(v["workoutDate"]+ " " +v["workoutEndTime"])-new Date(v["workoutDate"]+ " " +v["workoutStartTime"]))/(1000*60));
        let durationsNow = currentMonthWorkouts.map(([k,v],i)=> (new Date(v["workoutDate"]+ " " +v["workoutEndTime"])-new Date(v["workoutDate"]+ " " +v["workoutStartTime"]))/(1000*60));
        let res;
        if (result === "intensity"){
            res = [(volumesNow.reduce((a,b)=>a+b)/volumesNow.length)/(volumesPast.reduce((a,b)=>a+b)/volumesPast.length), (volumesPast.reduce((a,b)=>a+b)/volumesPast.length)/(twoMonthsBeforeVols.reduce((a,b)=>a+b)/twoMonthsBeforeVols.length)]
            return res.map(e => e.toFixed(2));
        }
        else{
            res = [(volumesNow.reduce((a,b)=>a+b)/durationsNow.reduce((a,b)=>a+b))/(volumesPast.reduce((a,b)=>a+b)/durationsPast.reduce((a,b)=>a+b)), (volumesPast.reduce((a,b)=>a+b)/durationsPast.reduce((a,b)=>a+b))/(twoMonthsBeforeVols.reduce((a,b)=>a+b)/twoMonthsBeforedurations.reduce((a,b)=>a+b))]
            return res.map(e => e.toFixed(2));
        }
    }
     
    if (result === "bestlifts"||result === "worstlifts" ){
        let liftLoadPairArrayPrev = dataInterface.getStat("weight",pastMonthWorkouts,arr=>Math.max(...arr),arr=>arr.map(e=>e),arr=>arr).flat().unique((a,b)=> a.toString()+" "+b.toString()).flatMap(arr => {let temp = typeof arr[1] === "string" ? arr[1].split(" ") : arr[1]; return temp.length ? [[arr[0], temp[temp.length-1]*1-temp[0]*1]] : []}) ; 
        let liftLoadPairArrayNow = dataInterface.getStat("weight",currentMonthWorkouts,arr=>Math.max(...arr),arr=>arr.map(e=>e),arr=>arr).flat().unique((a,b)=> a.toString()+" "+b.toString()).flatMap(arr => {let temp = typeof arr[1] === "string" ? arr[1].split(" ") : arr[1]; return temp.length ? [[arr[0], temp[temp.length-1]*1-temp[0]*1]] : []}) ;
        if(result === "bestlifts"){
            let top3Now = liftLoadPairArrayNow.sort((a,b)=> b[1]-a[1]).filter((a,b)=>b>0).slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n")|| "Plateau" ;
            let top2Prev = liftLoadPairArrayPrev.sort((a,b)=> b[1]-a[1]).filter((a,b)=>b>0).slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n") || "Plateau" ;
            return [top3Now,top2Prev];
        }
        if(result === "worstlifts"){
            let top3Now = liftLoadPairArrayNow.sort((a,b)=> a[1]-b[1]).slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n") ;
            let top2Prev = liftLoadPairArrayPrev.sort((a,b)=> a[1]-b[1]).slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            return [top3Now,top2Prev];
        }
    }
    if (result === "progress" || result === "regression"){
        let liftVolPairArrayPrev = dataInterface.getStat("vol",pastMonthWorkouts,arr=>arr,arr=>arr.map(e=>e),arr=>arr).flat().unique((a,b)=> a.toString()+" "+b.toString()).flatMap(arr => {let temp = typeof arr[1] === "string" ? arr[1].split(" ") : arr[1]; return temp.length ? [[arr[0], temp[temp.length-1]*1-temp[0]*1]] : []}) ; 
        let liftVolPairArrayNow = dataInterface.getStat("vol",currentMonthWorkouts,arr=>arr,arr=>arr.map(e=>e),arr=>arr).flat().unique((a,b)=> a.toString()+" "+b.toString()).flatMap(arr => {let temp = typeof arr[1] === "string" ? arr[1].split(" ") : arr[1]; return temp.length ? [[arr[0], temp[temp.length-1]*1-temp[0]*1]] : []}) ;
        if(result === "progress"){
            let top3Now = liftVolPairArrayNow.sort((a,b)=> b[1]-a[1]).slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            let top2Prev = liftVolPairArrayPrev.sort((a,b)=> b[1]-a[1]).slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            return [top3Now,top2Prev];
        }
        if(result === "regression"){
            let top3Now = liftVolPairArrayNow.sort((a,b)=> a[1]-b[1]).slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            let top2Prev = liftVolPairArrayPrev.sort((a,b)=> a[1]-b[1]).slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n"); ;
            return [top3Now,top2Prev];
        }
    }
    if(result === "maxthree"){
        let top3PairArrayNow = dataInterface.getStat("weight",currentMonthWorkouts,arr=>Math.max(...arr),arr=>arr.map(e=>e),arr=>arr).flat().unique(Math.max).sort((a,b)=> b[1]-a[1])
        let top3PairArrayPrev = dataInterface.getStat("weight",pastMonthWorkouts,arr=>Math.max(...arr),arr=>arr.map(e=>e),arr=>arr).flat().unique(Math.max).sort((a,b)=> b[1]-a[1]);
        let top3Now = top3PairArrayNow.slice(0,3).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n");
        let top2Prev = top3PairArrayPrev.slice(0,2).map(arr=>arr[0].capitalizeAllFirst("_")).join("\n");
        return [top3Now,top2Prev];
    }
    
}

function calcRZ(){
    if (date.getMonth() !== new Date(date-24*60*60*1000).getMonth()){ 
        localStorage.rz = JSON.stringify([]);
    }
    let rzArray = localStorage?.rz ? JSON.parse(localStorage?.rz) : [] ; 
    let rzObject = Object.fromEntries(rzArray);
    [...nameMap].filter(arr => arr[1] >= 100).forEach(([k,v]) => { 
        if(rzObject?.[k] < v) {
            rzArray = rzArray.map(([p,q])=>[p, p===k ? v : q])
        } 
        if(!rzObject?.[k]){
            rzArray.push([k,v])
        }
    })
    localStorage.rz =  JSON.stringify(rzArray);
    return rzArray.length;
}