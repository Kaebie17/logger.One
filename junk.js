let neckflexors = iterate(createDesign,[frontView],{fill:color},59,7,3,12.5,0,0,0,0)
neckflexors({s2:1,t2:15})
neckflexors({},"rev")
neckflexors({x1:70,y1:6,x2:-3,y2:12.5,s2:-1,t2:15})
neckflexors({},"rev")

let neckflexorsB = iterate(createDesign,[backView],{fill:color},59,7,2,7.5,0,0,0,0)
neckflexorsB({s2:-1,t2:10})
neckflexorsB({},"rev")
neckflexorsB({x1:70,y1:6,x2:-2,y2:7.5,s2:1,t2:10})
neckflexorsB({},"rev")

let trapsShade = iterate(createDesign,[frontView,backView],{"fill":color},59,13.5,-5,1,0,0,0,0);
trapsShade({x1:58.5,y1:15.5,t2:-traps});
trapsShade({x1:70, y1:15.5, y2:0, t2:traps}, "rev");

let trapsUpperBack = iterate(createDesign,[backView],{"fill":color},59,16,6,3,0,0,0,0);  
trapsUpperBack({s2:-5,t2:5,s1:-6})
trapsUpperBack({x1:70,x2:-6,s2:5,t2:5,s1:6},"reset")
trapsUpperBack({x1:67.5,y1:7,x2:0,y2:10,s1:-3,t1:-5,s2:-5,t2:16},"reset")
trapsUpperBack({x1:61.5,y1:7,s1:3,t1:-5,s2:5,t2:16})

let trapsBack = iterate(createDesign,[backView],{fill:color},81,17,-16,5,0,0,0,0);
trapsBack({t2:55,s2:-27.5})
trapsBack({x1:63,x2:16,y2:2,t2:47,s2:14.5},true)

let upperPecs = iterate(createDesign,[frontView],{fill:color},58,17.5,-22.5,10,0,0,0,0);
upperPecs({t1:7.5,s2:25})
upperPecs({s2:10,t1:2.5},"rev")
upperPecs({x1:65,y1:21.5,x2:25,y2:-5,t1:-5,s1:10,s2:-5,t2:-5},"reset")
upperPecs({s2:-7.5,t2:0},"rev")

let lowerPecs = iterate(createDesign,[frontView],{fill:color},64,21.5,-20.5,4,0,0,0,0);
lowerPecs({s1:chest/5,t1:chest/3,t2:chest/2,s2:-chest/1.5})
// lowerPecs({x1:45,y1:26,y2:4,t1:-0,t2:-8},"rev")
lowerPecs({x1:65.5,x2:20,y2:-2.5,s1:-chest/5,t1:chest/3,t2:chest/3,s2:chest/2},"reset")
// lowerPecs({x1:85, y1:19,y2:-3,t1:-chest/5,t2:-15,s2:-5},"rev")

let antDelts = iterate(createDesign,[frontView],{fill:color},50,15,-15,10,0,0,0,0);
antDelts({s2:shoulders/1.5})
antDelts({x1:75,y1:16.5,x2:12.5,y2:-1,s2:-10,t2:-2,t1:-2.5},"reset")
antDelts({t1:-1},"rev")


let latDeltsF = iterate(createDesign,[frontView],{fill:color},47,16.5,-13,9,0,0,0,0);
latDeltsF({s2:-shoulders/2.5})
latDeltsF({x1:76.5,y1:14.5,y2:-1,s2:-shoulders/5, t2:shoulders/7.5},"rev")

let latDeltsBack = iterate(createDesign,[backView],{fill:color},53,15.5,-17.5,9,0,0,0,0);
latDeltsBack({s2:-shoulders/2})
latDeltsBack({},"rev")
latDeltsBack({x1:90.5,y1:18.5,x2:-15,y2:-1,s2:-shoulders/3, t2:-shoulders/2},"reset")

// let abcd = iterate(createDesign,[backView],{fill:color},84,48.5,-17.5,9,0,0,0,0);
// abcd({s2:-40,t2:10,z:"z"})
// rearDs({t1:5},"rev")
// rearDs({x1:63,y1:17,x2:12.5,y2:1,s1:0,t1:5,s2:-2,t2:5},false)
// rearDs({x1:63,y1:24.75,y2:-2.75,s2:5},false)

let drawTrisFront = iterate(createDesign,[frontView,backView],{fill:color},37,27,-14,17.5,0,0,0,0)
drawTrisFront({s1: -arms/2, s2:-5, t2:arms/4})
drawTrisFront({x1:86,y1:22,x2:25,y2:1,s2:2.5,t2:arms/1.5}, "reset")

let drawBisFront = iterate(createDesign,[frontView,backView],{fill:color},37,27,-16,15,0,0,0,0)
drawBisFront({x1: 27, y1: 42.5,t1:arms/2, s2: -arms/2, t2:-arms/2},"rev")
drawBisFront({s2: arms/10},"rev");
drawBisFront({x1:90,y1:21,x2:15,y2:1,s2:10,t2:-arms/1.25}, "reset")

let drawForearm1 = iterate(createDesign,[frontView,backView],{fill:color},20,44,20,15.5,0,0,0,0);
drawForearm1({s2:-5,t2:forearm/3,t1:5,s1:5})
drawForearm1({x1: 109,y1:22.5, x2: 0, y2: 20,s2:-5,t2:-forearm/3}, "rev")
drawForearm1({},"rev")

let drawforearms2 = iterate(createDesign,[frontView,backView],{fill:color},24,46,10,8,0,0,0,0);
drawforearms2({s2:5,t2:-forearm/2})
drawforearms2({x1: 106, y1:18, x2: -2, y2:-12.5, s2:-forearm/5}, "reset")
drawforearms2({},"rev")

let latsBack = iterate(createDesign,[backView],{fill:color},81,25,-17.5,17.5,0,0,0,0);
latsBack({t2:20,s2:0,s1:chest-40,t1:15})
latsBack({x1:44,y1:27,x2:16.5,y2:16.5,t2:20,s2:0,s1:-chest+40,t1:15},)
latsBack({x1:78,y1:42,x2:-15,y2:1,t2:40,s2:-chest/3,s1:chest-45},"reset")
latsBack({x1:60,y1:44,x2:15,y2:1,t2:37.5,s2:chest/3,s1:-chest+45},true)

let lowback = iterate(createDesign,[backView],{fill:color},60,55,2.5,10,0,0,0,0);
lowback({s2:10})
lowback({},"rev")

let drawHandles = iterate(createDesign,[frontView],{fill:color},45,57,7.5,10,0,0,0,0);
drawHandles({s2:-fat/4})
drawHandles({s2:-10},"rev")
drawHandles({x1:80,x2:-7.5,s2:fat/4},"reset")
drawHandles({s2:10},"rev")

let hamsfibers = iterate(createDesign,[backView],{fill:color},80,81,4,22.5,0,0,0,0) 
hamsfibers({s2:thighs/3,t2:15})
for (let i=0;i<6;i++){
    hamsfibers({x1:84-i,s1:-2,t1:2.5,s2:2,t2:20},true)

}
hamsfibers({x1:73,y1:105,x2:0,y2:25,s2:5,t2:25,s1:2,t1:2.5},true)
for(let i=0;i<4;i++){
    hamsfibers({x1:72-i,y1:105-(i+i+1),y2:25-(i+i+1),s2:0,s2:2},true)
}
hamsfibers({x1:66,y1:94.5,x2:0,y2:15,s2:-thighs/20,t2:15,s1:-2,t1:0},true)


// hamsfibers({x1:71,x2:-4,y2:12.5,s2:-thighs/20,t2:10},"reset")
// hamsfibers({x1:70.5,x2:-4,y2:11.5,s2:-thighs/20,t2:9},"reset")
// hamsfibers({x1:70,x2:-4,y2:10.5,s2:-thighs/20,t2:8},"reset")
// hamsfibers({x1:69.5,y1:79.5,x2:-3.5,y2:10,s2:-thighs/20,t2:5},"reset")
// hamsfibers({x1:69,y1:79,x2:-3,y2:9.5,s2:-thighs/20,t2:7},"reset")
// hamsfibers({x1:68.5,y1:78.5,x2:-3,y2:9.5,s2:-thighs/20,t2:8},"reset")
// hamsfibers({x1:68,y1:78.5,x2:-2.5,y2:8.5,s2:-thighs/20,t2:8},"reset")
// hamsfibers({x1:68,y1:78.5,x2:-2,y2:6.5,s2:-thighs/5,t2:10},"reset")
// hamsfibers({x1:67.5,y1:78,x2:-2,y2:6.5,s2:-thighs/5,t2:9},"reset")
// hamsfibers({x1:67,y1:78,x2:-2,y2:5,s2:-thighs/5,t2:7},"reset")
// hamsfibers({x1:67,y1:78,x2:0,y2:3,s2:-thighs/3,t2:-5},"reset")


let gluteusMinor = iterate(createDesign,[backView],{fill:color},80,64,2.5,7,0,0,0,0);
gluteusMinor({s2:-25})
gluteusMinor({x1:42,x2:-2.5,s2:25},true)

let gluteusMajor = iterate(createDesign,[backView],{fill:color},70,64,11,17.5,0,0,0,0);
gluteusMajor({s2:-22,t2:15})
gluteusMajor({x1:42,x2:-12,s2:22,t2:15},true)

let drawAbsleft = iterate(createDesign,[frontView],{fill:color},57,35,5,8,0,0,0,0);
drawAbsleft({s2:10,t2:-5})
drawAbsleft({x1:62},"rev")
drawAbsleft({y1:45.5,y2:5, s2:10,t2:-5},"reset")
drawAbsleft({x1:62},"rev")
drawAbsleft({y1:53.5,y2:3, s2:10,t2:-5},"reset")
drawAbsleft({x1:62},"rev")
drawAbsleft({x1:55,y1:60,x2:7.5,y2:10.5,s2:10,t2:-7.5},"reset")
drawAbsleft({x1:62,y2:10,s2:2.5,t2:0},"rev")
let drawAbsRight = iterate(createDesign,[frontView],{fill:color},65,35,5,8,0,0,0,0);
drawAbsRight({s2:10,t2:-5})
drawAbsRight({x1:70},"rev")
drawAbsRight({y1:45.5,y2:5, s2:10,t2:-5},"reset")
drawAbsRight({x1:70},"rev")
drawAbsRight({y1:53.5,y2:3, s2:10,t2:-5},"reset")
drawAbsRight({x1:70},"rev")
drawAbsRight({x1:71,y1:60,x2:-7.5,y2:10.5,s2:-10,t2:-7.5},"reset")
drawAbsRight({x1:71,y1:61,x2:7.5,y2:-10.5,s2:-1.5,t2:0},"rev")

let drawObliques =  iterate(createDesign,[frontView],{fill:color},45,36,8.5,25,0,0,0,0);
drawObliques({s1:15,t1:10})
drawObliques({},"rev")
drawObliques({x1:80,x2:-8.5, s1:-15,t1:10},"reset")
drawObliques({},"rev")