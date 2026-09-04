const container = document.getElementById("container")
const redirectHome = document.querySelector("#header > h1");
const svgloader = document.getElementById("svgcodeJS")
const frontHeadInput = document.getElementById("fronthead");
const backHeadInput = document.getElementById("backhead");
const HEAD_UPLOAD_INPUTS = { front: frontHeadInput, back: backHeadInput };
const SVG_NS = "http://www.w3.org/2000/svg";

// The body art (media/muscularman/front|backsvg.js) has no head at all --
// it stops at the neck. Its own default viewBox only leaves 78 (front) /
// 43.5 (back) units of empty space above the neck, which is nowhere near
// a real head-to-body ratio (roughly 1/7.5 of total height -- this body
// is ~1005 units tall per the viewBox-centering comment in svgcode.js, so
// an anatomically proportional head is ~134 units, not 78 or 43.5).
// HEAD_VIEWBOXES below enlarges each view's viewBox (profile.js's own
// copy, set after muscularManSvg() returns -- NOT touching svgcode.js's
// shared default, which index.js and pastworkout.js also render from and
// have no custom head to make room for) enough to fit a properly-sized
// head without clipping. The extra 45 units of min-y (pushed from -5/-19
// to -50/-64) adds headroom above the head for the +/-/x controls and the
// big upload button to sit without feeling cramped against the top edge
// -- height grows by the same 45 so the bottom edge (feet) doesn't shift.
// Both views get the SAME final height (1301, the larger of the two
// requirements) so toggling between them doesn't jump in apparent zoom --
// muscularManSvg's own comment already established that both views share
// one size for exactly this reason.
const HEAD_VIEWBOXES = {
    front: "339 -100 640 1301",
    back:  "305 -80 640 1301",
};
// Both regions are the same size (134x134, a square -- matches the
// circular crop so it renders as a true circle, not a stretched oval) and
// positioned with their bottom edge at the neck, centered on the body's
// own horizontal center in each view.
const HEAD_REGIONS = {
    front: {x: 569, y: 35, w: 134, h: 134},
    back:  {x: 558, y: -13.5, w: 134, h: 134},
};

// HEAD_REGIONS above is only ever the STARTING placement -- the computed
// coordinates are an approximation against hand-drawn body art that was
// never built with a head in mind, so they don't land exactly on the
// neck or at the right size for every photo. Once the user drags/resizes
// a head image to actually line up, that exact {x,y,w,h} is remembered
// here (keyed the same way as the image itself) instead of being
// recomputed/guessed again on every render.
const HEAD_PLACEMENT_KEYS = { front: "customHeadFrontPos", back: "customHeadBackPos" };
function getHeadPlacement(key, region){
    try{
        const stored = localStorage[HEAD_PLACEMENT_KEYS[key]];
        if (stored){
            const parsed = JSON.parse(stored);
            // A placement saved before resize existed only ever had {x,y}
            // -- reading straight through set width/height to undefined,
            // which makes an SVG <image> not render at all. Falling back
            // to the region default per-field (not just whole-object)
            // keeps an old, partial placement usable instead of invisible.
            return {
                x: parsed.x ?? region.x,
                y: parsed.y ?? region.y,
                w: parsed.w ?? region.w,
                h: parsed.h ?? region.h,
            };
        }
    } catch(e){}
    return { x: region.x, y: region.y, w: region.w, h: region.h };
}
function saveHeadPlacement(key, img){
    localStorage[HEAD_PLACEMENT_KEYS[key]] = JSON.stringify({
        x: parseFloat(img.getAttribute("x")),
        y: parseFloat(img.getAttribute("y")),
        w: parseFloat(img.getAttribute("width")),
        h: parseFloat(img.getAttribute("height")),
    });
}

// Dragging the placed head image nudges its x/y so it can be lined up
// with the neck by eye. Mouse/touch, not Pointer Events -- same reasoning
// as the crop dialog's drag above. Screen-pixel movement is converted
// into the SVG's own user-space units via the ratio between its viewBox
// and its actual rendered size, since dragging 10 screen pixels means a
// different number of SVG units depending on how zoomed in the figure
// currently is.
function makeHeadDraggable(view, img, key, onChange, onTap){
    let dragState = null;
    function toUserDelta(clientDX, clientDY){
        const vb = view.viewBox.baseVal;
        const rect = view.getBoundingClientRect();
        return { dx: clientDX * (vb.width / rect.width), dy: clientDY * (vb.height / rect.height) };
    }
    function start(clientX, clientY){
        dragState = { startX: clientX, startY: clientY, startImgX: parseFloat(img.getAttribute("x")), startImgY: parseFloat(img.getAttribute("y")), moved: false };
    }
    function move(clientX, clientY){
        if (!dragState) return;
        if (Math.abs(clientX - dragState.startX) > 4 || Math.abs(clientY - dragState.startY) > 4) dragState.moved = true;
        const { dx, dy } = toUserDelta(clientX - dragState.startX, clientY - dragState.startY);
        img.setAttribute("x", dragState.startImgX + dx);
        img.setAttribute("y", dragState.startImgY + dy);
        onChange();
    }
    // A gesture that never moved beyond the threshold is a tap/click, not a
    // drag -- fires onTap (toggling the resize controls) instead of saving
    // a placement, so a plain tap on the image doesn't nudge it by 0px and
    // still opens/closes the +/- buttons.
    function end(){
        if (!dragState) return;
        const { moved } = dragState;
        dragState = null;
        if (moved) saveHeadPlacement(key, img);
        else onTap?.();
    }
    img.addEventListener("mousedown", (e) => { e.preventDefault(); start(e.clientX, e.clientY); });
    document.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
    document.addEventListener("mouseup", end);
    // preventDefault() here is required, not optional -- without it the
    // browser follows this touch sequence with synthetic compatibility
    // mouse events (mousedown/mouseup/click) a moment later, which fires
    // start()/end() a SECOND time for the same tap and double-toggles the
    // resize controls right back to whatever they started as.
    img.addEventListener("touchstart", (e) => { const t = e.touches[0]; if (t) { e.preventDefault(); start(t.clientX, t.clientY); } }, {passive: false});
    document.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, {passive: true});
    document.addEventListener("touchend", end);
    document.addEventListener("touchcancel", end);
}

// +/- buttons that toggle open/closed on tap/click of the head image itself
// (hover doesn't exist on mobile, so this is a click toggle rather than a
// hover reveal on every device). Resizing grows/shrinks the image from its
// BOTTOM-CENTER (where it meets the neck) so the head doesn't drift away
// from the neck as it's resized, only its horizontal center and top edge
// move. Built as SVG elements in the same coordinate space as the image
// (not an HTML overlay) so they track its position/size directly without
// separately converting between screen and SVG coordinates on every move.
// Shared by the head resize/remove buttons below and the per-muscle
// soreness stepper further down -- both are plain circle+symbol SVG
// buttons, just with a different CSS class for their own color/size.
function makeSvgCircleButton(symbol, className){
    const g = document.createElementNS(SVG_NS, "g");
    g.classList.add(className);
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("r", "14");
    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.textContent = symbol;
    g.append(circle, text);
    return g;
}

const HEAD_RESIZE_STEP = 12;
const HEAD_MIN_SIZE = 40;
function addHeadResizeControls(view, img, key, onChange, onRemove){
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("head-resize-controls");
    group.style.display = "none";

    const plusBtn = makeSvgCircleButton("+", "head-resize-btn");
    const minusBtn = makeSvgCircleButton("−", "head-resize-btn");
    const removeBtn = makeSvgCircleButton("×", "head-resize-btn");
    removeBtn.classList.add("head-remove-btn");
    group.append(minusBtn, removeBtn, plusBtn);
    view.append(group);

    function reposition(){
        const x = parseFloat(img.getAttribute("x"));
        const y = parseFloat(img.getAttribute("y"));
        const w = parseFloat(img.getAttribute("width"));
        // All three sit in a row just above the image: minus, remove, plus.
        minusBtn.setAttribute("transform", `translate(${x + w*0.2}, ${y - 18})`);
        removeBtn.setAttribute("transform", `translate(${x + w*0.5}, ${y - 18})`);
        plusBtn.setAttribute("transform", `translate(${x + w*0.8}, ${y - 18})`);
    }
    function resizeBy(delta){
        const x = parseFloat(img.getAttribute("x"));
        const y = parseFloat(img.getAttribute("y"));
        const w = parseFloat(img.getAttribute("width"));
        const h = parseFloat(img.getAttribute("height"));
        const newW = Math.max(HEAD_MIN_SIZE, w + delta);
        const newH = newW; // stays square, matching the circular crop
        const centerX = x + w / 2;
        const bottom = y + h;
        img.setAttribute("width", newW);
        img.setAttribute("height", newH);
        img.setAttribute("x", centerX - newW / 2);
        img.setAttribute("y", bottom - newH);
        reposition();
        onChange();
        saveHeadPlacement(key, img);
    }
    plusBtn.addEventListener("click", (e) => { e.stopPropagation(); resizeBy(HEAD_RESIZE_STEP); });
    minusBtn.addEventListener("click", (e) => { e.stopPropagation(); resizeBy(-HEAD_RESIZE_STEP); });
    removeBtn.addEventListener("click", (e) => { e.stopPropagation(); onRemove(); });

    let visible = false;
    function show(){ reposition(); group.style.display = ""; visible = true; }
    function hide(){ group.style.display = "none"; visible = false; }
    function toggle(){ visible ? hide() : show(); }
    // Tapping/clicking anywhere else on the page hides the controls too,
    // so they don't stay stuck open while the user goes on to do something
    // else on the figure.
    document.addEventListener("click", (e) => {
        if (visible && e.target !== img && !group.contains(e.target)) hide();
    });

    return { reposition, toggle };
}

// Big + shown centered on the head region in place of the image, before
// one's been uploaded -- tapping it opens the same file input the old
// external "Upload Front/Back Head" button used to trigger.
function addHeadUploadButton(view, region, key){
    const g = document.createElementNS(SVG_NS, "g");
    g.classList.add("head-upload-btn");
    const cx = region.x + region.w / 2;
    const cy = region.y + region.h / 2;
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", region.w * 0.4);
    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", cx);
    text.setAttribute("y", cy);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.textContent = "+";
    g.append(circle, text);
    g.addEventListener("click", () => HEAD_UPLOAD_INPUTS[key].click());
    view.append(g);
}

// Clears a saved head image/placement and re-renders -- called from the
// x button in addHeadResizeControls, brings back addHeadUploadButton's
// big + in its place.
function removeHeadImage(key){
    delete localStorage[key === "front" ? "customHeadFront" : "customHeadBack"];
    delete localStorage[HEAD_PLACEMENT_KEYS[key]];
    renderPhysique();
}

// Adds/updates/removes the <image> standing in for the head on one view.
// preserveAspectRatio="xMidYMax meet" scales it down to fit its box
// without stretching, rather than distorting a photo to fill it. Starting
// placement is the saved drag/resize if there is one, else the
// HEAD_REGIONS default.
function setHeadImage(view, dataUri, region, key){
    let img = view.querySelector(".custom-head");
    if (!dataUri){
        img?.remove();
        view.querySelector(".head-resize-controls")?.remove();
        addHeadUploadButton(view, region, key);
        return;
    }
    const isNew = !img;
    if (isNew){
        img = document.createElementNS(SVG_NS, "image");
        img.classList.add("custom-head");
        img.setAttribute("preserveAspectRatio", "xMidYMax meet");
        view.append(img);
    }
    const placement = getHeadPlacement(key, region);
    img.setAttribute("x", placement.x);
    img.setAttribute("y", placement.y);
    img.setAttribute("width", placement.w);
    img.setAttribute("height", placement.h);
    img.setAttribute("href", dataUri);
    if (isNew){
        const controls = addHeadResizeControls(view, img, key, () => {}, () => removeHeadImage(key));
        makeHeadDraggable(view, img, key, controls.reposition, controls.toggle);
    }
}

// ---- Per-muscle soreness (+/- stepper on tap) ----
//
// Every muscle is always adjustable (no eligibility gating -- this page is
// a manual, on-demand place to record soreness, not tied to training
// data). Tier 0-5 on the same TIER_COLORS ramp (functions.js) index.js
// uses for its volume-driven coloring, clamped at both ends. Stored
// separately from workout objects entirely (window.muscleSorenessData /
// LoggerDB.saveMuscleSoreness), keyed by the SVG's own data-name values,
// so nothing that reads a workout entry is affected by any of this.
let activeMuscleControls = null; // {group, muscle}

function getMuscleElements(name){
    return [...container.querySelectorAll(`[data-name="${CSS.escape(name)}"]`)];
}

function currentMuscleTier(name){
    return (window.muscleSorenessData || {})[name] || 0;
}

// Colors every element sharing this data-name, in BOTH views -- some
// muscles (e.g. "neck", "oblique") are drawn on both the front and back
// artwork under the same name, and should read as one muscle either way.
function paintMuscle(name){
    const tier = currentMuscleTier(name);
    getMuscleElements(name).forEach(el => applyTierColor(el, tier));
}

function paintAllMuscles(){
    const seen = new Set();
    container.querySelectorAll("[data-name]").forEach(el => {
        if (seen.has(el.dataset.name)) return;
        seen.add(el.dataset.name);
        paintMuscle(el.dataset.name);
    });
}

async function adjustMuscleTier(name, delta){
    const data = window.muscleSorenessData || (window.muscleSorenessData = {});
    const next = Math.max(0, Math.min(TIER_COLORS.length - 1, (data[name]||0) + delta));
    if (next === 0) delete data[name]; else data[name] = next;
    paintMuscle(name);
    await window.LoggerDB.saveMuscleSoreness(data);
}

function closeMuscleControls(){
    activeMuscleControls?.group.remove();
    activeMuscleControls = null;
}

// Tapping the same muscle again closes its own controls (toggle); tapping
// a different muscle switches straight to it. Positioned at the union
// bounding box of every path sharing this data-name within the CURRENTLY
// VISIBLE view only (the hidden front/back view's elements report an
// empty getBBox while display:none).
function openMuscleControls(view, name){
    if (activeMuscleControls?.muscle === name){ closeMuscleControls(); return; }
    closeMuscleControls();
    const elems = getMuscleElements(name).filter(el => view.contains(el));
    if (!elems.length) return;
    const boxes = elems.map(el => el.getBBox());
    const minX = Math.min(...boxes.map(b => b.x));
    const minY = Math.min(...boxes.map(b => b.y));
    const maxX = Math.max(...boxes.map(b => b.x + b.width));
    const maxY = Math.max(...boxes.map(b => b.y + b.height));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;

    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("muscle-soreness-controls");
    const minusBtn = makeSvgCircleButton("−", "muscle-soreness-btn");
    const plusBtn = makeSvgCircleButton("+", "muscle-soreness-btn");
    const label = document.createElementNS(SVG_NS, "text");
    label.classList.add("muscle-soreness-label");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "central");

    function reposition(){
        minusBtn.setAttribute("transform", `translate(${cx - 26}, ${cy})`);
        label.setAttribute("transform", `translate(${cx}, ${cy})`);
        label.textContent = currentMuscleTier(name);
        plusBtn.setAttribute("transform", `translate(${cx + 26}, ${cy})`);
    }
    reposition();
    minusBtn.addEventListener("click", async (e) => { e.stopPropagation(); await adjustMuscleTier(name, -1); reposition(); });
    plusBtn.addEventListener("click", async (e) => { e.stopPropagation(); await adjustMuscleTier(name, 1); reposition(); });

    group.append(minusBtn, label, plusBtn);
    view.append(group);
    activeMuscleControls = {group, muscle: name};
}

// Delegated on #container (rather than per-muscle-element) so it survives
// renderPhysique() rebuilding the SVG from scratch on every call.
container.addEventListener("click", (e) => {
    const name = e.target.dataset?.name;
    if (!name) return;
    const view = e.target.closest("#frontHumanSVG, #backHumanSVG");
    if (view) openMuscleControls(view, name);
});
// Closes the open stepper on any click outside it (or outside the muscle
// that opened it) -- same "click outside closes" pattern already used for
// the head resize controls above.
document.addEventListener("click", (e) => {
    if (!activeMuscleControls) return;
    if (activeMuscleControls.group.contains(e.target)) return;
    if (e.target.dataset?.name === activeMuscleControls.muscle) return;
    closeMuscleControls();
});

// muscularManSvg no longer scales by measurements (PHYSIQUE_PRESETS was
// part of the old scaling system and svgcode.js doesn't define it) --
// there's nothing here left for a preset picker to switch between, so it
// was removed rather than left as a dropdown with no effect. This just
// renders the one figure on load, then re-applies whatever custom head
// images and muscle soreness tiers are already saved (muscularManSvg
// always builds a fresh, untinted figure with no head, so both have to
// run every render, not just once).
const renderPhysique = async () => {
    container.innerHTML = "";
    activeMuscleControls = null; // its <g> just got wiped out by innerHTML="" above
    const {frontView, backView} = await muscularManSvg(container,[-30,-10]);
    // Enlarges just THIS page's copies of the viewBox -- see HEAD_VIEWBOXES
    // above for why this isn't done in svgcode.js itself.
    frontView.setAttribute("viewBox", HEAD_VIEWBOXES.front);
    backView.setAttribute("viewBox", HEAD_VIEWBOXES.back);
    setHeadImage(frontView, localStorage.customHeadFront || "", HEAD_REGIONS.front, "front");
    setHeadImage(backView, localStorage.customHeadBack || "", HEAD_REGIONS.back, "back");
    paintAllMuscles();
}

// A chosen file doesn't get stored directly -- it opens the crop dialog
// below first (drag to reposition, zoom slider to resize, drag the
// frame's corner handles to crop freely at any aspect ratio) so the user
// controls exactly what part of their photo becomes the head, rather than
// this code guessing head-region coordinates against hand-drawn body art
// that was never built with a head in mind.
function handleHeadUpload(input, storageKey){
    const file = input.files[0];
    input.value = ""; // allow re-selecting the same file later
    if (!file) return;
    openCropper(file, storageKey);
}

frontHeadInput.addEventListener("change", () => handleHeadUpload(frontHeadInput, "customHeadFront"));
backHeadInput.addEventListener("change", () => handleHeadUpload(backHeadInput, "customHeadBack"));

// -------- Crop dialog --------
// Pan/zoom/crop math all happens in the viewport's own on-screen CSS-px
// coordinate space (read live via getBoundingClientRect(), since #cropviewport
// is responsive -- 70vw capped at 280px -- not a fixed size), then gets
// mapped back into the source image's native pixel space only once, at
// Confirm, to read the final crop out of it. Nothing here talks to
// HEAD_REGIONS/setHeadImage at all -- the output of a confirmed crop is
// just a normal stored image, same as any other upload.
const cropperDialog = document.getElementById("cropperdialog");
const closeCropperBtn = document.getElementById("closecropper");
const cropViewport = document.getElementById("cropviewport");
const cropImage = document.getElementById("cropimage");
const cropFrame = document.getElementById("cropframe");
const cropZoom = document.getElementById("cropzoom");
const cropSize = document.getElementById("cropsize");
const cropConfirmBtn = document.getElementById("cropconfirm");

let cropTargetKey = null;
let cropObjectUrl = null;
let cropScale = 1;
let cropPanX = 0;
let cropPanY = 0;
// Bounds the image can pan within at the current zoom, so it never
// leaves a gap at the viewport's edge. Recomputed whenever zoom changes.
let cropPanMinX = 0;
let cropPanMinY = 0;

function applyImageTransform(){
    cropImage.style.transform = `translate(${cropPanX}px, ${cropPanY}px) scale(${cropScale})`;
}

function updatePanRange(){
    const vp = cropViewport.getBoundingClientRect();
    cropPanMinX = Math.min(0, vp.width - cropImage.naturalWidth * cropScale);
    cropPanMinY = Math.min(0, vp.height - cropImage.naturalHeight * cropScale);
    setPan(cropPanX, cropPanY);
}

function setPan(x, y){
    cropPanX = Math.max(cropPanMinX, Math.min(0, x));
    cropPanY = Math.max(cropPanMinY, Math.min(0, y));
    applyImageTransform();
}

// The circle is always centered in the viewport -- only its diameter
// changes, via the #cropsize slider (a percentage of the viewport's own
// smaller dimension). The user repositions CONTENT by dragging the
// viewport instead of moving the circle itself.
function applyFrameSize(){
    const vp = cropViewport.getBoundingClientRect();
    const d = Math.min(vp.width, vp.height) * (parseFloat(cropSize.value) / 100);
    cropFrame.style.width = `${d}px`;
    cropFrame.style.height = `${d}px`;
    cropFrame.style.left = `${(vp.width - d) / 2}px`;
    cropFrame.style.top = `${(vp.height - d) / 2}px`;
}

function openCropper(file, storageKey){
    cropTargetKey = storageKey;
    if (cropObjectUrl) URL.revokeObjectURL(cropObjectUrl);
    cropObjectUrl = URL.createObjectURL(file);
    cropImage.onload = () => {
        // Starts zoomed to "cover" the viewport (no empty gaps at the
        // edges) and centered.
        const vp = cropViewport.getBoundingClientRect();
        const coverScale = Math.max(vp.width / cropImage.naturalWidth, vp.height / cropImage.naturalHeight);
        cropScale = coverScale;
        cropZoom.min = coverScale * 0.4;
        cropZoom.max = coverScale * 5;
        cropZoom.value = coverScale;
        cropPanX = (vp.width - cropImage.naturalWidth * cropScale) / 2;
        cropPanY = (vp.height - cropImage.naturalHeight * cropScale) / 2;
        updatePanRange();
        applyImageTransform();
        cropSize.value = 60;
        applyFrameSize();
    };
    cropImage.src = cropObjectUrl;
    cropperDialog.showModal();
}

function closeCropper(){
    cropperDialog.close();
    if (cropObjectUrl){ URL.revokeObjectURL(cropObjectUrl); cropObjectUrl = null; }
    cropTargetKey = null;
}
closeCropperBtn.addEventListener("click", closeCropper);

// Dragging the image repositions it. Built on the plain, separate
// mouse/touch event APIs rather than the unified Pointer Events API --
// several Pointer-Events-based attempts (element-level, window-level,
// document-level, capture phase) all failed to actually register drag in
// the real browser this was tested against, despite passing in automated
// (synthetic) testing every time. Falling back to the older, narrower
// APIs directly removes that whole unified layer from the equation
// instead of continuing to patch it blind.
let dragState = null;
function startDrag(clientX, clientY){
    dragState = {startX: clientX, startY: clientY, startPanX: cropPanX, startPanY: cropPanY};
    cropImage.style.cursor = "grabbing";
}
function moveDrag(clientX, clientY){
    if (!dragState) return;
    setPan(dragState.startPanX + (clientX - dragState.startX), dragState.startPanY + (clientY - dragState.startY));
}
function endDrag(){
    if (!dragState){ return; }
    dragState = null;
    cropImage.style.cursor = "grab";
}
cropViewport.addEventListener("mousedown", (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
document.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
document.addEventListener("mouseup", endDrag);
cropViewport.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (t) startDrag(t.clientX, t.clientY);
}, {passive: true});
document.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) moveDrag(t.clientX, t.clientY);
}, {passive: true});
document.addEventListener("touchend", endDrag);
document.addEventListener("touchcancel", endDrag);

// Zooms around the viewport's own center (holding whatever image point is
// currently there fixed) rather than the image's corner, so the image
// doesn't appear to drift/jump as the slider moves. Also refreshes how
// far the image can be dragged, since that depends on the current zoom.
cropZoom.addEventListener("input", () => {
    const vp = cropViewport.getBoundingClientRect();
    const cx = vp.width / 2, cy = vp.height / 2;
    const imgX = (cx - cropPanX) / cropScale;
    const imgY = (cy - cropPanY) / cropScale;
    cropScale = parseFloat(cropZoom.value);
    cropPanX = cx - imgX * cropScale;
    cropPanY = cy - imgY * cropScale;
    updatePanRange();
    applyImageTransform();
});

cropSize.addEventListener("input", applyFrameSize);

cropConfirmBtn.addEventListener("click", () => {
    const frameX = parseFloat(cropFrame.style.left);
    const frameY = parseFloat(cropFrame.style.top);
    const frameD = parseFloat(cropFrame.style.width);
    // Undoes the current pan/zoom to map the on-screen circle back into
    // the SOURCE image's own pixel coordinates -- whatever part of the
    // original photo sits under it, at whatever zoom the user chose, is
    // what gets read out.
    const sx = (frameX - cropPanX) / cropScale;
    const sy = (frameY - cropPanY) / cropScale;
    const sd = frameD / cropScale;
    // Output at 2x the circle's on-screen size for a less blurry result
    // on high-density screens, capped so a large circle doesn't produce
    // an excessive data URI.
    const outD = Math.round(Math.min(frameD * 2, 800));
    const canvas = document.createElement("canvas");
    canvas.width = outD;
    canvas.height = outD;
    const ctx = canvas.getContext("2d");
    // Clips to the circle itself -- an actual round, transparent-outside
    // cutout, not just a square guided by a circular on-screen overlay.
    ctx.beginPath();
    ctx.arc(outD / 2, outD / 2, outD / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(cropImage, sx, sy, sd, sd, 0, 0, outD, outD);
    try{
        localStorage[cropTargetKey] = canvas.toDataURL("image/png");
    } catch(e){
        alert("Couldn't save that image -- it may be too large. Try a smaller photo or a smaller crop size.");
        return;
    }
    closeCropper();
    renderPhysique();
});
// Not waiting on svgloader's "load" event: svgcodeJS is a static tag in
// profile.html, executing in document order before functions.js's async
// initApp() finishes loading data and dynamically appends this script (see
// PAGE_SCRIPTS in functions.js) -- so svgcode.js has already loaded by the
// time this line runs, and a listener attached now would never see its
// "load" event fire.
renderPhysique()

//redirect to home page
redirectHome.addEventListener("click" , home);


function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}