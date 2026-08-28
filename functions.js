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
            let targetExercises = Object.entries(exerciseObject).filter(([k,v])=>v.find(data=> data[0]==="targets")[1].slice(range[1],range[0]).some(part => part.includes(target)));
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
            res.push([key,statsArray]);
        }
        return res.map(arr => reducer.call(null,fn.call(null,arr[1])));
        //.map(arr => arr[1].length>=1 ? arr[1].map(arr => arr[1]).reduce(reducer) : 0);
    }
    getValue(part,stat,r = (a,b) => (a*1||0)+(b*1||0),...range){
        let res =  this.byTarget(part,range[0],range[1]).map(([k,v])=> Object.entries(v).map(arr => arr[1].find(([p,q])=> p.includes(stat))[1])).flat()
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
