// Surfaces any uncaught JS error or unhandled promise rejection directly
// on screen -- registered as the very first thing this file does, so it
// can catch failures from anywhere, including later in this same file.
// Exists because "a button is visually present but does nothing" is
// indistinguishable, from the outside, between a real thrown exception
// that killed every listener registered after it and a native-browser
// behavior silently intercepting the click (both have been real causes
// tonight) -- this makes that distinction directly visible instead of
// requiring Mac/Web Inspector access to find out. Kept permanently, not
// just for tonight's debugging: surfacing uncaught errors is worth having
// regardless.
function showJsErrorBanner(message){
    const banner = document.createElement("div");
    banner.className = "js-error-banner";
    banner.style.cssText = "position:fixed; top:0; left:0; right:0; z-index:999999; background:#c0392b; color:white; font-family:monospace; font-size:11px; padding:8px 32px 8px 8px; white-space:pre-wrap; word-break:break-word; box-shadow:0 2px 6px rgba(0,0,0,0.4);";
    banner.textContent = message;
    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = "position:absolute; top:4px; right:8px; cursor:pointer; font-weight:bold;";
    closeBtn.addEventListener("click", () => banner.remove());
    banner.append(closeBtn);
    document.body ? document.body.appendChild(banner) : document.addEventListener("DOMContentLoaded", () => document.body.appendChild(banner));
}
window.addEventListener("error", (e) => {
    showJsErrorBanner(`JS ERROR: ${e.message}\n${(e.filename||"").split("/").pop()}:${e.lineno}:${e.colno}`);
});
window.addEventListener("unhandledrejection", (e) => {
    showJsErrorBanner(`UNHANDLED PROMISE REJECTION: ${e.reason?.stack || e.reason}`);
});


// Best-effort companion to the landscape overlay in styles.css. This can
// actively hold the device in portrait, but only under conditions most
// browsers require (fullscreen, or an installed/standalone PWA) -- it
// silently does nothing outside those, and iOS Safari never implemented
// this API at all in any context. The CSS overlay is what actually
// guarantees portrait-only behavior everywhere; this is purely a bonus
// where the platform allows it.
try { screen.orientation?.lock?.("portrait")?.catch(() => {}) } catch (e) {}

// Every page pins its <body> to height:100dvh so only its own inner
// scroll area moves, never the whole page (see e.g. #indexpage's comment).
// dvh is supposed to already track the real visible height, but has been
// reported unreliable in standalone-PWA mode specifically on some iOS
// versions -- landing short of the true screen height and leaving a bare
// (unpainted) strip below the footer that no page-level fix can close,
// since the deficit is in the height value itself, not in how any element
// divides it up. This computes the real visible height directly from
// window.innerHeight/visualViewport (both report the actual on-screen
// pixels, independent of whatever dvh resolves to) into a CSS custom
// property; every page's height rule falls back to
// `calc(var(--vh, 1vh) * 100)` as a third line after 100vh/100dvh, so a
// browser where dvh already works correctly is unaffected (it's simply
// never reached) and one where it doesn't gets the real value instead.
// visualViewport specifically (over plain innerHeight) is what actually
// updates correctly as iOS shows/hides its own chrome and the on-screen
// keyboard; resize alone can miss those on some versions.

// 1. Keep your custom property setter
function setRealViewportHeight() {
    const h = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);
}
setRealViewportHeight();
window.addEventListener("resize", setRealViewportHeight);
window.visualViewport?.addEventListener("resize", setRealViewportHeight);
window.addEventListener("orientationchange", setRealViewportHeight);

// Clean, final keyboard handler for the footer only
function initKeyboardHandler() {
    const footer = document.getElementById("footer");
    if (!window.visualViewport || !footer) return;

    const updateFooter = () => {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        
        if (keyboardHeight > 100) {
            // Push ONLY the footer up by the exact keyboard height
            footer.style.position = "fixed";
            footer.style.bottom = `${keyboardHeight}px`;
            footer.style.left = "0";
            footer.style.width = "100%";
            footer.style.top = "auto"; // Ensure top isn't locked
        } else {
            // Reset footer back to normal CSS flow when keyboard closes
            footer.style.position = "";
            footer.style.bottom = "";
            footer.style.left = "";
            footer.style.width = "";
            footer.style.top = "";
        }
    };

    window.visualViewport.addEventListener("resize", updateFooter);
    window.visualViewport.addEventListener("scroll", updateFooter);
}

initKeyboardHandler();
// The actual mechanism behind the keyboard/footer bug and the debug
// overlay/dialogs rendering off-screen: position:fixed anchors to the
// LAYOUT viewport, which never moves. On iOS, opening the keyboard can
// scroll the VISUAL viewport (what's actually drawn on screen) to bring
// the focused input above the keyboard -- independently of the layout
// viewport, and independently of anything html{position:fixed} controls,
// since that's a DOM-scroll-level fix and this is a compositor-level
// scroll. A fixed element sitting at top:0 relative to the layout
// viewport can end up scrolled entirely off the currently-visible screen.
// The fix is to stop trusting plain position:fixed for anything that must
// stay on screen during keyboard use, and instead track
// visualViewport.offsetTop/offsetLeft directly, repositioning live.
function pinToVisualViewport(el, topOffsetFraction = 0){
    const vv = window.visualViewport;
    if (!vv) return () => {}; // no visualViewport API -- nothing to track, leave plain fixed positioning as the fallback
    const update = () => {
        el.style.position = "fixed";
        el.style.margin = "0";
        el.style.top = `${vv.offsetTop + vv.height * topOffsetFraction}px`;
        // Horizontal centering computed against the element's own rendered
        // width, not left:0/margin:auto -- overriding position/top already
        // means overriding margin (set to 0 above), so auto-centering via
        // margin no longer applies once this runs.
        el.style.left = `${vv.offsetLeft + (vv.width - el.offsetWidth) / 2}px`;
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update); };
}

// The keyboard-open layout glitch this is meant to fix (footer landing up
// near the header, a gap of bare background below it -- reported across
// exercises.html, settings.html, and template.html's workout-name field)
// is a documented, currently unresolved WebKit bug, not something app-side
// CSS alone can fully prevent: on iOS, opening the on-screen keyboard in
// an INSTALLED/standalone PWA specifically shrinks visualViewport/100dvh,
// but the two can desync from what's actually on screen -- the OS's own
// keyboard-avoidance scroll operates on a compositor-level "visual
// viewport" layer that sits above normal document scroll, which
// html{position:fixed} (styles.css) cannot fully override since that's a
// DOM/CSS-level mechanism, not a compositor one. setRealViewportHeight
// above reads whatever visualViewport.height currently reports -- but in
// standalone mode that value itself can go stale/stuck once the keyboard
// interaction starts, so correct JS logic reading a wrong number still
// produces a wrong layout.
//
// The documented workaround isn't a better read -- it's forcing WebKit to
// actually RE-MEASURE by toggling display on a full-viewport element
// (display:none, force a synchronous reflow, restore), which prompts it
// to recompute visualViewport/dvh correctly again. Run after the keyboard
// closes (blur), not while it's open (focus), since toggling display on
// an ancestor of the focused input would itself steal focus and close the
// keyboard mid-typing -- so this fixes the viewport staying wrong AFTER
// an input is done being edited, not the live-while-typing render (no
// app-side fix for that half currently exists; it's the open, unresolved
// half of this WebKit bug as of iOS 26).
// Every page's actual scroll container differs in structure (varies by
// page -- #exerciselist, #selectionlistdisplay, etc.), with no single
// reliable selector for "the current one" across all of them, and
// guessing wrong would restore scroll position onto the wrong element --
// a worse, more confusing jump than just leaving scroll position alone
// while the reflow runs.
let maxViewportHeight = window.innerHeight;
window.addEventListener("resize", () => { maxViewportHeight = Math.max(maxViewportHeight, window.innerHeight); });
function healViewportAfterKeyboard(){
    if (maxViewportHeight - window.innerHeight <= 4) return; // not actually stuck
    document.body.style.display = "none";
    void document.body.offsetHeight; // synchronous reflow -- forces the re-measure
    document.body.style.display = "";
    setRealViewportHeight();
}
document.addEventListener("focusout", (e) => {
    if (!["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
    setTimeout(healViewportAfterKeyboard, 150);
}, true);

// Disables pinch-zoom app-wide. CSS's touch-action:manipulation (styles.css)
// already covers double-tap-zoom and pinch-zoom in every standards-following
// browser, and the viewport meta tag's user-scalable=no covers the rest --
// except iOS Safari, which ignores user-scalable=no (an accessibility
// override since iOS 10) and still fires this non-standard two-finger-pinch
// event independent of touch-action. Left as the one JS-level backstop
// needed; unlike a touchend-timing double-tap guard, this can't misfire on
// legitimate fast repeated taps (e.g. mashing a weight/reps stepper), since
// it only ever fires for an actual multi-touch pinch gesture.
document.addEventListener("gesturestart", (e) => e.preventDefault());

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

// Small on-screen readout of exactly which build is controlling this page
// right now (sw.js's own CACHE_NAME, fetched live via postMessage rather
// than duplicated here, so it can never drift out of sync with the actual
// running worker) -- a direct, visible way to confirm a device is really on
// the latest deploy instead of inferring it from symptoms.
function showVersionTag(version) {
  if (document.getElementById("app-version-tag")) return;
  const tag = document.createElement("p");
  tag.id = "app-version-tag";
  tag.textContent = version;
  tag.style.cssText = "position:fixed; right:4px; font-size:9px; color:rgb(250, 250, 250); z-index:999998; pointer-events:none; font-family:monospace;";
  document.body.children['header'].appendChild(tag);
}
function requestVersionTag() {
  if (!navigator.serviceWorker.controller) return;
  const channel = new MessageChannel();
  channel.port1.onmessage = (e) => showVersionTag(e.data);
  navigator.serviceWorker.controller.postMessage("GET_VERSION", [channel.port2]);
}

// Registering the same URL twice is a safe no-op (the browser recognizes an
// already-registered worker and does nothing), so this can run unguarded on
// every page. Deferred to `load` so it doesn't compete with the page's own
// scripts/images for bandwidth on first paint.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    requestVersionTag();
    navigator.serviceWorker.register("sw.js").then((reg) => {
      // GitHub Pages serves sw.js itself with Cache-Control: max-age=600 --
      // the spec requires browsers to bypass HTTP cache for the update
      // check register() does internally, but that's not reliably honored
      // on every WebKit version, especially in an installed PWA. An
      // explicit update() call is the same spec-mandated bypass, called
      // again here in case register()'s own implicit check was the one
      // that got a stale response.
      reg.update().catch(() => {});

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

// Pure weight/volume math, shared by exercises.js's getStats (the full
// exercise editor, DOM-driven) and index.js's template quick-log popup
// (edits weight/reps directly on stored data, no DOM to read from) so both
// compute load/vol identically -- one implementation, not two that could
// drift apart. setWeights/setReps are plain per-set number arrays, already
// index-aligned (setReps[i] is the rep count for the same set setWeights[i]
// is the weight for); repMultiple/weightMultiple/equipmentWt are the same
// three values getStats already reads off the DOM (a unilateral-exercise
// rep/weight multiplier, and the bar/dumbbell's own base weight from
// settings). Matches exercises.js's previous inline formula exactly:
// totalWeight sums the set weights once, then applies weightMultiple and
// adds equipmentWt per set; totalVol applies both multipliers per set
// before summing, adding equipmentWt once per set there too.
function computeWeightVolume(setWeights, setReps, repMultiple, weightMultiple, equipmentWt){
    const totalWeight = setWeights.reduce((a,b) => a+b, 0) * weightMultiple + equipmentWt * setWeights.length;
    const totalVol = setWeights.reduce((sum,w,i) => sum + (w*weightMultiple*setReps[i]*repMultiple + equipmentWt), 0);
    return { totalWeight, totalVol };
}

// Isometric-exercise equivalent of computeWeightVolume above, same
// {totalWeight, totalVol} shape so it drops into the exact same
// load/vol tuple slots every downstream consumer (stats.js's charts,
// index.js's muscle map, the muscle-soreness feature, CSV export) already
// reads -- none of them care which formula produced the number.
//
// A hold has no natural "reps" the way a lifted weight does, so volume is
// built from time under tension instead: reps here means how many
// discrete holds/pulses happened within this ONE set (not multiple
// separate sets, which already have their own rest between them), TUT is
// the duration of each hold in seconds, and effort (2/4/6, see
// exercises.js's effortOptions -- Hard/Moderate/Easy) is a "seconds per
// rep-equivalent" divisor: a harder hold earns more volume credit per
// second than an easy one, since a genuinely hard hold is inherently
// brief and shouldn't be undervalued just for being short, while an easy
// hold sustained a long time shouldn't be over-credited just for
// lasting. setEfforts[i] falling back to 6 (Easy) if unset matches
// leaving the Effort select on its default/unset option -- the least
// volume credit per second, not the most, if effort was never actually
// selected.
function computeIsometricVolume(setWeights, setReps, setTUTs, setEfforts, repMultiple, weightMultiple, equipmentWt){
    const totalWeight = setWeights.reduce((a,b) => a+b, 0) * weightMultiple + equipmentWt * setWeights.length;
    const totalVol = setWeights.reduce((sum,w,i) => {
        const repEquivalent = (setReps[i]*repMultiple * setTUTs[i]) / (setEfforts[i] || 6);
        return sum + (w*weightMultiple*repEquivalent + equipmentWt);
    }, 0);
    return { totalWeight, totalVol };
}

// Multi-state bodyweight-toggle fractions (exercises.js's bodyweight()) --
// index 0 is "off" (manual entry), the rest cycle through how much of
// bodyweight a given movement/variation actually loads (a plank loads
// only a fraction of bodyweight, a pull-up loads essentially all of it --
// the exact fraction is a per-movement judgment call the user makes live,
// not something this app tries to guess per exercise).
const BW_FRACTIONS = [0, 0.25, 0.5, 0.75, 1];
const BW_LABELS = ["BW", "BW ¼", "BW ½", "BW ¾", "BW 1×"];

// Heaviest weight ever logged at true failure (RIR "-", this app's stored
// value for RIR 0 -- see timeOptions()'s j===0 special case in
// exercises.js) for one specific exercise, across all of workout history.
// Used as the TUT-suggestion's %1RM stand-in (see the user's own stated
// rule: any RIR-0 set's weight counts as the reference, no Epley-style
// extrapolation). Returns 0 if no such set has ever been logged for this
// exercise -- callers treat that as "no basis for a load-based estimate
// yet," not an error.
function getReferenceWeight(exerciseKey){
    let max = 0;
    (window.workoutLogData || []).forEach(([, entry]) => {
        const tuples = entry.workoutExercises?.[exerciseKey];
        if (!tuples) return;
        const setIdx = tuples.filter(([k]) => /^setnum\d+$/.test(k)).map(([k]) => k.slice(6)*1);
        setIdx.forEach(i => {
            const rir = tuples.find(([k]) => k === `rir${i}`)?.[1];
            if (rir !== "-") return;
            const w = parseFloat(tuples.find(([k]) => k === `weight${i}`)?.[1]) || 0;
            if (w > max) max = w;
        });
    });
    return max;
}

// Estimates a whole-set TUT (seconds) to pre-fill as a starting suggestion
// -- always freely overridable via the same TUT dropdown afterward, same
// as any other field.
//
// Earlier version multiplied one combined "how hard was this set" factor
// across EVERY rep -- so a longer set to failure (e.g. 13 reps) got just
// as inflated per rep as a short one, producing suggestions like 176s
// that nobody's bar speed stays that slow for. Real sets don't fail that
// way: the bar moves at roughly normal speed for most of the set, then a
// small, fairly fixed number of reps at the very end grind -- failure
// itself arrives abruptly, it doesn't gradually slow the whole set down.
// So grinding time is only ever added to a FIXED small rep count near the
// end (2 reps at true failure, 1 near failure, 0 otherwise), never scaled
// by total reps. The total still grows with rep count -- more reps
// legitimately takes longer -- just not because every rep is treated as
// a grind.
//
// Two effects: a load term (this set's weight relative to the heaviest
// RIR-0 set ever logged for this exercise -- 0 if no reference exists
// yet) nudges every rep's baseline tempo up a little, since heavier
// relative loads genuinely move slower throughout, not just at the end;
// and a grinding term adds extra time to only the last 1-2 reps. Neither
// constant is derived from a citation -- this is a starting heuristic,
// not a validated model. Deliberately not exposed as settings -- the
// override mechanism is just picking a different TUT value directly.
const TUT_TEMPO = 3, TUT_LOADCOEF = 0.3, TUT_GRIND_MULTIPLIER = 3;
function suggestTUTSeconds(reps, rir, weight, referenceWeight){
    const pctRef = referenceWeight > 0 ? weight/referenceWeight : 0;
    const baseTempo = TUT_TEMPO * (1 + TUT_LOADCOEF*pctRef);
    const grindingReps = Math.min(reps, rir === 0 ? 2 : (rir === 1 || rir === 2) ? 1 : 0);
    const grindingExtra = grindingReps * baseTempo * (TUT_GRIND_MULTIPLIER - 1);
    return Math.round(reps*baseTempo + grindingExtra);
}

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
// the absence of muscle-soreness data (decayedTier returning 0, below)
// restores it. index.js's renderMuscleSorenessMap and profile.js's
// interactive +/- both call this on every element unconditionally (tier 0
// included), so an untouched or fully-decayed muscle actively restores
// its native color rather than just never being written to.
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

// ---- Shared muscle soreness: one persisted tier per muscle ----
//
// Single source of truth for "how sore is this muscle right now", read by
// both index.js's home-page SVG and profile.js's soreness page so they
// always agree. A workout logged today ADDS a volume-based contribution to
// whatever a muscle's current (decayed) tier already is; profile.js's +/-
// adjusts that same stored value directly; the value decays back down on
// its own the longer a muscle goes untouched. See muscleSoreness's DB
// layer below for the {tier, lastUpdated} record shape this operates on.

// Calendar-day distance (midnight to midnight), not raw elapsed hours --
// matches every other today/backdated comparison already in this codebase
// (checkLastWorkoutSystemicFatigue below, logworkout.js's
// updateSystemicFatigueAvailability), and is what makes two workouts
// logged on the same real day both contribute in full with zero spurious
// decay between them.
function daysBetweenCalendar(fromMs, toMs){
    const a = new Date(fromMs); a.setHours(0,0,0,0);
    const b = new Date(toMs);   b.setHours(0,0,0,0);
    return Math.round((b - a) / 86400000);
}

// 1 tier point lost per full elapsed calendar day since this muscle was
// last touched (a workout contribution or a manual +/-), floored at 0.
// Never persisted on its own -- purely a read-time view of the stored
// record; only an actual mutation (see applyWorkoutToMuscleSoreness /
// profile.js's adjustMuscleTier) bakes a new value back into storage.
function decayedTier(record, now = Date.now()){
    if (!record) return 0;
    const elapsedDays = daysBetweenCalendar(record.lastUpdated, now);
    return Math.max(0, Math.min(TIER_COLORS.length, record.tier - elapsedDays));
}

// Distributes ONE workout's own volume across each exercise's mover
// muscles (["targets", [primary,secondary,tertiary,quaternary,quinary]])
// at fixed weights 65/25/5/3/2%, as a percentage of that workout's own
// total volume. Same weighting/mover-name normalization (dehyphenate,
// traps+rhomboids merge) index.js's recentWorkouts uses for its separate
// 7-day rolling Red-Zone/stats calculation -- but scoped to exactly one
// workout, with no dependency on any muscle SVG being present in the DOM
// (this runs at workout-save time; logworkout.html has no muscle map at
// all).
function computeWorkoutMuscleVolumePercents(workoutExercises){
    const percents = new Map();
    const addContribution = (muscle, amount) => {
        if (!muscle) return;
        muscle = muscle.replace("-", "");
        if (muscle === "traps" || muscle === "rhomboids") muscle = "traps/rhomboids";
        percents.set(muscle, (percents.get(muscle) || 0) + amount);
    };
    const entries = Object.values(workoutExercises);
    const movers = entries.map(arr => arr[0][1]);
    const volumes = entries.map(arr => arr[arr.findIndex(e => e[0] === "vol")][1]);
    const totalVol = volumes.reduce((a, b) => a + b, 0);
    if (!totalVol) return percents;
    movers.forEach(([primary, secondary, tertiary, quaternary, quinary], i) => {
        addContribution(primary,    (0.65 * volumes[i] * 100) / totalVol);
        addContribution(secondary,  (0.25 * volumes[i] * 100) / totalVol);
        addContribution(tertiary,   (0.05 * volumes[i] * 100) / totalVol);
        addContribution(quaternary, (0.03 * volumes[i] * 100) / totalVol);
        addContribution(quinary,    (0.02 * volumes[i] * 100) / totalVol);
    });
    return percents;
}

// Same percent->tier thresholds index.js's coloring used to apply
// directly -- now the shared mapping both the save-time contribution path
// and index.js's own render call into.
function tierForVol(vol){
    switch(true) {
        case vol>60: return 5;
        case vol>50: return 4;
        case vol>40: return 3;
        case vol>20: return 2;
        case vol>0: return 1;
        default: return 0;
    }
}

// Call once per newly-logged (today's) workout. For every muscle that
// actually got real volume, decays its current stored tier, adds this
// workout's contribution, clamps to the same 0-5 range applyTierColor
// renders, and stamps lastUpdated=now. A muscle with zero contribution is
// left completely untouched -- no decay-then-rewrite -- so incidental
// non-involvement doesn't reset that muscle's own decay clock.
async function applyWorkoutToMuscleSoreness(workoutExercises){
    const percents = computeWorkoutMuscleVolumePercents(workoutExercises);
    const data = window.muscleSorenessData || (window.muscleSorenessData = {});
    const now = Date.now();
    let changed = false;
    percents.forEach((pct, muscle) => {
        const contribution = tierForVol(pct);
        if (contribution <= 0) return;
        const current = decayedTier(data[muscle], now);
        data[muscle] = { tier: Math.max(0, Math.min(TIER_COLORS.length, current + contribution)), lastUpdated: now };
        changed = true;
    });
    if (changed) await window.LoggerDB.saveMuscleSoreness(data);
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
const DB_VERSION = 3;
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
            // AI-generated exercises (see generateExerciseWithAI) -- exercisesDB.js
            // is a static file a browser page can't rewrite, so these live here
            // instead and get merged into exerciseDB()'s return value at read time.
            if (!db.objectStoreNames.contains("customExercises")) db.createObjectStore("customExercises", {keyPath: "key"});
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

// {muscle: {tier, lastUpdated}} -- e.g. {biceps: {tier: 3, lastUpdated: 1234567890}}.
// Absent muscle = tier 0 (resting). lastUpdated (epoch ms, not a
// toLocaleDateString() string -- see checkLastWorkoutSystemicFatigue's
// comment on why locale date strings are unsafe to re-parse) drives
// decayedTier's day-based decay above.
async function loadMuscleSoreness(db){
    const rows = await idbGetAll(db, "muscleSoreness");
    return Object.fromEntries(rows.map(({muscle, tier, lastUpdated}) => [muscle, {tier, lastUpdated}]));
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
    await idbReplaceAll(db, "muscleSoreness", Object.entries(obj).map(([muscle, {tier, lastUpdated}]) => ({muscle, tier, lastUpdated})));
    window.muscleSorenessData = obj;
}

// {exerciseKey: {name, bodypart, categories, movers, equipment, description,
// type, effectiveness, technicality, fatigue, media}} -- same shape as a
// literal entry in exerciseDB()'s own object, just stored separately.
async function loadCustomExercises(db){
    const rows = await idbGetAll(db, "customExercises");
    return Object.fromEntries(rows.map(({key, ...value}) => [key, value]));
}

async function saveCustomExercises(db, obj){
    await idbReplaceAll(db, "customExercises", Object.entries(obj).map(([key, value]) => ({key, ...value})));
    window.customExercisesData = obj;
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

// Normalizes a muscleSoreness record to the current {tier, lastUpdated}
// shape regardless of which OLDER shape it's coming from: a bare number
// (the very first shape, straight from JSON.parse(localStorage.muscleSoreness)
// on the IndexedDB-unavailable fallback path, which never goes through
// loadMuscleSoreness above) or an object missing lastUpdated (the DB-row
// shape before this field existed). True history is unknowable either
// way, so "now" is the only honest backfilled default -- same reasoning
// migrateSorenessField above already uses for its own rename backfill.
function normalizeMuscleSorenessRecord(rec, now = Date.now()){
    if (typeof rec === "number") return {tier: rec, lastUpdated: now};
    if (rec.lastUpdated === undefined) return {tier: rec.tier, lastUpdated: now};
    return rec;
}

// One-time DB-level backfill using the normalizer above.
async function migrateMuscleSorenessTimestamps(db, data){
    let changed = false;
    const now = Date.now();
    const migrated = Object.fromEntries(Object.entries(data).map(([muscle, rec]) => {
        const normalized = normalizeMuscleSorenessRecord(rec, now);
        if (normalized !== rec) changed = true;
        return [muscle, normalized];
    }));
    if (changed) await saveMuscleSoreness(db, migrated);
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
    saveCustomExercises: async (obj) => {
        if (dbAvailable && dbInstance){
            try { await saveCustomExercises(dbInstance, obj); return; }
            catch(e){ console.warn("IndexedDB write failed, falling back to localStorage", e); }
        }
        window.customExercisesData = obj;
        localStorage.customExercises = JSON.stringify(obj);
    },
};

// Shared here (not settings.js, where it originated) since it only reads
// window.workoutLogData/templatesData/muscleSorenessData/customExercisesData
// -- all populated by initApp() above on EVERY page, not just settings.html
// -- and localStorage.savedSettings directly. No dependency on any
// settings.html-specific DOM element, so it works identically from any
// page's own footer/button. Bundles everything into one downloaded JSON
// file the user fully controls, independent of this device's own
// IndexedDB/localStorage/service-worker cache.
async function handleFullBackup(e){
    e?.preventDefault?.();
    const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        workoutLogData: window.workoutLogData || [],
        templatesData: window.templatesData || {},
        muscleSorenessData: window.muscleSorenessData || {},
        customExercisesData: window.customExercisesData || {},
        savedSettings: JSON.parse(localStorage.savedSettings || "{}"),
    };
    const filename = `logger-one-backup-${new Date().toISOString().slice(0,10)}.json`;
    const json = JSON.stringify(backup, null, 2);

    // A plain <a download> click is unreliable specifically in an
    // installed/standalone iOS PWA -- it relies on browser-chrome download
    // handling that a standalone app can lack, so it can silently do
    // nothing. navigator.share() with a real File invokes the native
    // Share Sheet instead (Save to Files, AirDrop, Messages, etc.), which
    // is much better supported there -- tried first, falling back to the
    // download link only if the platform doesn't support sharing files at
    // all (canShare returns false) or the user backs out of the sheet.
    const file = new File([json], filename, { type: "application/json" });
    if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Logger.One Backup" }); return; }
        catch (err) { /* user cancelled the share sheet, or it failed -- fall through to the download link below */ }
    }

    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.click();
}

// toLocaleDateString()'s day/month/year ORDER depends on the runtime's
// locale (en-GB/en-IN: DD/MM/YYYY, en-US: MM/DD/YYYY, ...) -- every workout
// Map key and workoutDate/workoutStartTime/workoutEndTime field in this
// app is built with plain toLocaleDateString()/12-hour time strings (see
// logworkout.js's saveWorkoutFunction), and re-parsing one of those with
// plain `new Date(str)` always assumes US month/day order regardless of
// locale: silently wrong wherever day<=12, outright Invalid Date (and
// therefore NaN durations, blank calendars) wherever day>12. This asks the
// locale itself, via the same Intl formatter responsible for the string's
// format, which position is which, instead of assuming -- works for
// already-saved data too since it derives the order live rather than
// storing it, as long as the device's own date-format locale hasn't
// changed since. (trends.js used to keep its own private copy of exactly
// this fix; it now calls this shared one instead.)
const DATE_PART_ORDER = new Intl.DateTimeFormat().formatToParts(new Date(2001,10,22))
    .filter(p => p.type==="day"||p.type==="month"||p.type==="year")
    .map(p => p.type);
function parseLocaleDate(str){
    const nums = String(str).split(/\D+/).filter(n=>n).map(Number);
    const parts = Object.fromEntries(DATE_PART_ORDER.map((type,i) => [type, nums[i]]));
    return new Date(parts.year, parts.month-1, parts.day);
}

// Same idea, but also carries the "H:MM:SS AM/PM" time portion that
// workoutStartTime/workoutEndTime store, for duration math.
function parseLocaleDateTime(dateStr, timeStr){
    const d = parseLocaleDate(dateStr);
    if (isNaN(d)) return d;
    const m = String(timeStr).match(/(\d+):(\d+)(?::(\d+))?\s*([AaPp][Mm])?/);
    if (!m) return d;
    let [, hh, mm, ss, ampm] = m;
    hh = Number(hh); mm = Number(mm); ss = Number(ss||0);
    if (ampm){
        ampm = ampm.toUpperCase();
        if (ampm === "PM" && hh !== 12) hh += 12;
        if (ampm === "AM" && hh === 12) hh = 0;
    }
    d.setHours(hh, mm, ss, 0);
    return d;
}

// A workout Map key is "<localeDate> <H:MM:SS AM/PM>" (see logworkout.js:
// `workoutDate + " " + workoutStartTime`) -- splits at the first space and
// parses both halves with the two helpers above.
function parseWorkoutKey(key){
    key = String(key);
    const spaceIdx = key.indexOf(" ");
    if (spaceIdx === -1) return parseLocaleDate(key);
    return parseLocaleDateTime(key.slice(0, spaceIdx), key.slice(spaceIdx+1));
}

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
    const [key, entry] = log.slice().sort((a,b) => parseWorkoutKey(a[0]) - parseWorkoutKey(b[0])).at(-1);
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

// Bodyweight, barbell weight, and dumbbell weight are central to every
// weight calculation (the BW toggle below, getStats's equipment-weight
// lookup, ...) but a user can reach exercises.html without ever having
// set them. NOT settings.html's "Bodyweight factor" (bodywt) -- that's an
// unrelated, pre-existing feature (a 0.1-1 multiplier paired with its own
// live-computed display value). The real raw bodyweight this reads is
// savedSettings.weight, personal info, same "<num> <unit>" format as
// bweight/dweight.
function getMissingWeightFields(){
    const s = JSON.parse(localStorage.savedSettings || "{}");
    const missing = [];
    if (!parseFloat(s.weight?.split(" ")[0])) missing.push("weight");
    if (!parseFloat(s.bweight?.split(" ")[0])) missing.push("bweight");
    if (!parseFloat(s.dweight?.split(" ")[0])) missing.push("dweight");
    return missing;
}

// Same dynamically-created <dialog> pattern as showSystemicFatiguePrompt
// above. Resolves immediately (no dialog shown) if nothing's missing --
// callers can unconditionally `await ensureWeightSettings()` right before
// anything that needs these values. Merges into whatever partial
// savedSettings already exists (spreads it first) rather than clobbering
// name/email/height/etc -- this only ever asks about the three weight
// fields, never the rest of settings.html's own form.
function ensureWeightSettings(){
    const missing = getMissingWeightFields();
    if (!missing.length) return Promise.resolve();
    return new Promise((resolve) => {
        if (document.getElementById("weightsettingsprompt")) { resolve(); return; }
        const existing = JSON.parse(localStorage.savedSettings || "{}");
        const unit = existing.unit === "imperial" ? "imperial" : "metric";
        const unitLabel = unit === "imperial" ? "lbs" : "kgs";
        const dialog = document.createElement("dialog");
        dialog.id = "weightsettingsprompt";
        const label = document.createElement("p");
        label.textContent = "Complete your weight settings to continue";
        dialog.append(label);
        const fields = { weight: "Bodyweight", bweight: "Barbell weight", dweight: "Dumbbell weight" };
        const inputs = {};
        Object.entries(fields).forEach(([key, text]) => {
            if (!missing.includes(key)) return;
            const row = document.createElement("label");
            row.textContent = `${text} (${unitLabel})`;
            const input = document.createElement("input");
            input.type = "number"; input.step = "0.1"; input.min = "0";
            inputs[key] = input;
            row.append(input);
            dialog.append(row);
        });
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.addEventListener("click", () => {
            const merged = { ...existing, unit: existing.unit || "metric" };
            let allFilled = true;
            Object.entries(inputs).forEach(([key, input]) => {
                if (input.value) merged[key] = `${input.value} ${unitLabel}`;
                else allFilled = false;
            });
            if (!allFilled) return; // stay open until every missing field has a value
            localStorage.savedSettings = JSON.stringify(merged);
            dialog.close();
            dialog.remove();
            resolve();
        });
        dialog.append(saveBtn);
        document.body.append(dialog);
        dialog.showModal();
    });
}

// --- AI-generated exercises ----------------------------------------------
// Provider APIs reject browser-JS requests directly (no CORS for arbitrary
// origins) -- this relay (ai-relay/api/relay.js, deployed to Vercel) does
// the fetch server-side instead. Fixed URL, not a config field -- update
// this if the relay is ever redeployed elsewhere.
const AI_RELAY_URL = "https://logger-one-nu.vercel.app/api/relay";

function getMissingAIConfigFields(){
    const c = JSON.parse(localStorage.aiConfig || "{}");
    const missing = [];
    if (!c.label) missing.push("label");
    if (!c.endpoint) missing.push("endpoint");
    if (!c.model) missing.push("model");
    if (!c.apiKey) missing.push("apiKey");
    return missing;
}

function ensureAIConfig(){
    const missing = getMissingAIConfigFields();
    if (!missing.length) return Promise.resolve();
    return new Promise((resolve) => {
        if (document.getElementById("aiconfigprompt")) { resolve(); return; }
        const existing = JSON.parse(localStorage.aiConfig || "{}");
        const dialog = document.createElement("dialog");
        dialog.id = "aiconfigprompt";
        const label = document.createElement("p");
        label.textContent = "Set up an AI to generate new exercises";
        dialog.append(label);
        const fields = {
            label: "AI Name (just a label, e.g. \"Claude\")",
            endpoint: "API Endpoint",
            model: "Model",
            apiKey: "API Key",
        };
        const inputs = {};
        Object.entries(fields).forEach(([key, text]) => {
            const row = document.createElement("label");
            row.textContent = text;
            const input = document.createElement("input");
            input.type = key === "apiKey" ? "password" : "text";
            input.value = existing[key] || "";
            inputs[key] = input;
            row.append(input);
            dialog.append(row);
        });
        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.textContent = "Save";
        saveBtn.addEventListener("click", () => {
            const merged = { ...existing };
            let allFilled = true;
            Object.entries(inputs).forEach(([key, input]) => {
                if (input.value.trim()) merged[key] = input.value.trim();
                else allFilled = false;
            });
            if (!allFilled) return;
            localStorage.aiConfig = JSON.stringify(merged);
            dialog.close();
            dialog.remove();
            resolve();
        });
        dialog.append(saveBtn);
        document.body.append(dialog);
        dialog.showModal();
        // pinToVisualViewport(dialog, 0.04);
    });
}

// bodypart/categories/movers constrained to values already in exerciseDB()
// -- movers has a hard technical reason (muscle-map SVG matches mover
// names literally against `svg [data-name='<name>']`), bodypart/categories
// follow the same rule by choice, not requirement.
function getExistingDBVocab(){
    const db = exerciseDB();
    const bodyparts = new Set(), categories = new Set(), movers = new Set();
    Object.values(db).forEach(e => {
        if (e.bodypart) bodyparts.add(e.bodypart);
        (e.categories||[]).forEach(c => categories.add(c));
        (e.movers||[]).forEach(m => movers.add(m));
    });
    return {
        bodyparts: [...bodyparts].sort(),
        categories: [...categories].sort(),
        movers: [...movers].sort(),
    };
}

function buildExercisePrompt(exerciseNames, hint){
    const { bodyparts, categories, movers } = getExistingDBVocab();
    const n = exerciseNames.length;
    return `You are generating ${n} new strength-training exercise ${n===1?"entry":"entries"} for a fitness-tracking app's exercise database, one for each name listed at the bottom, in the same order.

Return ONLY a single valid JSON array of ${n} object${n===1?"":"s"} -- no markdown code fences, no commentary before or after. Each object needs exactly these fields:
{
  "name": string, Title Case display name,
  "bodypart": string, lowercase -- reuse the closest match from this exact existing list, do not invent a new value unless truly none of these fit: ${JSON.stringify(bodyparts)},
  "categories": array of lowercase strings -- reuse values from this exact existing list, do not invent new ones unless truly none fit: ${JSON.stringify(categories)},
  "movers": array of 1-5 strings ORDERED from primary to least-involved muscle, using ONLY these exact values, nothing else (this drives which muscles actually get colored on the app's muscle-map SVG -- an unrecognized name would silently never show up there): ${JSON.stringify(movers)},
  "equipment": array of lowercase strings, e.g. "barbell", "dumbbells", "bodyweight", "cable machine",
  "description": one or two plain instructional sentences describing the movement, e.g. "Lie flat on a bench while gripping the barbell with hands shoulder-width apart. Lower the barbell under control to the mid-chest, then press it back up until arms are fully extended.",
  "type": one of "bilateral" | "unilateral" | "isometric" -- classify using ONLY the primary and secondary movers (the first two entries in your own "movers" array): if the movement carries them through BOTH a concentric and an eccentric phase each rep (a real up/down or push/pull cycle), it's "bilateral" (both limbs/sides work together) or "unilateral" (one side at a time). If instead it holds those same primary/secondary movers fixed in ONE phase -- usually contracted -- for the whole set, with no phase cycling, it's "isometric", regardless of whether some other part of the body is moving (e.g. walking while holding a static grip/brace is still isometric for the graded muscles),
  "effectiveness": integer 1-10,
  "technicality": integer 1-10,
  "fatigue": integer 1-10,
  "media": {"imagelinks": "", "videolinks": ""}
}

Exercises to generate, in order: ${JSON.stringify(exerciseNames)}
${hint ? `Additional context that applies to all of them: ${hint}` : ""}

Return ONLY the JSON array, nothing else.`;
}

function stripCodeFences(text){
    return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
}

// Branches request/response shape on provider (Anthropic Messages API vs
// the OpenAI-compatible chat-completions shape most others use) -- separate
// concern from the CORS problem the relay above solves.
function buildProviderRequest(config, prompt){
    const isAnthropic = new URL(config.endpoint).hostname === "api.anthropic.com";
    if (isAnthropic){
        return {
            headers: {
                "x-api-key": config.apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: {
                model: config.model,
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }],
            },
        };
    }
    return {
        headers: { "Authorization": `Bearer ${config.apiKey}` },
        body: {
            model: config.model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        },
    };
}

function extractGeneratedText(config, responseData){
    const isAnthropic = new URL(config.endpoint).hostname === "api.anthropic.com";
    if (isAnthropic) return responseData?.content?.[0]?.text;
    return responseData?.choices?.[0]?.message?.content;
}

// Calls the configured AI (through the relay) once for every name in
// exerciseNames, validates each result against the DB's own live
// vocabulary, and returns {key, exercise} pairs -- never writes anything
// itself. A bad/invalid response is rejected as a whole, not partially saved.
async function generateExercisesWithAI(exerciseNames, hint){
    const config = JSON.parse(localStorage.aiConfig || "{}");
    if (getMissingAIConfigFields().length) throw new Error("AI isn't configured yet.");

    const prompt = buildExercisePrompt(exerciseNames, hint);
    const { headers, body } = buildProviderRequest(config, prompt);

    let relayResponse;
    try {
        relayResponse = await fetch(AI_RELAY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: config.endpoint, headers, body }),
        });
    } catch (e) {
        throw new Error(`Couldn't reach the relay at ${AI_RELAY_URL} -- check that it's still deployed.`);
    }

    const responseData = await relayResponse.json().catch(() => null);
    if (!relayResponse.ok){
        const detail = responseData?.error || responseData?.detail || relayResponse.statusText;
        throw new Error(`${config.label} request failed: ${detail}`);
    }

    const text = extractGeneratedText(config, responseData);
    if (!text) throw new Error(`${config.label} returned no usable response.`);

    let exercises;
    try { exercises = JSON.parse(stripCodeFences(text)); }
    catch (e) { throw new Error(`${config.label}'s response wasn't valid JSON: ${text.slice(0, 200)}`); }

    if (!Array.isArray(exercises)) throw new Error(`${config.label} didn't return a JSON array: ${text.slice(0, 200)}`);
    if (exercises.length !== exerciseNames.length){
        throw new Error(`Asked for ${exerciseNames.length} exercises, got ${exercises.length} back.`);
    }

    const { bodyparts: validBodyparts, categories: validCategories, movers: validMovers } = getExistingDBVocab();
    const requiredKeys = ["name","bodypart","categories","movers","equipment","description","type","effectiveness","technicality","fatigue"];

    return exercises.map((exercise, i) => {
        const label = exerciseNames[i] || `#${i+1}`;
        const missingKeys = requiredKeys.filter(k => exercise[k] === undefined);
        if (missingKeys.length) throw new Error(`"${label}" is missing: ${missingKeys.join(", ")}`);
        if (!validBodyparts.includes(exercise.bodypart)){
            throw new Error(`"${label}" has a "bodypart" not already in the DB: ${exercise.bodypart}`);
        }
        if (!Array.isArray(exercise.categories) || !exercise.categories.length || exercise.categories.some(c => !validCategories.includes(c))){
            throw new Error(`"${label}" has a "categories" value not already in the DB: ${JSON.stringify(exercise.categories)}`);
        }
        if (!Array.isArray(exercise.movers) || !exercise.movers.length || exercise.movers.some(m => !validMovers.includes(m))){
            throw new Error(`"${label}" has an invalid "movers" list: ${JSON.stringify(exercise.movers)}`);
        }
        if (!["bilateral","unilateral","isometric"].includes(exercise.type)){
            throw new Error(`"${label}" has an invalid "type": ${exercise.type}`);
        }
        if (!exercise.media) exercise.media = { imagelinks: "", videolinks: "" };
        return { key: nameToId(exercise.name), exercise };
    });
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
        window.muscleSorenessData = await migrateMuscleSorenessTimestamps(dbInstance, await loadMuscleSoreness(dbInstance));
        window.customExercisesData = await loadCustomExercises(dbInstance);
    } catch(e){
        // IndexedDB unavailable this session (private browsing, storage
        // disabled, etc.) -- fall back to reading localStorage directly so
        // the app still works, just without the larger storage ceiling.
        console.warn("IndexedDB unavailable, using localStorage for this session", e);
        dbAvailable = false;
        window.workoutLogData = localStorage?.workoutLogObject ? JSON.parse(localStorage.workoutLogObject) : [];
        window.templatesData = localStorage?.templates ? JSON.parse(localStorage.templates) : {};
        // This path bypasses loadMuscleSoreness/migrateMuscleSorenessTimestamps
        // entirely (no DB to read from), so old-shape records need the same
        // normalization applied here directly instead.
        const rawSoreness = localStorage?.muscleSoreness ? JSON.parse(localStorage.muscleSoreness) : {};
        window.muscleSorenessData = Object.fromEntries(Object.entries(rawSoreness).map(([muscle, rec]) => [muscle, normalizeMuscleSorenessRecord(rec)]));
        window.customExercisesData = localStorage?.customExercises ? JSON.parse(localStorage.customExercises) : {};
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
