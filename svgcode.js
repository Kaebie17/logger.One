const url = "http://www.w3.org/2000/svg"

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

// let dim = []
// function dimF(x,y,r,n,angle=0){
//     // dim.push([x,y]);
//     for (let i=0;i<n;i++){
//     angle += 2*Math.PI/n;
//     dim.push([x + r*Math.sin(angle), y - r*Math.cos(angle)]);
// }
// }
// dimF(80,300,50,4,90);
// // dim = dim.map((el,i) => i===0? el : i%2!==0 ? el.concat(dim[i+1]) : "").filter(ar => ar!=="");
// let dd = dim.map( (ar,i) => { ar = ar.map(e => `${Math.round(parseInt(e))}`); return i===0 ? "M"+ ar.join() : "L"+ ar.join()}).join(' ')+" Z"

// let test = document.createElementNS(url,"path");

// test.setAttribute("d",dd);
// test.setAttribute("stroke","black");
// test.setAttribute("fill","white")

// frontsvg.append(test)

