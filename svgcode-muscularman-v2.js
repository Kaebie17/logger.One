// The front/back body diagrams are loaded directly from
// media/muscularman/frontsvg.svg and backsvg.svg at runtime -- those two
// files are the actual source of the geometry and the data-name tagging.
// Nothing here duplicates or hardcodes their path data; editing the SVG
// files is all that's needed to change the artwork. This module only:
//  - fetches and parses them,
//  - applies the app's resting-state colors (the files' own fill/stroke
//    are just placeholder tracer-tool hues used while tagging regions),
//  - and wires up the front/back toggle control.
// There is currently no measurement-based scaling: each muscle region is
// rendered at the size it was traced at.
const muscularManSvg = (function(){

const SVG_NS = "http://www.w3.org/2000/svg";
const FRONT_SVG_PATH = "media/muscularman/frontsvg.svg";
const BACK_SVG_PATH = "media/muscularman/backsvg.svg";


// Synchronous by design: callers currently do
// `muscularManSvg(container, ...); document.getElementById("frontHumanSVG")`
// on the very next line with no await, so the DOM has to exist before this
// function returns. A same-origin static-file read is effectively instant,
// so the classic sync-XHR tradeoff (blocks the calling thread briefly) is
// negligible here. Cached after the first read per path.
const svgTextCache = {};
function readSvgTextSync(path){
  if (svgTextCache[path] !== undefined) return svgTextCache[path];
  const xhr = new XMLHttpRequest();
  xhr.open("GET", path, false);
  xhr.send(null);
  svgTextCache[path] = xhr.status === 0 || xhr.status === 200 ? xhr.responseText : "";
  return svgTextCache[path];
}

// Everything traced as background/silhouette rather than a specific
// muscle is named "shape N" (plus "hand"/"feet", which the source files
// also leave as plain silhouette) -- those get skin tone; every other
// data-name is a muscle and gets the resting muscle color.
function isSkinName(name){
  return /^shape/i.test(name) || name === "hand" || name === "feet";
}

function styleImportedPath(el){
  const name = el.dataset.name || "";
  if (isSkinName(name)) {
    el.setAttribute("fill", "#f2c9a0");
    el.setAttribute("stroke", "#f2c9a0");
  } else {
    el.setAttribute("fill", "#9aa0ab");
    el.setAttribute("stroke", "#9aa0ab");
  }
  el.setAttribute("stroke-width", "0.5");
  el.removeAttribute("fill-opacity");
}

function buildView(svgText, id){
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.id = id;
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  if (!svgText) return svg;
  const sourceDoc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const sourceSvg = sourceDoc.documentElement;
  svg.setAttribute("viewBox", sourceSvg.getAttribute("viewBox"));
  sourceSvg.querySelectorAll("path[data-name]").forEach((sourcePath) => {
    const el = document.importNode(sourcePath, true);
    styleImportedPath(el);
    svg.append(el);
  });
  return svg;
}

function paintControls(controlArea, frontView, backView){
  const svgarea = document.createElementNS(SVG_NS, "svg");
  svgarea.setAttribute("viewBox", "-45 0 100 10");
  const controls = svgarea.cloneNode(true);
  const circle = document.createElementNS(SVG_NS, "circle");
  circle.setAttribute("r", "1");
  circle.setAttribute("cy", "5");
  circle.setAttribute("stroke-width", "0.5");
  circle.setAttribute("fill", "white");
  const c1 = circle.cloneNode(true);
  c1.setAttribute("cx", "0");
  c1.setAttribute("fill", "black");
  const c2 = circle.cloneNode(true);
  c2.setAttribute("cx", "6");
  controlArea.append(controls);
  controls.append(c1, c2);
  c1.addEventListener("click", () => {
    frontView.classList.remove("hide");
    backView.classList.add("hide");
    c1.setAttribute("fill","black"); c2.setAttribute("fill","white");
  });
  c2.addEventListener("click", () => {
    backView.classList.remove("hide");
    frontView.classList.add("hide");
    c2.setAttribute("fill","black"); c1.setAttribute("fill","white");
  });
}

function muscularManSvg(container, viewbox, w, h, overrideMeasurements){
  const controlArea = document.createElement("div");

  const frontView = buildView(readSvgTextSync(FRONT_SVG_PATH), "frontHumanSVG");
  const backView = buildView(readSvgTextSync(BACK_SVG_PATH), "backHumanSVG");
  if (w) { frontView.setAttribute("width", `${w}%`); backView.setAttribute("width", `${w}%`); }
  if (h) { frontView.setAttribute("height", `${h}%`); backView.setAttribute("height", `${h}%`); }

  container.append(frontView);
  container.append(backView);
  backView.classList.add("hide");
  container.append(controlArea);

  paintControls(controlArea, frontView, backView);

  return {frontsvg: frontView, backsvg: backView};
}

muscularManSvg.PHYSIQUE_PRESETS = PHYSIQUE_PRESETS;
return muscularManSvg;
})();

const PHYSIQUE_PRESETS = muscularManSvg.PHYSIQUE_PRESETS;
