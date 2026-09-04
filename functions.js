// Best-effort companion to the landscape overlay in styles.css. This can
// actively hold the device in portrait, but only under conditions most
// browsers require (fullscreen, or an installed/standalone PWA) -- it
// silently does nothing outside those, and iOS Safari never implemented
// this API at all in any context. The CSS overlay is what actually
// guarantees portrait-only behavior everywhere; this is purely a bonus
// where the platform allows it.
try { screen.orientation?.lock?.("portrait")?.catch(() => {}) } catch (e) {}

// Shows a small tap-to-refresh banner once a newer service worker has
// finished installing and is sitting idle, waiting for permission to take
// over. Only one instance no matter how many times this fires.
function showUpdateBanner(worker) {
  if (document.getElementById("sw-update-banner")) return;
  const banner = document.createElement("div");
  banner.id = "sw-update-banner";
  banner.textContent = "Update available -- tap to refresh";
  banner.onclick = () => worker.postMessage("SKIP_WAITING");
  document.body.appendChild(banner);
}

// Registering the same URL twice is a safe no-op (the browser recognizes an
// already-registered worker and does nothing), so this can run unguarded on
// every page. Deferred to `load` so it doesn't compete with the page's own
// scripts/images for bandwidth on first paint.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then((reg) => {
      // A newer worker already finished installing before this page even
      // opened (e.g. it updated in a tab that was open in the background).
      if (reg.waiting) showUpdateBanner(reg.waiting);

      // A newer worker starts installing sometime during this page's life.
      reg.addEventListener("updatefound", () => {
        const incoming = reg.installing;
        if (!incoming) return;
        incoming.addEventListener("statechange", () => {
          // "installed" + an existing controller = a real update (the very
          // first install ever also passes through "installed", but there's
          // no controller yet at that point, so it's correctly skipped here).
          if (incoming.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateBanner(incoming);
          }
        });
      });
    }).catch(() => {});

    // Fires once the tapped worker actually takes over. Guarded so a second
    // controllerchange (shouldn't normally happen) can't reload twice.
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      location.reload();
    });
  });
}

const sortByDate = Intl.Collator(undefined,{numeric:true}).compare;

// Converts an exercise's display name to its exerciseDB key -- the same
// transform loadOptions() (exercises.js) already uses for assigning each
// rendered option's id, extracted here so every OTHER place that needs to
// reverse a display name back into a key (exercises.js's selection flow,
// pastworkout.js's calendar lookup) uses the identical, punctuation-safe
// version instead of each rolling its own ".replaceAll(' ','_')" -- that
// naive version breaks on anything beyond spaces (parentheses, apostrophes,
// slashes -- e.g. "Barbell Bench Press (Flat)" or "Farmer's Walk"), which
// silently produces a key that doesn't exist in the database.
function nameToId(name){
    return name.replaceAll(/[ ]|(?<!\d)-/g,"_").replaceAll(/[^-\w]/g,"").toLowerCase();
}
String.prototype.capitalizeAllFirst = function(seperator=" ",joiner=" "){
    try{
        return this.split(seperator).map(word => word.replace(word[0],word[0].toUpperCase())).join(joiner);
    }
    catch(e){
        return this.valueOf();
    }
}

Array.prototype.unique = function(f){
    let storage = {};
    if (!this.length) return [];
    this.forEach((val,i) => {
        if (Array.isArray(val) && typeof (val[1]*1) === "number" ){
            storage[val[0]] = storage?.[val[0]] ? f.call(this,storage[val[0]],val[1]) : val[1];
        }
        else{
            storage[val] = storage?.[val] ? storage[val]+1 : 1; 
        }
    })
    return Object.entries(storage);
}

Array.prototype.crossMult = function(arr){
    let l1 = this.length;
    let l2 = arr.length; 
    if(l1 !== l2){
        l1>l2 ? this.length = l2 : arr.length = l1 ;
    }
    let innerArr = [];
    if (!this.length){return []}
    for (i=0;i<this.length;i++){
        innerArr.push([this[i],arr[i]]);
    }
    return innerArr.map(array => array.reduce((a,b)=>a*b)).reduce((a,b)=>a+b);
}

class CustomHTMLElement extends HTMLElement {
constructor(){
    super();

    this.attachShadow({mode:"open"});
    this.shadowRoot.append(CustomHTMLElement.template.content.cloneNode(true));

    this.option = this.shadowRoot.querySelector("#content");
    let rightSlot = this.shadowRoot.querySelector("slot[name='right']");
    this.slotElem = document.createElement("img");

    rightSlot.append(this.slotElem);
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
get color(){
    return this.getAttribute("color");
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
set color(string){
    return this.setAttribute("color", string);
}
set node(nodename){
    return this.setAttribute("node", nodename);
}
set inserthtml(htmlstring){
return this.setAttribute("inserthtml", htmlstring);
}
}
CustomHTMLElement.observedAttributes = ["value","id","src","alt","width","display","color","center","node","inserthtml"];
CustomHTMLElement.template = document.createElement("template");
CustomHTMLElement.template.innerHTML = `<style>
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

class DataInterface extends Object{
    // constructor(){
    //     super()
    //     this.indices = {};
    //     this.i = 0;
    // }
    new(object){
        return Object.assign(this,object);
    }
    size(){
        return [...this].length;
    }
    get(k){
        return this[k];
    }
    at(n,obj){
        obj = obj && typeof obj === "object" && !Array.isArray(obj)? new DataInterface().new(obj) : this;
        let key = obj.toKeys()[n];
        return obj[key];
    }
    valuesAt(n,key){
        return this.at(n)[key];
    }
    toArray(){
        return Object.entries(this).sort(sortByDate);
    }
    toKeys(){
        return Object.keys(this).sort(sortByDate)
    }
    nextKeys(n,obj){
        let innerObject = this.at(n,obj);
        return Object.keys(innerObject);
    }
    workoutData(key){
        let id = this.toKeys().findIndex(k => k===key);
        let res = id<0 ? this.at(key) : this.at(id);
        return res["workoutExercises"];
    }
    range(start,end){
        let s = this.toKeys().findIndex(k => k===start)  ;
        let e = this.toKeys().findIndex(k => k===end) ;
        s = s!==-1 ? s : start;
        e = e!==-1 ? e : end;
        return [...this].slice(s,e+1);
    }
    byMonth(monthnum,year = new Date().getFullYear()){
        // debugger
        if (monthnum>12 || monthnum<0) return [];
        let s = this.toKeys().findIndex(k => new Date(k).getMonth() === monthnum-1 && new Date(k).getFullYear() === year)  ;
        // findIndex returns -1 when no workout falls in this month/year --
        // without this guard, slice(-1) below reads as "last element of the
        // whole array" instead of "nothing found", silently pulling in the
        // most recent workout from a different month.
        if (s < 0) return [];
        let e = this.toKeys().findIndex(k => new Date(k).getMonth() === monthnum && new Date(k).getFullYear() === year) ;
        return e < 0 ? [...this].slice(s) : [...this].slice(s,e);
    }
    byExercise(exercise){
        let res = []
        for (let array of this){
            let key = array[0];
            let exerciseObject = array[1]["workoutExercises"];
            let exerciseNames = Object.keys(exerciseObject);
            if (exerciseNames.includes(exercise)){
                res.push([key,exerciseObject])
            }
        }
        return res;
    }
    byTarget(target,...range){
        let res = []
        for (let array of this){
            let key = array[0];
            let exerciseObject = array[1]["workoutExercises"];
            // Same missing-field crash as getValue below -- an exercise
            // with no "targets" tuple made .find(...) return undefined,
            // and [1] on that threw instead of just excluding it (it can't
            // match a target it doesn't have data for).
            let targetExercises = Object.entries(exerciseObject).filter(([k,v])=>v.find(data=> data[0]==="targets")?.[1]?.slice(range[1],range[0])?.some(part => part.includes(target)));
            if (targetExercises.length){
                res.push([key,Object.fromEntries(targetExercises)])
            }
        }
        return res;
    }
    getStat(stat,groupBy=[...this],gn,fn,reducer){
        gn = gn ? gn : arr=>arr.reduce((a,b) => a+b);
        fn = fn ? fn : arr=>arr.map(e => e[1]);
        reducer = reducer ? reducer : arr=>arr.reduce((a,b) => a+b);
        let res = [];
        for (let array of groupBy){
            let statsArray = [];
            let key = array[0];
            let valuesArray = Object.entries(array[1]["workoutExercises"]||array[1]);
            // debugger
            valuesArray.forEach(([k,v])=> {
                let wtMultiple = v.find(sArr => sArr[0].includes("wtMultiple"))?.[1]*1||1;
                let repMultiple = v.find(sArr => sArr[0].includes("repMultiple"))?.[1]*1||1;
                let multiplier = stat === "weight" ?  wtMultiple : stat === "reps"?  repMultiple : 1;
                let values = v.filter(sArr => sArr[0].includes(stat)).map(arr=> arr[1] === "-"|| arr[1] === 0 ? 0 : arr[1]*1 ? arr[1]*multiplier : "").filter(e => typeof e === "number" );
                if (values.length){
                    values = values.length === 1 ? values[0] : gn.call(null,values);  
                    statsArray.push([k,values]);
                }
            });
            // debugger
            res.push([key,statsArray]);
        }
        return res.map(arr => reducer.call(null,fn.call(null,arr[1])));
        //.map(arr => arr[1].length>=1 ? arr[1].map(arr => arr[1]).reduce(reducer) : 0);
    }
    getValue(part,stat,r = (a,b) => (a*1||0)+(b*1||0),...range){
        // .reduce(r) with no initial value and exactly one element returns
        // that element untouched -- r is never called, so it stays whatever
        // raw type .find() returned (a string, from the stored JSON values).
        // Coercing every element to a number up front means callers always
        // get a real number back regardless of how many matches there were,
        // instead of a string that silently turns "+" into concatenation.
        // .find(...)[1] crashed outright whenever an exercise didn't have
        // this stat yet -- "load"/"repCount" in particular are only
        // computed and stored once pastworkout.js's handleEditData has
        // touched that exercise at least once (see its weight/reps
        // branch); a freshly logged, never-edited workout has neither.
        // ?. turns that into undefined instead of throwing, which the
        // v*1||0 step right after already normalizes to 0.
        let res =  this.byTarget(part,range[0],range[1]).map(([k,v])=> Object.entries(v).map(arr => arr[1].find(([p,q])=> p.includes(stat))?.[1])).flat().map(v => v*1||0)
        return res.length? res.reduce(r) : 0;
    }
    *[Symbol.iterator](){
        let keys = this.toKeys();
        let array = this.toArray();
        for (let x=0; x < keys.length; x++ ){
            yield  array[x];
        }
    }
}

// ---- Shared muscle-diagram color ramp ----
//
// Validated ordinal red ramp (dataviz skill: single hue, monotone
// lightness, checked against the app's actual dark background) for the 5
// real fatigue tiers. Tier 0 (no data) is deliberately NOT a color in this
// palette -- "resting" means restoring whatever that specific element's
// own SVG source already authored (grey for an ordinary muscle, white for
// erectorspinae's shape in backsvg.js, etc.), never a hardcoded standin.
// Color coding only ever TEMPORARILY overrides that native appearance;
// the absence of workout/soreness data restores it. index.js's own
// nameMap loop already relies on exactly this (it only ever calls into
// this function when there's actual volume for a muscle, so an untouched
// one is simply never written to and stays as authored); profile.js's
// interactive +/- additionally needs this function to actively restore
// the native color when a muscle is stepped back down to 0, since by then
// its fill has already been overwritten once in the same render.
const TIER_COLORS = [
    {stroke: "#f6c2ba", fill: "#f6c2ba"}, // 1
    {stroke: "#e79a8b", fill: "#e79a8b"}, // 2
    {stroke: "#dc7a63", fill: "#dc7a63"}, // 3
    {stroke: "#d1543b", fill: "#d1543b"}, // 4
    {stroke: "#c62a1c", fill: "#c62a1c"}, // 5 -- most fatigued
];
function applyTierColor(el, tier){
    // Captured lazily, the first time this element is ever touched --
    // before anything below has a chance to overwrite it -- so tier 0 has
    // the real original value to restore rather than a guess.
    if (el.dataset.nativeFill === undefined){
        el.dataset.nativeFill = el.getAttribute("fill");
        el.dataset.nativeStroke = el.getAttribute("stroke");
    }
    if (tier <= 0){
        el.setAttribute("fill", el.dataset.nativeFill);
        el.setAttribute("stroke", el.dataset.nativeStroke);
        return;
    }
    const {stroke, fill} = TIER_COLORS[Math.max(0, Math.min(TIER_COLORS.length-1, tier-1))];
    el.setAttribute("stroke", stroke);
    el.setAttribute("fill", fill);
}

// ---- IndexedDB-backed workout log + templates ----
//
// workoutLogObject/templates used to live in localStorage, which caps out
// around 5MB per origin -- a real ceiling for years of logged workouts.
// IndexedDB draws from the browser's much larger general storage quota
// instead. This file owns the DB entirely: every other page-specific
// script (history.js, index.js, logworkout.js, pastworkout.js, settings.js,
// stats.js, template.js, trends.js, exercises.js) reads the loaded data
// from window.workoutLogData/window.templatesData (plain globals, already
// populated by the time those scripts run -- see PAGE_SCRIPTS/initApp
// below) and writes through window.LoggerDB.saveWorkoutLog/saveTemplates,
// never touching indexedDB or localStorage for this data directly.
const DB_NAME = "loggerOneDB";
const DB_VERSION = 2;
let dbInstance = null;
let dbAvailable = true;

function openDB(){
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("workouts")) db.createObjectStore("workouts", {keyPath: "key"});
            if (!db.objectStoreNames.contains("templates")) db.createObjectStore("templates", {keyPath: "name"});
            if (!db.objectStoreNames.contains("muscleSoreness")) db.createObjectStore("muscleSoreness", {keyPath: "muscle"});
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function idbGetAll(db, storeName){
    return new Promise((resolve, reject) => {
        const req = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function idbCount(db, storeName){
    return new Promise((resolve, reject) => {
        const req = db.transaction(storeName, "readonly").objectStore(storeName).count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Replaces the ENTIRE contents of a store, matching this app's existing
// "always rewrite the whole array/object" save pattern (nothing currently
// does a single-record patch) -- one transaction, so a page reload mid-save
// can never observe a half-cleared store.
function idbReplaceAll(db, storeName, records){
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        store.clear();
        records.forEach(r => store.put(r));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Reconstructs the exact [key, value] tuple-array shape every page already
// expects from JSON.parse(localStorage.workoutLogObject).
async function loadWorkoutLog(db){
    const rows = await idbGetAll(db, "workouts");
    return rows.map(({key, ...value}) => [key, value]);
}

// Reconstructs the exact {name: data} shape every page already expects
// from JSON.parse(localStorage.templates).
async function loadTemplates(db){
    const rows = await idbGetAll(db, "templates");
    return Object.fromEntries(rows.map(({name, data}) => [name, data]));
}

// {muscle: tier} -- e.g. {biceps: 3}. Absent muscle = tier 0 (resting).
async function loadMuscleSoreness(db){
    const rows = await idbGetAll(db, "muscleSoreness");
    return Object.fromEntries(rows.map(({muscle, tier}) => [muscle, tier]));
}

async function saveWorkoutLog(db, arrayOfTuples){
    await idbReplaceAll(db, "workouts", arrayOfTuples.map(([key, value]) => ({key, ...value})));
    window.workoutLogData = arrayOfTuples;
}

async function saveTemplates(db, obj){
    await idbReplaceAll(db, "templates", Object.entries(obj).map(([name, data]) => ({name, data})));
    window.templatesData = obj;
}

async function saveMuscleSoreness(db, obj){
    await idbReplaceAll(db, "muscleSoreness", Object.entries(obj).map(([muscle, tier]) => ({muscle, tier})));
    window.muscleSorenessData = obj;
}

// One-time move of whatever's already in localStorage into IndexedDB.
// Writes the new copy FIRST and only deletes the old localStorage key once
// that write has actually completed -- an interrupted migration (tab
// closed mid-way, etc.) just retries on the next load instead of losing
// anything, since the old key is still sitting there untouched.
async function migrateFromLocalStorage(db){
    if (await idbCount(db, "workouts") === 0 && localStorage?.workoutLogObject){
        const existing = JSON.parse(localStorage.workoutLogObject);
        if (existing.length) await saveWorkoutLog(db, existing);
        delete localStorage.workoutLogObject;
    }
    if (await idbCount(db, "templates") === 0 && localStorage?.templates){
        const existing = JSON.parse(localStorage.templates);
        if (Object.keys(existing).length) await saveTemplates(db, existing);
        delete localStorage.templates;
    }
}

// One-time field rename on existing workout entries: workoutSoreness (the
// old name) -> workoutSystemicFatigue (what that same whole-workout scale
// is now called). Runs every load but is a no-op once every entry has
// already been migrated, since the old key is deleted as it goes.
async function migrateSorenessField(db, workoutLogData){
    let changed = false;
    const migrated = workoutLogData.map(([key, value]) => {
        if (value.workoutSoreness === undefined || value.workoutSystemicFatigue !== undefined) return [key, value];
        changed = true;
        const {workoutSoreness, ...rest} = value;
        return [key, {...rest, workoutSystemicFatigue: workoutSoreness}];
    });
    if (changed) await saveWorkoutLog(db, migrated);
    return migrated;
}

// Public write API for every other page's script. Falls back to
// localStorage if IndexedDB failed to open for this session (private
// browsing restrictions, browser quirks, etc.) rather than silently
// dropping the write.
window.LoggerDB = {
    saveWorkoutLog: async (arr) => {
        if (dbAvailable && dbInstance){
            try { await saveWorkoutLog(dbInstance, arr); return; }
            catch(e){ console.warn("IndexedDB write failed, falling back to localStorage", e); }
        }
        window.workoutLogData = arr;
        localStorage.workoutLogObject = JSON.stringify(arr);
    },
    saveTemplates: async (obj) => {
        if (dbAvailable && dbInstance){
            try { await saveTemplates(dbInstance, obj); return; }
            catch(e){ console.warn("IndexedDB write failed, falling back to localStorage", e); }
        }
        window.templatesData = obj;
        localStorage.templates = JSON.stringify(obj);
    },
    saveMuscleSoreness: async (obj) => {
        if (dbAvailable && dbInstance){
            try { await saveMuscleSoreness(dbInstance, obj); return; }
            catch(e){ console.warn("IndexedDB write failed, falling back to localStorage", e); }
        }
        window.muscleSorenessData = obj;
        localStorage.muscleSoreness = JSON.stringify(obj);
    },
};

// Systemic fatigue from a workout is only knowable the day after -- rather
// than track every unrated past entry, this only ever looks at the single
// most recently logged workout. If it's still unrated ("" -- see
// logworkout.js's saveWorkoutFunction) and its date is no longer today,
// prompt for it right here on app open. Runs on every page (this file is
// loaded everywhere, same as showUpdateBanner above) since "opening the
// app" doesn't always mean landing on index.html.
function checkLastWorkoutSystemicFatigue(){
    // pastworkout.html has its own "Edit Systemic Fatigue" button
    // (pastworkout.js) for exactly this -- popping this dialog up there too
    // would sit on top of the page and block that button (and everything
    // else on the page) behind a modal the user didn't ask for.
    if (document.body.id === "pastworkout") return;
    const log = window.workoutLogData || [];
    if (!log.length) return;
    const [key, entry] = log.slice().sort((a,b) => new Date(a[0]) - new Date(b[0])).at(-1);
    if (entry.workoutSystemicFatigue !== "") return; // already rated
    // entry.workoutDate was written with plain toLocaleDateString() (see
    // logworkout.js), whose slash order depends on the runtime's locale --
    // re-parsing that string with new Date() always assumes US month/day
    // order regardless of locale, silently landing on the wrong day
    // wherever the locale isn't US. Comparing the two raw
    // toLocaleDateString() strings directly sidesteps that parse entirely.
    const isToday = entry.workoutDate === new Date().toLocaleDateString();
    if (isToday) return; // still today -- not due yet
    showSystemicFatiguePrompt(key, entry, log);
}

function showSystemicFatiguePrompt(key, entry, log){
    if (document.getElementById("systemicfatigueprompt")) return;
    const dialog = document.createElement("dialog");
    dialog.id = "systemicfatigueprompt";
    const label = document.createElement("p");
    label.textContent = `How's your overall fatigue after "${entry.workoutName}" (${entry.workoutDate})?`;
    const input = document.createElement("input");
    input.type = "range";
    input.min = 0; input.max = 10; input.step = 1; input.value = 0;
    input.className = "gradient-range";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", async () => {
        entry.workoutSystemicFatigue = input.value;
        const updated = log.map(([k,v]) => k === key ? [k, entry] : [k, v]);
        await window.LoggerDB.saveWorkoutLog(updated);
        dialog.close();
        dialog.remove();
    });
    dialog.append(label, input, saveBtn);
    document.body.append(dialog);
    dialog.showModal();
}

// Maps each page's own <body id> (already used throughout for CSS scoping)
// to the script it should run -- but only once the workout/template data
// it depends on has actually loaded. Pages not listed here (exercisedetails.html,
// which has no body id or scripts at all) never read this data, so their
// own script tag stays static in the HTML, untouched by any of this.
const PAGE_SCRIPTS = {
    historypage: "history.js",
    indexpage: "index.js",
    createworkoutpage: "logworkout.js",
    pastworkout: "pastworkout.js",
    settingspage: "settings.js",
    statspage: "stats.js",
    createtemplatepage: "template.js",
    trendspage: "trends.js",
    createexercisespage: "exercises.js",
    profilepage: "profile.js",
};

async function initApp(){
    try {
        dbInstance = await openDB();
        await migrateFromLocalStorage(dbInstance);
        window.workoutLogData = await migrateSorenessField(dbInstance, await loadWorkoutLog(dbInstance));
        window.templatesData = await loadTemplates(dbInstance);
        window.muscleSorenessData = await loadMuscleSoreness(dbInstance);
    } catch(e){
        // IndexedDB unavailable this session (private browsing, storage
        // disabled, etc.) -- fall back to reading localStorage directly so
        // the app still works, just without the larger storage ceiling.
        console.warn("IndexedDB unavailable, using localStorage for this session", e);
        dbAvailable = false;
        window.workoutLogData = localStorage?.workoutLogObject ? JSON.parse(localStorage.workoutLogObject) : [];
        window.templatesData = localStorage?.templates ? JSON.parse(localStorage.templates) : {};
        window.muscleSorenessData = localStorage?.muscleSoreness ? JSON.parse(localStorage.muscleSoreness) : {};
    }
    checkLastWorkoutSystemicFatigue();
    const file = PAGE_SCRIPTS[document.body.id];
    if (file){
        const script = document.createElement("script");
        script.src = file;
        document.body.append(script);
    }
}
initApp();
