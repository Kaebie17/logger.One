const url = "http://www.w3.org/2000/svg"

const svgCreator = () => {
    let container = document.createElementNS(url,"svg");
    let width = w||"22.5vh";
    let height = h||"38vh";
    container.setAttribute("width", width);
    container.setAttribute("height", height);
    container.setAttribute ("viewBox", `0,0,225,350`);
    document.body.append(container)

}

// Human figure SVG
const humanFigure = (w,h) => {
    const frontsvg = document.createElementNS(url,"svg");
    let width = w||"22.5vh";
    let height = h||"38vh";
    frontsvg.setAttribute("width", width);
    frontsvg.setAttribute("height", height);
    frontsvg.setAttribute ("viewBox", `0,0,225,350`);

    const backsvg = document.createElementNS(url,"svg");
    backsvg.setAttribute("width", width);
    backsvg.setAttribute("height", height);
    backsvg.setAttribute ("viewBox", `0,0,225,350`);

    const head =  document.createElementNS(url,"path");

    let drawhead = 'M 90,20 L 92,60 q 18 10 40 0 L 134,20 q -20 -25 -44 0'

    head.setAttribute("d", drawhead);
    head.setAttribute("stroke", "black");
    head.setAttribute("fill","grey");
    frontsvg.append(head.cloneNode(true))
    backsvg.append(head.cloneNode(true))

    let leftear = document.createElementNS(url,"path");

    let drawleftear = 'M 90,30 Q 85 30 90 40'

    leftear.setAttribute("d", drawleftear);
    leftear.setAttribute("stroke", "black");
    leftear.setAttribute("fill","grey");
    frontsvg.append(leftear.cloneNode(true))
    backsvg.append(leftear.cloneNode(true))

    let rightear = document.createElementNS(url,"path");

    let drawrightear = 'M 134,30 Q 139 30 134 40'

    rightear.setAttribute("d", drawrightear);
    rightear.setAttribute("stroke", "black");
    rightear.setAttribute("fill","grey");
    frontsvg.append(rightear.cloneNode(true))
    backsvg.append(rightear.cloneNode(true))


    const neck =  document.createElementNS(url,"path");

    let drawneck = 'M 95,60 v 15 q 18 10 34 0 v -15 q -18 10 -34 0'
    neck.setAttribute("d", drawneck);
    neck.setAttribute("stroke", "black");
    neck.setAttribute("fill","grey");
    neck.id = "neck";
    neck.dataset.name = "neck";
    frontsvg.append(neck.cloneNode(true))
    backsvg.append(neck.cloneNode(true))

    const leftupperchest = document.createElementNS(url,"path");

    let drawleftupperchest = 'M 95,75 l -25 10 q 50 25 40 0 Z'
    leftupperchest.setAttribute("d", drawleftupperchest);
    leftupperchest.setAttribute("stroke", "black");
    leftupperchest.setAttribute("fill","grey");
    leftupperchest.id ="leftupperchest";
    leftupperchest.dataset.name ="upperchest";
    frontsvg.append(leftupperchest)

    const rightupperchest = document.createElementNS(url,"path");

    let drawrightupperchest = 'M 129,75 l 25 10 q -50 25 -40 0 Z'
    rightupperchest.setAttribute("d", drawrightupperchest);
    rightupperchest.setAttribute("stroke", "black");
    rightupperchest.setAttribute("fill","grey");
    rightupperchest.id = "rightupperchest";
    rightupperchest.dataset.name ="upperchest";
    frontsvg.append(rightupperchest)

    const leftshoulder = document.createElementNS(url,"path");

    let drawleftshoulder = 'M 72,85 q -40 -5 -20 40 q 10 -10 10 -20 T 72 85'
    leftshoulder.setAttribute("d", drawleftshoulder);
    leftshoulder.setAttribute("stroke", "black");
    leftshoulder.setAttribute("fill","grey");
    leftshoulder.id = "leftshoulder";
    leftshoulder.dataset.name = "sidedelts";
    frontsvg.append(leftshoulder.cloneNode(true))
    let backleftshoulder = leftshoulder.cloneNode(true);
    backleftshoulder.setAttribute("transform", "translate(-8 -5)")
    backleftshoulder.id ="backleftshoulder";
    backleftshoulder.dataset.name = "sidedelts";
    backsvg.append(backleftshoulder)

    const rightshoulder = document.createElementNS(url,"path");

    let drawrightshoulder = 'M 152,85 q 40 -5 20 40 q -10 -10 -10 -20 T 152 85'
    rightshoulder.setAttribute("d", drawrightshoulder);
    rightshoulder.setAttribute("stroke", "black");
    rightshoulder.setAttribute("fill","grey");
    rightshoulder.id = "rightshoulder";
    rightshoulder.dataset.name = "sidedelts";
    frontsvg.append(rightshoulder.cloneNode(true))
    let backrightshoulder = rightshoulder.cloneNode(true);
    backrightshoulder.setAttribute("transform", "translate(8 -5)");
    backrightshoulder.id= "backrightshoulder";
    backrightshoulder.dataset.name = "sidedelts";
    backsvg.append(backrightshoulder)

    const lowerchest = document.createElementNS(url,"path");
    let drawlowerchest = 'M 72,85 q -30 45 39 45 l 2 -35 l 5 35 Q 180 125 152 85 Q 110 110 72 85'
    lowerchest.setAttribute("d", drawlowerchest);
    lowerchest.setAttribute("stroke", "black");
    lowerchest.setAttribute("fill","grey");
    lowerchest.id = "lowerchest";
    lowerchest.dataset.name = "lowerchest";
    frontsvg.append(lowerchest)

    const leftfrontdelt = document.createElementNS(url,"path");
    let drawleftfrontdelt = 'M 72,86 q -12 20 -5 20 q 12 -20 5 -20'
    leftfrontdelt.setAttribute("d", drawleftfrontdelt);
    leftfrontdelt.setAttribute("fill","grey");
    leftfrontdelt.id = "leftfrontdelt";
    leftfrontdelt.dataset.name = "frontdelts";
    frontsvg.append(leftfrontdelt) 

    const rightfrontdelt = document.createElementNS(url,"path");
    let drawrightfrontdelt = 'M 152 86 q 12 20 5 20 q -12 -20 -5 -20'
    rightfrontdelt.setAttribute("d", drawrightfrontdelt);
    rightfrontdelt.setAttribute("fill","grey");
    rightfrontdelt.id ="rightfrontdelt";
    rightfrontdelt.dataset.name ="frontdelts";
    frontsvg.append(rightfrontdelt) 

    const leftbicep = document.createElementNS(url,"path");
    let drawleftbicep = 'M 52,125 Q 45 130 50 170 Q 60 165 65 160 Q 75 120 60 115 Z '
    leftbicep.setAttribute("d", drawleftbicep);
    leftbicep.setAttribute("stroke", "black");
    leftbicep.setAttribute("fill","grey");
    leftbicep.id  = "leftbicep";
    leftbicep.dataset.name  = "biceps";
    frontsvg.append(leftbicep.cloneNode(true))
    let lefttriceps = leftbicep.cloneNode(true);
    lefttriceps.setAttribute("transform", "translate(-7 -8)");
    lefttriceps.id ="lefttriceps";
    lefttriceps.dataset.name ="triceps";
    backsvg.append(lefttriceps);

    const leftforearm = leftbicep.cloneNode(true);
    leftforearm.setAttribute("transform", "rotate(180) translate(-105 -297) scale(0.8)");
    leftforearm.id = "leftforearm";
    leftforearm.dataset.name = "forearms";
    frontsvg.append(leftforearm.cloneNode(true))
    let backleftforearm = leftbicep.cloneNode(true);
    backleftforearm.setAttribute("transform", "rotate(180) translate(-97 -290) scale(0.8)");
    backleftforearm.id = "backleftforarm";
    backleftforearm.dataset.name = "forearms";
    backsvg.append(backleftforearm);

    const rightbicep = document.createElementNS(url,"path");

    let drawrightbicep = 'M 172 125 Q 180 130 177 168 Q 159 165 162 160 Q 149 120 165 114 Z'
    rightbicep.setAttribute("d", drawrightbicep);
    rightbicep.setAttribute("stroke", "black");
    rightbicep.setAttribute("fill","grey");
    rightbicep.id = "rightbicep";
    rightbicep.dataset.name = "biceps";
    frontsvg.append(rightbicep.cloneNode(true));
    let righttriceps = rightbicep.cloneNode(true);
    righttriceps.setAttribute("transform", "translate(7 -8)");
    righttriceps.id = "righttriceps";
    righttriceps.dataset.name = "triceps";
    backsvg.append(righttriceps)

    const rightforearm = rightbicep.cloneNode(true);
    rightforearm.setAttribute("transform", "rotate(180, 153, 150) scale(0.8)");
    rightforearm.id = "rightforearm";
    rightforearm.dataset.name = "forearms";
    frontsvg.append(rightforearm.cloneNode(true));
    let backrightforearm = rightbicep.cloneNode(true);
    backrightforearm.setAttribute("transform", "rotate(180, 156, 145) scale(0.8)");
    backrightforearm.id = "backrightforarm";
    backrightforearm.dataset.name = "forearms";
    backsvg.append(backrightforearm)

    const abdomen = document.createElementNS(url,"path");

    let drawabdomen = 'M 68 120 l 10 60 Q 115 220 150 178 l 7 -60 Q 110 145 68 120'
    abdomen.setAttribute("d", drawabdomen);
    abdomen.setAttribute("stroke", "black");
    abdomen.setAttribute("fill","grey");
    abdomen.id = "abdomen";
    abdomen.dataset.name = "core";
    frontsvg.append(abdomen)

    const leftquad = document.createElementNS(url,"path");

    let drawleftquad = 'M 78,185 Q 65 240 90 285 Q 110 264 124 270 Q 132 260 115 200 Q 88 200 78 185'
    leftquad.setAttribute("d", drawleftquad);
    leftquad.setAttribute("stroke", "black");
    leftquad.setAttribute("fill","grey");
    leftquad.setAttribute("transform","rotate(5 110 180)");
    leftquad.id = "leftquad";
    leftquad.dataset.name = "quads";
    frontsvg.append(leftquad.cloneNode(true))
    backsvg.append(leftquad.cloneNode(true))
    backsvg.querySelector("#leftquad").dataset.name = "hams";

    const rightquad = document.createElementNS(url,"path");
    let drawrightquad = 'M 150,180 Q 175 240 157 280 Q 135 265 130 270 Q 115 260 115 200 Q 135 200 150 180'
    rightquad.setAttribute("d", drawrightquad);
    rightquad.setAttribute("stroke", "black");
    rightquad.setAttribute("fill","grey");
    rightquad.setAttribute("transform","rotate(3 140 200)");
    rightquad.id = "rightquad";
    rightquad.dataset.name = "quads";
    frontsvg.append(rightquad.cloneNode(true))
    backsvg.append(rightquad.cloneNode(true))
    backsvg.querySelector("#rightquad").dataset.name = "hams"; 

    const leftshin = leftquad.cloneNode(true);
    leftshin.setAttribute("transform", "rotate(180) translate(-172 -470) scale(0.7)");
    leftshin.id = "leftshin";
    leftshin.dataset.name = "calves";
    frontsvg.append(leftshin.cloneNode(true))
    backsvg.append(leftshin.cloneNode(true))

    const rightshin = rightquad.cloneNode(true);
    rightshin.setAttribute("transform", "rotate(180) translate(-222 -475) rotate(5) scale(0.7)");
    rightshin.id = "rightshin";
    rightshin.dataset.name = "calves";
    frontsvg.append(rightshin.cloneNode(true));
    backsvg.append(rightshin.cloneNode(true));

    const upperlefttraps = document.createElementNS(url,"path");
    let drawupperlefttraps = 'M 95,75 Q 65 72 55 85 h 43'
    upperlefttraps.setAttribute("d", drawupperlefttraps);
    upperlefttraps.setAttribute("stroke", "black");
    upperlefttraps.setAttribute("fill","grey");
    upperlefttraps.id = "upperlefttraps";
    upperlefttraps.dataset.name = "traps/rhomboids";
    backsvg.append(upperlefttraps.cloneNode(true));

    const upperrighttraps = document.createElementNS(url,"path");
    let drawupperrighttraps = 'M 129,75 Q 155 70 168 85 h -45'
    upperrighttraps.setAttribute("d", drawupperrighttraps);
    upperrighttraps.setAttribute("stroke", "black");
    upperrighttraps.setAttribute("fill","grey");
    upperrighttraps.id = "upperrighttraps";
    upperrighttraps.dataset.name = "traps/rhomboids";
    backsvg.append(upperrighttraps.cloneNode(true));

    const leftreardelt = upperrighttraps.cloneNode(true);
    leftreardelt.setAttribute("transform", "rotate(180, 112, 85)");
    leftreardelt.id = "leftreardelts";
    leftreardelt.dataset.name = "reardelts";
    backsvg.append(leftreardelt.cloneNode(true))

    const rightreardelt = upperlefttraps.cloneNode(true);
    rightreardelt.setAttribute("transform", "rotate(180, 110, 85)");
    rightreardelt.id = "rightreardelts";
    rightreardelt.dataset.name = "reardelts";
    backsvg.append(rightreardelt.cloneNode(true))

    const traps = document.createElementNS(url,"path");
    let drawtraps = 'M 95,75 L 100 85 L 95 95 Q 82 100 65 93 Q 100 110 115 160 Q 130 110 158 92 Q 125 100 124 93 L 120 85 L 129 75'
    traps.setAttribute("d", drawtraps);
    traps.setAttribute("stroke", "black");
    traps.setAttribute("fill","grey");
    traps.id = "traps";
    traps.dataset.name = "traps/rhomboids";
    backsvg.append(traps.cloneNode(true))

    const rightlat = document.createElementNS(url,"path");
    let drawrightlat = 'M 164 114 Q 147 122 137 115 Q 133 110 115 160 L 135 175 L 145 165 Q 165 135 164 114'
    rightlat.setAttribute("d", drawrightlat);
    rightlat.setAttribute("stroke", "black");
    rightlat.setAttribute("fill","grey");
    rightlat.id = "rightlat";
    rightlat.dataset.name = "lats";
    backsvg.append(rightlat.cloneNode(true));

    const leftlat = document.createElementNS(url,"path");
    let drawleftlat = 'M 60 115 Q 85 122 92 115 Q 105 126 115 160 L 95 175 L 85 165 Q 60 135 60 114'
    leftlat.setAttribute("d", drawleftlat);
    leftlat.setAttribute("stroke", "black");
    leftlat.setAttribute("fill","grey");
    leftlat.id = "leftlat";
    leftlat.dataset.name = "lats";
    backsvg.append(leftlat.cloneNode(true));

    const lowback = document.createElementNS(url,"path");
    let drawlowback = 'M 115 160 L 95 175 v 5 L 115 195 L 135 180 v -5 Z'
    lowback.setAttribute("d", drawlowback);
    lowback.setAttribute("stroke", "black");
    lowback.setAttribute("fill","grey");
    lowback.id = "lowback";
    lowback.dataset.name = "lowback";
    backsvg.append(lowback.cloneNode(true));

    const buttocks = document.createElementNS(url,"path");
    let drawbuttocks = 'M 95 180 L 78 182 Q 55 230 116 215 Q 175 230 151 181 h -17 L 115 195 Z'
    buttocks.setAttribute("d", drawbuttocks);
    buttocks.setAttribute("stroke", "black");
    buttocks.setAttribute("fill","grey");
    buttocks.id = "buttocks";
    buttocks.dataset.name = "glutes";
    backsvg.append(buttocks.cloneNode(true));

    const leftoutline = document.createElementNS(url,"path");
    let drawleftoutline = 'M 151 181 L 145 165 '
    leftoutline.setAttribute("d", drawleftoutline);
    leftoutline.setAttribute("stroke", "black");
    leftoutline.setAttribute("fill","grey");
    backsvg.append(leftoutline.cloneNode(true),drawleftoutline);

    const rightoutline = document.createElementNS(url,"path");
    let drawrightoutline = 'M 78 182 L 85 165 '
    rightoutline.setAttribute("d", drawrightoutline);
    rightoutline.setAttribute("stroke", "black");
    rightoutline.setAttribute("fill","grey");
    backsvg.append(rightoutline.cloneNode(true),drawrightoutline);

    return {frontsvg,backsvg}
}
// Adding human figure SVG to HTML ____ should have been done at index.js like modules but CORS issue prevents it____

const newLine = (x1,y1,x2,y2,s="black",c="black",w=1) => {
    let line = document.createElementNS(url,"line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", s);
    line.setAttribute("fill",c);
    line.setAttribute("stroke-width", w);
    return line
}

// Clock SVG  

const clockDesign = () => {

    let width = "15vh";
    let height = "15vh";
    const clockSVG = document.createElementNS(url,"svg");

    clockSVG.setAttribute("width", width);
    clockSVG.setAttribute("height", height);
    clockSVG.setAttribute("viewBox", "0 0 100 100");

    const clockface = document.createElementNS(url,"circle");
    clockface.setAttribute("cx", "50");
    clockface.setAttribute("cy", "50");
    clockface.setAttribute("r", "45");
    clockface.setAttribute("stroke", "grey");
    clockface.setAttribute("fill","grey");
    clockSVG.append(clockface);

    

    const date = new Date()
    let sec = date.getSeconds();
    let min = date.getMinutes() + sec/60;
    let hour = (date.getHours() % 12) + min/60
    
    const createLine = document.createElementNS(url,"line");
    createLine.setAttribute("x1", "50");
    createLine.setAttribute("y1", "50");
    createLine.setAttribute("stroke", "black");
    createLine.setAttribute("fill","black");
    
    function time(face,x,y,w){
    face.setAttribute("x2", x);
    face.setAttribute("y2", y);
    face.setAttribute("stroke-width", w);
    }

    const hourhand = createLine.cloneNode(true);
    time(hourhand,50,20,3)
    hourhand.setAttribute("transform", `rotate(${hour*30}, 50, 50)`)
    hourhand.setAttribute("id", "hourhand");
    clockSVG.append(hourhand);

    const minhand = createLine.cloneNode(true);
    time(minhand,50,10,2);
    minhand.setAttribute("transform", `rotate(${min*6}, 50, 50)`);
    minhand.setAttribute("id", "minhand");
    clockSVG.append(minhand);

    const twelve = newLine(50,5,50,8);
    const one =  twelve.cloneNode(true);
    one.setAttribute("transform",`rotate(30 , 50, 50)`);
    const two =  twelve.cloneNode(true);
    two.setAttribute("transform",`rotate(60 , 50, 50)`);
    const three = newLine(92,50,95,50);
    const four =  three.cloneNode(true);
    four.setAttribute("transform",`rotate(30 , 50, 50)`);
    const five =  three.cloneNode(true);
    five.setAttribute("transform",`rotate(60 , 50, 50)`);
    const six = newLine(50,92,50,95);
    const seven =  six.cloneNode(true);
    seven.setAttribute("transform",`rotate(30 , 50, 50)`);
    const eight =  six.cloneNode(true);
    eight.setAttribute("transform",`rotate(60 , 50, 50)`);
    const nine = newLine(5,50,8,50);
    const ten =  nine.cloneNode(true);
    ten.setAttribute("transform",`rotate(30 , 50, 50)`);
    const eleven =  nine.cloneNode(true);
    eleven.setAttribute("transform",`rotate(60 , 50, 50)`);
    clockSVG.append(twelve,one,two,three,four,five,six,seven,eight,nine,ten,eleven)


    const fromClock = clockSVG.cloneNode(true);
    fromClock.childNodes[0].setAttribute("id", "fromClock");
    
    const toClock = clockSVG.cloneNode(true); 
    toClock.childNodes[0].setAttribute("id", "toClock");
    
    
    return {fromClock, toClock};
}

const graphics = (el,legEl,w,h) => {

    const chart = document.createElementNS(url,"svg");
    let width = parseInt(el.getBoundingClientRect().width);
    let height = parseInt(el.getBoundingClientRect().height*0.90);
    let xaxisPoints = [];
    let yaxisPoints = [];
    let scaleW = 1;
    let scaleH = 1;
    let displayFactor;
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    // svgcontainer.setAttribute("viewBox", `0 0 ${width} ${height}`)
    // el.append(svgcontainer);

    const createLegend = (keys,width=200,height=400,arr) => {
        const legend = document.createElementNS(url,"svg");
        const text = document.createElementNS(url,"text");
        const icon =  document.createElementNS(url,"rect");
        const w = parseInt(width/3)
        legend.setAttribute("width", w);
        legend.setAttribute("height", height);
        legend.setAttribute("viewBox",`0 0 ${w} ${height}`);
        text.setAttribute("fill", "white");
        text.setAttribute("x", w-65);

        let cloneText = text.cloneNode(true);
        cloneText.setAttribute("y", 10)
        // arr = arr.map(e => {
        //     if( /\w{1,2}-\w{3}-\w+/.test(e)){
        //         return `${new Date().getFullYear()}`.substring(0,2)+e.substring(e.length-2,e.length);
        //     }
        //     else if ( /week/.test(e)){

        //     }
        // )};
        const currYr = Math.min(...arr)
        const rangeStr = Math.min(...arr)!==Math.max(...arr)? "-"+String(Math.max(...arr)).substring(2,4) : ""; 
        const years = "Year: "+currYr+rangeStr;
        cloneText.append(years);
        legend.append(cloneText);
        
        keys.forEach((val,i) => {
            let cloneText = text.cloneNode(true);
            let cloneIcon = icon.cloneNode(true);
            
            let color = `hsl(${(i*40)%360},${90-3*i}%,${50+2*i}%)`;
            
            cloneIcon.setAttribute("x", w-10);
            cloneIcon.setAttribute("y", 15 + 12*i);
            cloneIcon.setAttribute("width",10);
            cloneIcon.setAttribute("height",10);
            cloneIcon.setAttribute("fill",color);
            cloneIcon.setAttribute("stroke","black");
            cloneIcon.setAttribute("stroke-width","1");

            legend.append(cloneIcon);
            
            cloneText.setAttribute("y", 15 + 13*(i+0.5))
            cloneText.append(val);

            legend.append(cloneText);
        })
        return legend;
    }

    const createAxis = (width, height, xlabels, ylabels) => {
        
        let xAxis = document.createElementNS(url, "line");
        // let yAxis = document.createElementNS(url, "line");
        
        xAxis.setAttribute("x1", 0)
        xAxis.setAttribute("y1", `${(height)}`)
        xAxis.setAttribute("x2", width)
        xAxis.setAttribute("y2", `${(height)}`)
        xAxis.setAttribute("stroke","black")
        xAxis.setAttribute("stroke-width","3")

        // yAxis.setAttribute("x1", 0)
        // yAxis.setAttribute("y1", `${(height)}`)
        // yAxis.setAttribute("x2", 0)
        // yAxis.setAttribute("y2", 0)
        // yAxis.setAttribute("stroke","black")
        // yAxis.setAttribute("stroke-width","3")
        createMarker(xlabels);
        return {xAxis};
    }

    const createMarker = (textX, textY) => {
        let markerX = document.createElementNS(url,"line");
        let markerY = document.createElementNS(url,"line");
        let text = document.createElementNS(url,"text");
        textX = textX.map(e => /\w{1,2}-\w{3}-\w+/.test(e) ?  e.substring(0,e.length-5) : e);
        markerX.setAttribute("y1", `${height}`);
        markerX.setAttribute("y2", `${parseInt(height)+4}`);
        markerX.setAttribute("stroke","black");
        markerX.setAttribute("stroke-width","2");
        markerY.setAttribute("x1", 0);
        markerY.setAttribute("x2", -4);
        markerY.setAttribute("stroke","black");
        markerY.setAttribute("stroke-width","2");
        let valX = 0;
        let valY = 0;
        for (i=30; i<=Math.floor(width/displayFactor*(textX.length-1)+30);i+=Math.floor(width/displayFactor)){ // hardcoded number accomodates equal number of dates on x-axis. Need to change it to be dynamic for day, week, and month view 
            let cloneMarkerLineX = markerX.cloneNode(true);
            let cloneText = text.cloneNode(true);
            cloneMarkerLineX.setAttribute("x1",i);
            cloneMarkerLineX.setAttribute("x2",i);
            cloneText.setAttribute("x", cloneMarkerLineX.getAttribute("x1")-20);
            cloneText.setAttribute("y", parseInt(height)+15);
            cloneText.setAttribute("fill", "white");
            cloneText.append(textX[valX++]);
            chart.append(cloneMarkerLineX,cloneText)
        }

        // for (i=(height-Math.floor(height/7)); i>0;i-=Math.floor(height/7)){
        //     let cloneMarkerLineY = markerY.cloneNode(true);
        //     let cloneText = text.cloneNode(true)
        //     valY += parseInt(textY*2/7);
        //     cloneMarkerLineY.setAttribute("y1",i);
        //     cloneMarkerLineY.setAttribute("y2",i);
        //     cloneText.setAttribute("x", -30);
        //     cloneText.setAttribute("y", cloneMarkerLineY.getAttribute("y1")-Math.floor(height/7-30));
        //     cloneText.append(parseInt(valY));
        //     chart.append(cloneMarkerLineY,cloneText)
        // }
        
        // 
    }

    return (entries,xLabelArr,legendArr) => {
    // let innerObject = Object.values(entries);
    // let innerKeys = Object.values(innerObject).map((o,i)=> Object.keys(o));
    // let values = Object.values(innerObject).map((o,i)=> Object.values(o).reduce((a,b)=>a+b));
    //     console.log(innerKeys)
    // let total = values.reduce((x,y)=>x+y);
    // values = inputHeight? values.map(val => Math.round((val/total)*inputHeight,0)) : values ;
    // values = values.sort((x,y)=> x-y)
    // let height = Math.max(...values.flat())+100 ; 
    // let width = Math.max(...values.flat())+150;
    displayFactor = xLabelArr.length; 
    const legendValues = [];
    const yMax = Math.ceil(Math.max(...entries.flatMap(e => Object.values(e).flat())));
    chart.setAttribute("width", "100%");
    chart.setAttribute("height", "100%");
    chart.setAttribute("viewBox", `0 0 ${parseInt(width)} ${parseInt(height)+50}`);
    const {xAxis, yAxis} = createAxis(width,height,xLabelArr); 
    const line = document.createElementNS(url, "line");
    line.setAttribute("fill", "none")
    line.setAttribute("stroke-width","1.5")

    const marker = document.createElementNS(url, "marker");
    marker.setAttribute("id", "points")
    marker.setAttribute("refX", 2);
    marker.setAttribute("refY", 2);
    marker.setAttribute("markerWidth", 5);
    marker.setAttribute("markerHeight", 5);
    const dot = document.createElementNS(url, "circle");
    dot.setAttribute("cx",2)
    dot.setAttribute("cy",2)
    dot.setAttribute("r",2)
    dot.setAttribute("fill","black")
    marker.append(dot);    
    chart.append(xAxis,yAxis,marker);

    const text = document.createElementNS(url,"text");
    
    entries.forEach((obj,i)=> {
        let color = `hsl(${(i*40)%360},${90-3*i}%,${50+2*i}%)`;
        line.setAttribute("stroke", color)
        let valArr = Object.values(obj)[0];
        
        legendValues.push(Object.keys(obj)[0]);
        let points = [];
        let maxVal = Math.ceil(Math.max(...valArr)); 
        scaleW = Math.ceil(maxVal/width)*2||scaleW;
        scaleH = Math.ceil(yMax/height)*2||scaleH;    
        valArr.forEach((val,i) => {
            let clone = line.cloneNode(true);
            let cloneText = text.cloneNode(true)
            if (!points.length){
                points = [30,height-Math.floor(val/scaleH)];
                cloneText.setAttribute("x", points[0]);
                cloneText.setAttribute("y", points[1]);
                cloneText.setAttribute("fill", "white");
                cloneText.append(val);
                chart.append(cloneText);
            }
            else{
                clone.setAttribute("x1", points[0]);
                clone.setAttribute("y1", points[1]);
                points = ([points[0]+Math.floor(width/displayFactor),height-Math.floor(val/scaleH)]) // hardcoded number to align line chart values to each label on x-axis.
                clone.setAttribute("x2", points[0]);
                clone.setAttribute("y2", points[1]);
                clone.setAttribute("marker-start","url(#points)"); clone.setAttribute("marker-end","url(#points)") ;
                cloneText.setAttribute("x", parseInt(clone.getAttribute("x2"))-10);
                cloneText.setAttribute("y", parseInt(clone.getAttribute("y2"))-15);
                cloneText.setAttribute("fill", "white");
                cloneText.append(val);
                chart.append(clone,cloneText);
            }
        })
    })

    el.append(chart);
    legEl.append(createLegend(legendValues,width,height,legendArr));
    }
}

// Muscular man figure svg

const muscularManSvg = (container,viewbox,w,h) => {
const controlArea = document.createElement("div");
const svgarea = document.createElementNS(url,"svg");
    svgarea.setAttribute("width", `${w||100}%`);
    svgarea.setAttribute("height", `${h||100}%`);
    svgarea.setAttribute ("viewBox", `${viewbox?.[0]||0},${viewbox?.[1]||0},${viewbox?.[2]||180},${viewbox?.[3]||150}`);
const frontView = svgarea.cloneNode(true);
const backView = svgarea.cloneNode(true); 
    
const controls = svgarea.cloneNode(true);
const circle = document.createElementNS(url,"circle");
    circle.setAttribute("r", "30");
    circle.setAttribute("cy", "75");
    circle.setAttribute("stroke", "black");
    circle.setAttribute("fill", "white");
const c1 = circle.cloneNode(true);
    c1.setAttribute("cx", "0");
    c1.setAttribute("fill", "black");
const c2 = circle.cloneNode(true);
    c2.setAttribute("cx", "200");

container.append(frontView);
frontView.id = "frontHumanSVG";
container.append(backView);
backView.id = "backHumanSVG";
backView.classList = "hide";
container.append(controlArea);
controlArea.append(controls);
controls.append(c1,c2);

let faceImgUrl = ""//prompt("Enter face image url");
const measurements = Object.fromEntries(Object.entries(Object.values(JSON.parse(localStorage.measuredValues))[0]).map(([k,v])=> [k,v.split(" ")[0]])) ;

let neck = measurements?.["neck"]*1 || 13;
let arms = measurements?.["arms"]*1 || 13;
let forearm = measurements?.["forearms"]*1 || 13; 
let shoulders = measurements?.["shoulders"]*1 || 20;
let calves = measurements?.["calves"]*1 ||15;
let thighs = measurements?.["thighs"]*1 || 22;
let chest = measurements?.["chest"]*1 || 50;
let fat = measurements?.["abdomen"]-10 || 20
let latSpread = chest*1.5;
let color = "grey";

//Head
let drawHead = defineVars(createDesign,[frontView],"","head",50,-20,25,25,0,28,0,28)
drawHead({})
drawHead({},"rev") ;
drawHead({y1:-21},true);
drawHead({y1:-22},true);
drawHead({y1:-23},true);
drawHead({y1:-23.5,x2:0,y2:-10,t1:-10,t2:-10},"rev");
drawHead({x1:49},true);

let drawbackHead = defineVars(createDesign,[backView],{"fill":"black"},"head",50,-20,25,25,0,28,0,28)
drawbackHead({})
drawbackHead({},"rev") ;
neck = 10

//Neck
let drawNeck = defineVars(createDesign,[frontView],"","neck",60,6,-6,12,0,0,0,0)
drawNeck({s2:2.5,t2:10})
for (let i=0;i<neck/2;i++){
    drawNeck({y1:18+i/10,y2:12+i/10,s2:2.5-i/2,delta:[0,0]},"next")
}
drawNeck({x1:69,x2:6,s2:-2.5,t2:10},"reset")
for (let i=0;i<neck/2;i++){
    drawNeck({y1:18+i/10,y2:12+i/10,s2:-2.5+i/2,delta:[0,0]},"next")
}
drawNeck({x1:64,y1:8,y2:12,x2:0,s2:-2.5,t2:10},"reset")
for (let i=0;i<neck/4;i++){
    drawNeck({delta:[-0.2,0]},"next")
}
drawNeck({x1:65},"rev")
for (let i=0;i<neck/4;i++){
    drawNeck({delta:[-0.2,0]},"next")
}
drawNeck({x1:60.5,y1:8,y2:12,x2:3},"reset")
for (let i=0;i<neck;i++){
    drawNeck({y2:12-i/2,delta:[-0.1,0]},"next")
}
drawNeck({x1:68,y1:8,y2:12,x2:-3},"reset")
for (let i=0;i<neck;i++){
    drawNeck({y2:12-i/2,delta:[0.1,0]},"next")
}

let drawNeckBack = defineVars(createDesign,[backView],"","neck",60,6,-6,9,0,0,0,0)
drawNeckBack({s2:2.5,t2:8})
for (let i=0;i<neck;i++){
    drawNeckBack({delta:[0.1,0.2]},"next")
}
drawNeckBack({x1:69,x2:6,s2:-2.5,t2:8},"reset")
for (let i=0;i<neck;i++){
    drawNeckBack({delta:[-0.1,0.2]},"next")
}

//traps lines
let drawTraps = defineVars(createDesign,[frontView,backView],{fill:"black"},"",59,13.5,-5,1,0,0,0,0);
drawTraps({t2:-0.5});
for (let i=0;i<5;i++){
    drawTraps({delta:[0,0.25]},"next")
}
drawTraps({x1:70, y1:13.5, y2:-1, t2:0.5}, "rev");
for (let i=0;i<5;i++){
    drawTraps({delta:[0,0.25]},"next")
}

//shoulders
//lateral delts
let drawSideDelt = defineVars(createDesign,[frontView,backView],"","sidedelts",54.5,15,-19,8,0,0,0,0);
drawSideDelt({s2:-shoulders/2,t2:-0})
for (let i=0;i<shoulders/2;i++){
    drawSideDelt({x1:35.5,s2:-shoulders/2+i,delta:[0,0.1]},"next")
}
drawSideDelt({x1:76,y1:17,x2:15,y2:0,s2:10,t2:-shoulders/6},"reset")
for (let i=0;i<shoulders/1.5;i++){
    drawSideDelt({delta:[-0.1,-0.1]},"next")
}
//lateral delts back side
let drawSideDeltBack = defineVars(createDesign,[backView],"","sidedelts",54.5,18.5,-14,3,0,0,0,0);
drawSideDeltBack({s2:-shoulders/6,t2:-shoulders/6})
for (let i=0;i<shoulders/2;i++){
    drawSideDeltBack({t2:-shoulders/6+i/2,delta:[-0.05,0.05]},"next")
}
drawSideDeltBack({x1:76,y1:17,x2:14,y2:0,s2:10,t2:-shoulders/6},"reset")
for (let i=0;i<shoulders/4;i++){
    drawSideDeltBack({t2:-shoulders/6+i/2,delta:[0,0.05]},"next")
}
//rear delts
let drawRearDelt = defineVars(createDesign,[backView],"","reardelts",53,20,-10,0,0,0,0,0);
drawRearDelt({y1:20+shoulders/10,s2:-2.5,t2:-shoulders/10},"reset")
for (let i=0;i<shoulders/4;i++){
    drawRearDelt({t2:-shoulders/10+i,delta:[-0.05,0.05]},"next")
}
drawRearDelt({x1:74,x2:14,y1:18+shoulders/15,y2:-3,s2:2.5,t2:shoulders/10},"reset")
for (let i=0;i<shoulders/4;i++){
    drawRearDelt({t2:shoulders/10-i,delta:[-0.05,-0.05]},"next")
}

//anterior delts
let drawFrontDelt = defineVars(createDesign,[frontView,],"","frontdelts",52,21,-10,4,0,0,0,0);
drawFrontDelt({y1:21,s2:-shoulders/4,t2:0 })
for (let i=0;i<shoulders/3;i++){
    drawFrontDelt({delta:[-0.2,-0.2]},"next")
}
drawFrontDelt({x1:43,y1:28,x2:-7.5,y2:0,s2:0,t2:0},"rev")
for (let i=0;i<shoulders/3;i++){
    drawFrontDelt({delta:[0,-0.15]},"next")
}
// lines
drawFrontDelt({x1:90,y1:17,x2:-13,y2:2,s2:-shoulders/5,t2:-shoulders/6},"reset")
for (let i=0;i<shoulders/3;i++){
    drawFrontDelt({delta:[0.2,0.15]},"next")
}
drawFrontDelt({x1:76,y1:23,x2:-9,y2:-5,s2:0,t2:-5},"rev")
for (let i=0;i<shoulders/3;i++){
    drawFrontDelt({delta:[0,-0.15]},"next")
}

//upper-arms
    
let drawTriceps = defineVars(createDesign,[frontView,backView],"","triceps",40,22,-15,20,0,0,0,0)
let drawBiceps = defineVars(createDesign,[frontView,backView],"","biceps",40,22,-15,20,0,0,0,0)

//left triceps
drawTriceps({s1: -arms/2, s2:-10, t2:arms/2})
for (let i=0;i<arms;i++){
    drawTriceps({x2:-15-i/3,delta:[-0.1,0.15]},"next")
}
//left biceps
drawBiceps({x1:27+arms/10,y1:43,x2:15,y2:-15,s2:arms/3,t2:-10+arms},"reset")//(85,19,20,25,0,0,0,0)
for (let i=0;i<arms;i++){
    drawBiceps({t2:-10+arms-i,delta:[0,-0.05]},"next")
}
drawBiceps({},"rev")
for (let i=0;i<arms/2;i++){
    drawBiceps({t2:-12+arms-i,delta:[0,-0.05]},"next")
}

// right biceps
drawBiceps({x1:90,y1:18,x2:15,y2:1,s2:10,t2:-arms/4}, "reset")
for (let i=0;i<arms/4;i++){
    drawBiceps({delta:[-0.1,-0.5]},"next")
}
drawBiceps({x1:103,y1:21,x2:25,y2:-4,s2:10,t2:0}, "rev")
for (let i=0;i<arms/2;i++){
    drawBiceps({t2:-i,delta:[0.2,-0.25]},"next")
}
//right triceps
drawTriceps({x1:112, y1:22+arms/7.5,x2:-32.5, y2:2, s1:-arms/2, s2:-15, t2:arms/3},"reset") //
for (let i=0;i<arms;i++){
    drawTriceps({x2:-33.5+i,delta:[0,-0.15]},"next")
}


//forearm
forearm=14
let drawforearms = defineVars(createDesign,[frontView,backView],"","forearms",25,45,18,15.5,0,0,0,0)
drawforearms({s2:-5,t2:forearm/3,t1:5,s1:-5})
for (let i=0;i<forearm;i++){
    drawforearms({y2:15.5-i/3,delta:[-0.1,0]},"next")
}
drawforearms({x1: 40,y1: 55, x2:12.5, y2:12, s2:5,t2:forearm/2,t1:5,s1:10},"rev")
for (let i=0;i<forearm;i++){
    drawforearms({x2:-12.5+i/3,delta:[0.1,0]},"next")
}
drawforearms({x1: 103, y1:19, x2: 0, y2:-15, s2:forearm/5}, "reset")
for (let i=0;i<forearm;i++){
    drawforearms({x2:0-i/5,delta:[0.1,0.15]},"next")
}
drawforearms({x1:112,y1:24,y2:-25,x2:-6}, "true")
for (let i=0;i<forearm;i++){
    drawforearms({x2:-3-i/5,delta:[0,-0.1]},"next")
}

let drawHands = defineVars(createDesign,[frontView,backView],"","",40,60,0,-5,0,0,0,0);
drawHands({s1:2,t1:5,s2:10,t2:-5})
drawHands({x1:107.5,y1:0,x2:-10,y2:-2,s2:2.5,t2:-5},"reset")
drawHands({x1:98,y1:-1,x2:2,y2:-5,s1:2,t1:5,s2:5,t2:-7},"rev")
drawHands({x2:-7,y2:-2,t2:10},"rev")

//chest
//upper chest
let drawUpperChest = defineVars(createDesign,[frontView],"","upperchest",51,22.5,12.5,0,0,0,0,0);
drawUpperChest({t2:-5,s2:10})
for (let i=0;i<chest/5;i++){
    drawUpperChest({s2:chest/10+i,delta:[0,0.25]},"next")
}
drawUpperChest({x1:77,x2:-12.5,t2:-5,s2:-10},"reset")
for (let i=0;i<chest/5;i++){
    drawUpperChest({s2:-chest/10-i,delta:[0,0.25]},"next")
}
//lower chest
let drawlowerChest = defineVars(createDesign,[frontView],"","lowerchest",50,26,13.5,-2,0,0,0,0);
drawlowerChest({t2:-5})
for (let i=0;i<10;i++){
    let x = chest/100;
    drawlowerChest({delta:[0,x]},"next")
}
drawlowerChest({},"reset")
for (let i=0;i<10;i++){
    let x = chest/100
    drawlowerChest({delta:[0,x]},"next")
}
drawlowerChest({t2:chest/5,s2:12},"reset")
for (let i=0;i<10;i++){
    let x = chest/100
    drawlowerChest({delta:[0,x]},"next")
}
drawlowerChest({x1:77,x2:-12.5,t2:-5},"reset")
for (let i=0;i<10;i++){
    let x = chest/100;
    drawlowerChest({delta:[0,x]},"next")
}
drawlowerChest({x1:77,x2:-12.5},"reset")
for (let i=0;i<10;i++){
    let x = chest/100
    drawlowerChest({delta:[0,x]},"next")
}
drawlowerChest({x1:77,x2:-12.5,t2:chest/5,s2:-12},"reset")
for (let i=0;i<10;i++){
    let x = chest/100
    drawlowerChest({delta:[0,x]},"next")
}

// torso
//lats front side
let drawLats = defineVars(createDesign,[frontView],{stroke:"black"},"lats",77,27,0,30,0,0,0,0);
drawLats({s2:chest/10,t1:5}) 
for (let i=0;i<chest/5;i++){
    drawLats({s2:chest/10+i,delta:[0,-0.25]},"next")
}
drawLats({x1:50,y1:58,s2:-chest/10,t1:5},true) 
for (let i=0;i<chest/5;i++){
    drawLats({s2:-chest/10-i,delta:[0,-0.25]},"next")
}
//lats back side
let drawLatsBack = defineVars(createDesign,[backView],"","lats",50,28,5,30,0,0,0,0);
drawLatsBack({s2:-5,t2:10})
for (let i=0;i<latSpread/10;i++){
    drawLatsBack({x2:5+i,delta:[0,0.2]},"next")
}
drawLatsBack({s2:-5,t2:10},"reset")
for (let i=0;i<latSpread/4;i++){
    drawLatsBack({x2:5-i/2,y2:30-i,delta:[0,0.1]},"next")
}
drawLatsBack({x1:77,y1:26,x2:-5,s2:5,t2:10},"reset")
for (let i=0;i<latSpread/10;i++){
    drawLatsBack({x2:-5-i,delta:[0,0.2]},"next")
}
drawLatsBack({x1:77,y1:26,x2:-5,s2:6,t2:10},"reset")
for (let i=0;i<latSpread/4;i++){
    drawLatsBack({x2:-5+i/2,y2:30-i,delta:[0,0.15]},"next")
}

//Traps/Rhomboids
//lower traps
let drawLowerTraps = defineVars(createDesign,[backView],"","lowertraps",54.5,27,7,27.5,0,0,0,0);
drawLowerTraps({s2:-5,t2:10})
for (let i=0;i<33;i++){
    drawLowerTraps({x2:8-i/2,s2:-1+i/10,delta:[0.1,0]},"next")
}
//mid-traps and rhomboids
let drawMidTraps = defineVars(createDesign,[backView],"","traps/rhomboids",53,21.5,10,5,0,0,0,0);
drawMidTraps({s2:10,t2:10})
for (let i=0;i<20;i++){
    drawMidTraps({t2:10-i/2,delta:[0.1,-0.20]},"next")
}
drawMidTraps({x1:74,x2:-10,s2:-10,t2:10},"reset")
for (let i=0;i<20;i++){
    drawMidTraps({t2:10-i/2,delta:[-0.1,-0.20]},"next")
}

//lines
let drawCore = defineVars(createDesign,[frontView,backView],{stroke:"black"},"",49,49,1,15,0,0,0,0);
drawCore({s2:-fat/10,t2:30})
for (let i=0;i<15;i++){
    let x = 20/100
    drawCore({s2:-i/3*fat/10,delta:[0,x]},"next")
}
drawCore({x1:77,y1:48,x2:1,y2:-15,s2:-fat/10,t2:-30}, "rev")
for (let i=0;i<15;i++){
    let x = 20/100
    drawCore({s2:i/3*fat/10,delta:[0,x]},"next")
}
//abs
let drawAbs = defineVars(createDesign,[frontView],"","core",55,38,7.5,2.5,0,0,0,0);
drawAbs({t1:-2.5,s2:10,t2:-5})
for (let i=0;i<15;i++){
    let x = 20/100
    drawAbs({t2:-5+i/2,t1:-2.5+i,delta:[-0.05,x]},"next")
}
drawAbs({x1:55,y1:50,t1:-2.5,s2:7.5,t2:-5})
for (let i=0;i<10;i++){
    let x = 20/100
    drawAbs({t2:-5+i/2,t1:-2.5+i,delta:[-0.05,x]},"next")
}
drawAbs({x1:55,y1:59,y2:1,t1:-2.5,s2:6.5,t2:-5})
for (let i=0;i<8;i++){
    let x = 20/100
    drawAbs({t2:-5+i/2,t1:-2.5+i,delta:[-0.05,x]},"next")
}
drawAbs({x1:55,y1:63,y2:0,t2:2.5},"reset")
for (let i=0;i<100;i++){
    drawAbs({x2:7.5-i/15,delta:[0,0.15]},"next")
}
drawAbs({x1:72.5,y1:38,x2:-7.5,t1:-2.5,s2:-10,t2:-5},"reset")
for (let i=0;i<15;i++){
    let x = 20/100
    drawAbs({t2:-5+i/2,t1:-2.5+i,delta:[0.05,x]},"next")
}
drawAbs({x1:71.5,y1:50,x2:-7.5,t1:-2.5,s2:-7.5,t2:-5})
for (let i=0;i<10;i++){
    let x = 20/100
    drawAbs({t2:-5+i/2,t1:-2.5+i,delta:[0.05,x]},"next")
}
drawAbs({x1:71.5,y1:59,y2:1,x2:-7.5,t1:-2.5,s2:-6.5,t2:-5})
for (let i=0;i<8;i++){
    let x = 20/100
    drawAbs({t2:-5+i/2,t1:-2.5+i,delta:[0.05,x]},"next")
}
drawAbs({x1:71,y1:63,x2:-7.5,y2:0,t2:2.5},"reset")
for (let i=0;i<100;i++){
    drawAbs({x2:-7.5+i/15,delta:[0,0.15]},"next")
}
//obliques
let drawObliques = defineVars(createDesign,[frontView],"","obliques",51,40,-1,30,0,0,0,0);
drawObliques({s2:3,t2:20,s1:-2,t2:30})
for (let i=0;i<30;i++){
    let x = 20/100
     drawObliques({y2:30-i/2,delta:[x/2,0]},"next")
}
drawObliques({x1:76,x2:-1,s2:-3,t2:20,s1:2,t2:30},"reset")
for (let i=0;i<35;i++){
    let x = 20/100
     drawObliques({y2:30-i/2,delta:[-x/2,0]},"next")
}

//lower back
let drawLowBack = defineVars(createDesign,[backView],"","lowback",60.5,56,5,0,0,0,0,0);
drawLowBack({})
for (let i=0;i<15;i++){
    drawLowBack({x1:65.5+i/10,x2:5+i/5,delta:[0,0.5]},"next")
}

//lines
let spineline = defineVars(createDesign,[backView],{stroke:"white",fill:"transparent"},"",63,64,2,-45,0,0,0,0);
spineline({s2:1,t2:-45,s1:-2,t1:-40})

//glutes
let drawGlutes = defineVars(createDesign,[backView],"","glutes",50,66,7.5,-2,0,0,0,0);
drawGlutes({t2:-2.5}) 
for (let i=0;i<15;i++){
    drawGlutes({delta:[-0.2,-0.05]},"next")
}
drawGlutes({x1:49,y1:67,x2:13.5,t2:-5},"reset") 
for (let i=0;i<25;i++){
    drawGlutes({x1:62.5,x2:13.5-i/3,t2:-5+i/2,delta:[-0.2,0.5]},"next")
}
drawGlutes({x1:76,x2:-7.5,t2:-2.5},"reset") 
for (let i=0;i<15;i++){
    drawGlutes({delta:[0.2,-0.05]},"next")
}
drawGlutes({x1:77,y1:67,x2:-14,t2:-5},"reset")
for (let i=0;i<25;i++){
    drawGlutes({x1:63,x2:-14+i/3,t2:-5+i/2,delta:[0.2,0.5]},"next")
}

//quads
let drawQuadsLeft = defineVars(createDesign,[frontView],"","quads",50,67.5,0,35,0,0,0,0);
drawQuadsLeft({s2:-1})
for (let i=0;i<15;i++){
    let x = thighs/100
     drawQuadsLeft({s2:-i/2,t2:i/2,delta:[-x/2,0]},"next")
}
drawQuadsLeft({x1:48.5,y2:35,s2:1},"reset")
for (let i=0;i<20;i++){
    let x = thighs/100
     drawQuadsLeft({s2:i,t1:i,delta:[x/2,0]},"next")
}
drawQuadsLeft({x1:50.5,y1:104,x2:0,s2:0,t2:0},true)
for (let i=0;i<15;i++){
    let x = thighs/100
     drawQuadsLeft({s2:-i/2,t2:i,delta:[-x,0]},"next")
}
drawQuadsLeft({x1:56,y1:86.5,x2:-2.5,y2:15,s2:-thighs/5,t2:20},"reset")
for (let i=0;i<20;i++){
    let x = thighs/100
    drawQuadsLeft({delta:[x/2,0]},"next")
}

let drawQuadsRight = defineVars(createDesign,[frontView],{fill:"black"},"quads",76,67.5,0,35,0,0,0,0);
drawQuadsRight({s2:1})
for (let i=0;i<15;i++){
    let x = thighs/100
     drawQuadsRight({s2:i/2,t2:i/2,delta:[x/2,0]},"next")
}
drawQuadsRight({x1:77,y2:35,s2:1},"reset")
for (let i=0;i<20;i++){
    let x = thighs/100
     drawQuadsRight({s2:-i,t1:i,delta:[-x/2,0]},"next")
}
drawQuadsRight({x1:75,y1:104,x2:0,s2:0,t2:0},true)
for (let i=0;i<15;i++){
    let x = thighs/100
     drawQuadsRight({s2:i/2,t2:i,delta:[x,0]},"next")
}
drawQuadsRight({x1:67,y1:86.5,x2:2.5,y2:15,s2:thighs/5,t2:20},"reset")
for (let i=0;i<20;i++){
    let x = thighs/100
    drawQuadsRight({delta:[x/2,0]},"next")
}

//hams
let drawHamsRight = defineVars(createDesign,[backView],"","hams",50,70,0,35,0,0,0,0);
drawHamsRight({s2:-5,t2:20})
for (let i=0;i<15;i++){
    let x = thighs/100
     drawHamsRight({s2:-5+i/2,delta:[0,0]},"next")
}
drawHamsRight({x1:53,s2:-5},"rev")
for (let i=0;i<15;i++){
    let x = thighs/100
    drawHamsRight({s2:-4+i/2,delta:[0,0]},"next")
}


let drawHamsLeft = defineVars(createDesign,[backView],"","hams",77,70,0,35,0,0,0,0);
drawHamsLeft({s2:5,t2:20})
for (let i=0;i<15;i++){
    let x = thighs/100
     drawHamsLeft({s2:5-i/2,delta:[0,0]},"next")
}
drawHamsLeft({x1:74,s2:5},"rev")
for (let i=0;i<15;i++){
    let x = thighs/100
     drawHamsLeft({s2:4-i/2,delta:[0,0]},"next")
}

// quads back side
let drawQuadsRightBack = defineVars(createDesign,[backView],"","quads",54,75,1,30,0,0,0,0);
drawQuadsRightBack({s2:1},"reset")
for (let i=0;i<10;i++){
    let x = thighs/100
     drawQuadsRightBack({s2:i,t1:i,delta:[x/2,0]},"next")
}
drawQuadsRightBack({x1:50,y1:90,y2:20,x2:2,s2:2.5,t2:5,t1:0},true)
for (let i=0;i<10;i++){
    let x = thighs/150
     drawQuadsRightBack({s2:2.5-i/2,delta:[-x,0]},"next")
}

let drawQuadsLeftBack = defineVars(createDesign,[backView],"","quads",73,75,-1,30,0,0,0,0);
drawQuadsLeftBack({s2:1},"reset")
for (let i=0;i<10;i++){
    let x = thighs/100
     drawQuadsLeftBack({s2:-i,t1:i,delta:[-x/2,0]},"next")
}
drawQuadsLeftBack({x1:77,y1:90,y2:20,x2:-2,s2:-2.5,t2:5,t1:0},true)
for (let i=0;i<10;i++){
    let x = thighs/150
     drawQuadsLeftBack({s2:-2.5+i/2,t2:i,delta:[x,0]},"next")
}

//shin lines
let drawLeftShinBack = defineVars(createDesign,[backView],"","",50,107.5,2,30,0,0,0,0);
let drawRightShinBack = drawLeftShinBack;
drawLeftShinBack({s2:-2.5,t2:7.5})
drawLeftShinBack({x1:57,y1:122,x2:-2,y2:16,s2:1},"reset")
drawRightShinBack({x1:77,y1:108,x2:-1,s1:5,t1:10,s2:0,t2:20},"reset")
drawRightShinBack({x1:71.5,x2:0,s2:calves/4,t2:10,s1:-5,t1:15},"reset")

let drawLeftShin = defineVars(createDesign,[frontView],"","",48,107.5,2,30,0,0,0,0);
let drawRightShin = drawLeftShin;
drawLeftShin({s2:-2.5,t2:7.5})
drawLeftShin({x1:55,y1:122,x2:-2,y2:16,s2:1},"reset")
drawRightShin({x1:77,y1:108,x2:-1,s1:5,t1:10,s2:0,t2:20},"reset")
drawRightShin({x1:71.5,x2:0,s2:calves/4,t2:10,s1:-5,t1:15},"reset")

//calves
let drawCalvesFront = defineVars(createDesign,[frontView],"","calves",56,108,0,15,0,0,0,0);
drawCalvesFront({y1:108,y2:15+calves/5,s2:calves/3,t2:7.5},"reset")
for (let i=0;i<calves/2;i++){
    drawCalvesFront({x1:56,s2:-calves/5+i,delta:[0,0]},"next")
}
drawCalvesFront({x1:71.5,y2:15+calves/5,x2:2,s2:-calves/5,t2:10},"reset")
for (let i=0;i<calves/2;i++){
    drawCalvesFront({x1:73,s2:-calves/5+i,delta:[0,0]},"next")
}
drawCalvesFront({x1:78,s2:-calves/5},"rev")
for (let i=0;i<calves/4;i++){
    drawCalvesFront({x1:76,s2:calves/5-i,delta:[-0.1,0]},"next")
}

let drawCalvesBack = defineVars(createDesign,[backView],"","calves",50,104.5,0,22.5,0,0,0,0);
drawCalvesBack({s2:-5,t2:7.5})
for (let i=0;i<calves/1.5;i++){
    drawCalvesBack({x1:50,s2:-5+i,delta:[0,0]},"next")
}
drawCalvesBack({x1:57,x2:1,s2:-5,t2:7.5},true)
for (let i=0;i<calves/1.5;i++){
    drawCalvesBack({x1:57,s2:-5+i,delta:[0,0]},"next")
}
drawCalvesBack({x1:71.5,y2:17+calves/5,x2:0,s2:-calves/4,t2:10},"reset")
for (let i=0;i<calves/1.5;i++){
    drawCalvesBack({x1:71.5,s2:-calves/4+i,delta:[0,0]},"next")
}
drawCalvesBack({x1:77.5,y1:108-calves/5,y2:17+calves/5,x2:1,s2:calves/4,t2:10},"reset")
for (let i=0;i<calves/1.5;i++){
    drawCalvesBack({x1:78.5,s2:calves/4-i,delta:[0,0]},"next")
}
//lines
let drawFeet = defineVars(createDesign,[frontView],{"stroke":"black",fill:"transparent"},"",52,137,-7.5,5,0,0,0,0);
drawFeet({s1:-5,t1:5,s2:-7.5,t2:5})
drawFeet({x2:-1})
drawFeet({x1:42.5 ,y1:147,x2:12.5,y2:-10,t2:2.5,s2:15,s1:18,t1:-10},"reset")
drawFeet({x1:71.5,x2:5,y2:7.5,t2:2.5}, "reset")
drawFeet({y2:3,s2:-3})
drawFeet({x2:6, y2:10},"rev")

let drawFeetBack = defineVars(createDesign,[backView],"","",52,135,-9,0,0,0,0,0);
drawFeetBack({s2:-5, t2:-5})
drawFeetBack({x1:55,y1:135,x2:12,y2:0,t2:-12}, "rev")
drawFeetBack({x1:85,y1:138, s2:-5, t2:-5},"reset")
drawFeetBack({x1:85,y1:138,x2:13,y2:1,s2:20, t2:-10, t1:0}, "rev");

controls.addEventListener("click",(e)=> {
    if(e.target.nodeName === "circle"){
        [...e.target.parentNode.children].filter(el => el !== e.target).forEach(elm => elm.setAttribute("fill","white"));
        e.target.setAttribute("fill","black");
        if(e.target.getAttribute("cx") === "0"){
            frontView.classList = [];
            backView.classList[0] !== "hide" ? backView.classList.toggle("hide") : "";
        }
        else if(e.target.getAttribute("cx")*1 > 0){
            backView.classList = [];
            frontView.classList[0] !== "hide" ? frontView.classList.toggle("hide") : "";
        }
    }
})
}

function createDesign(parent,options,id,x,y,w,h,...pts){
        let frag = document.createElementNS(url,"path");
        let d = !pts[4] ? `M ${x} ${y} c ${pts[0]} ${pts[1]}, ${pts[2]} ${pts[3]}, ${w} ${h}` : `M ${x} ${y} c ${pts[0]} ${pts[1]}, ${pts[2]} ${pts[3]}, ${w} ${h} ${pts[4]}`;
        frag.setAttribute("d", d);
        frag.dataset.name = id;
        let attributes = Object.keys(options);
        if (attributes.length && !Array.isArray(options)){
            attributes.forEach(attr => {
                frag.setAttribute(attr,options[attr]) 
            })
        }
        else{
            frag.setAttribute("stroke", "black");
            frag.setAttribute("stroke-width", "1");
            frag.setAttribute("fill","transparent");
        }
    !Array.isArray(parent)? parent.append(frag) : parent.forEach(p => p.append(frag.cloneNode(true)));
        
}

function defineVars(fn,parent,options,id,...params){
    let [x,y,w,h,a,b,c,d] = params ;
    return ({x1,y1,x2,y2,s1,t1,s2,t2,z,delta},bool) => {
        let points = [x1,y1,x2,y2,s1,t1,s2,t2].filter(e => e);
        if(points.length){
            [x,y,w,h,a,b,c,d] = [x1??x,y1??y,x2??w,y2??h,s1??a,t1??b,s2??c,t2??d];
        }
        let temp = [];
        if (bool === true){
            temp.push (x-w,y-h)
        }
        if (bool === "rev"){
            temp.push (x,y,-w,-h,-a,-b,-c,-d)
        }
        if(bool==="reset"){
            [x,y,w,h,a,b,c,d] = params;
            [x,y,w,h,a,b,c,d] = [x1??x,y1??y,x2??w,y2??h,s1??a,t1??b,s2??c,t2??d];
        }
        if(bool==="next"){
            temp.push(x-w+delta[0]||0,y-h+delta[1]||0) ; 
        }
        x = temp?.[0] || (x1? x1 : x) ;
        y = temp?.[1] || (y1 ? y1 : y) ;
        w = temp?.[2] || (x2 ? x2 : w) ;
        h = temp?.[3] || (y2 ? y2 : h) ;
        a = temp?.[4] || a ;
        b = temp?.[5] || b ;
        c = temp?.[6] || c ;
        d = temp?.[7] || d ;
        fn.call(this,parent,options,id,x,y,w,h,a,b,c,d,z)
        x = x+w;
        y = y+h;
    }
}


const statsWebGraph = (container,array,title,unit="%") => {
    const createMarker = (textX) => {
        let valX = 0;
        let valY = 0;
        for (i=30; i<=Math.floor(width/displayFactor*(textX.length-1)+30);i+=Math.floor(width/displayFactor)){ // hardcoded number accomodates equal number of dates on x-axis. Need to change it to be dynamic for day, week, and month view 
            cloneText.append(textX[valX++]);
            chart.append(cloneMarkerLineX,cloneText)
        }
    }   
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    const webContainer = document.createElementNS(url,"svg");
    webContainer.setAttribute("width","100%");
    // webContainer.setAttribute("height","100%");
    webContainer.setAttribute("viewBox","0 0 125 150");
    let labels = array.map(arr => arr[0]);
    let values = array.map(arr => arr[1]).map(e => e);   
    let points;
    let text = document.createElementNS(url,"text");    
    let center = [50,80];
    let lineEl = document.createElementNS(url,"path");
    let n = array.length;
    const drawShape = (startpts,len,vertices,angle=0) => {
        let x  = startpts[0];
        let y  = startpts[1];
        points = `M ${Math.round(x+(len+values[n-1])*Math.sin(angle))} ${Math.round(y-(len+values[n-1])*Math.cos(angle))}` ;
        let delta = 2*Math.PI/vertices;
        for (let i=1; i<vertices; i++){    
            angle += delta;
            points = points + ` L ${Math.round(x+(len+values[i-1])*Math.sin(angle))} ${Math.round(y-(len+values[i-1])*Math.cos(angle))}`;
        }
        points = points + ` Z` ; 
        lineEl.setAttribute("d",points);
        lineEl.setAttribute("stroke","black");
        lineEl.setAttribute("stroke-width", "1");
        lineEl.setAttribute("fill", "transparent");
        webContainer.append(lineEl);
    }
    drawShape(center,25,n)
    // let d = `M ${x-values[7]} ${y} L ${x} ${y-5-values[0]} L ${x+5+values[1]} ${y-10-values[1]} L ${x+11+values[2]} ${y-10+values[2]} L ${x+16+values[3]} ${y-5+values[3]} L ${x+16+values[4]} ${y+values[4]} L ${x+11-values[5]} ${y+5+values[5]} L ${x+5-values[6]} ${y+5+values[6]} L ${x-values[7]} ${y}`;
    // let d = `M ${x-values[7]} ${y+values[7]} L ${x-values[0]} ${y-5-values[0]} L ${x+5+values[1]} ${y-10-values[1]} L ${x+11+values[2]} ${y-10} L ${x+16+values[3]} ${y-5+values[3]} L ${x+16+values[4]} ${y+values[4]} L ${x+11} ${y+5+values[5]} L ${x+5} ${y+5+values[6]} L ${x-values[7]} ${y+values[7]}`;
    
    for (let i=0; i<10; i++){
        let pathClone = lineEl.cloneNode(true);
        pathClone.setAttribute("transform",`scale(${1-i/10})`)
        pathClone.setAttribute("transform-origin",`50 80`)     
        webContainer.append(pathClone);
    }
    
    let labelCoords = points.split("L").slice(1)
    labelCoords.push(` ${center[0]+(25+values[n-1])*Math.sin(0)} ${center[1]-(25+values[n-1])*Math.cos(0)} `);
    let i=0;
    for (let el of labelCoords){
        let cloneText = text.cloneNode(true);
        let [x,y] = el.split(" ").filter(e => e);
        cloneText.append(`${labels[i]}, ${values[i++]}${unit}`) 
        cloneText.setAttribute("x", x-7);
        cloneText.setAttribute("y", y);
        cloneText.setAttribute("fill", "white");
        webContainer.append(cloneText);
    }
    fieldset.append(webContainer)
    fieldset.append(legend)
    container.lastElementChild.before(fieldset);
    legend.textContent = title;
    // webContainer.setAttribute("height", container.lastElementChild?.getBBox().height*4)
}

const addScroll = (controlArea, array) => {
    const svgarea = document.createElementNS(url,"svg");
    svgarea.setAttribute("viewBox", "-45 0 100 10")
    const controls = svgarea.cloneNode(true);
    const circle = document.createElementNS(url,"circle");
        circle.setAttribute("r", "1");
        circle.setAttribute("cy", "5");
        circle.setAttribute("stroke-width", "0.5");
        circle.setAttribute("fill", "white");
    for (let el of array){
        let i = array.findIndex(e => e===el );
        const c1 = circle.cloneNode(true);
        c1.setAttribute("cx", `${c1.getAttribute("r")*3*i}`);
        i===0 ? c1.setAttribute("fill", "black") : c1.setAttribute("fill", "white");
        c1.id = el.lastElementChild.textContent;
        c1.addEventListener("click",(e)=>{
            let allElem = [...controlArea.parentElement.children];
            let scrollArea = allElem.pop();
            let targetEl = allElem.find(c => c.lastElementChild.textContent === e.target.id);
            allElem.forEach(f => f!==targetEl ? f.style.display = "none" : f.style.display = "block");
            [...scrollArea.firstElementChild.children].forEach(s => s!==e.target ? s.setAttribute("fill","white") : s.setAttribute("fill","black"));
        })
        controls.append(c1);
    }
    controlArea.append(controls);
}