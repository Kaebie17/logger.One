const frontImg = document.createElement("script");
const backImg = document.createElement("script");
backImg.src = "media/muscularman/backsvg.js";
document.body.append(backImg);
let frontViewPaths = "", backViewPaths = "";
backImg.onload = () => {
    backViewPaths = backpaths; 
}
frontImg.src = "media/muscularman/frontsvg.js";
document.body.append(frontImg);
frontImg.onload = () => {
    frontViewPaths = frontpaths
}