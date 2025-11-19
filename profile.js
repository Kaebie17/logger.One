const container = document.getElementById("container")
const redirectHome = document.querySelector("#header > h1");
const svgloader = document.getElementById("svgcodeJS")
svgloader.addEventListener( "load", muscularManSvg(container,[-30,-10]))

//redirect to home page
redirectHome.addEventListener("click" , home);


function home() {
  document.location = "./index.html";
  redirectHome.removeEventListener("click", home);
}