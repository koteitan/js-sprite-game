/*----------------------------------
  4dsoko_main.js
  main program and entry point
----------------------------------*/
// static var on game
var dims=4;
var isDebug1=1; //debug flag
var isDebug2=0; //debug flag
var mmax = 8; //length of edge of the world (common for dimensions)
// dinamic var on game
var mode=0; /* 0:play mode. 1:edit mode.*/
var chara = function(){};
var map = function(){};
map.size = [6,6,6,6];
map.map = Array.zeros(map.size);
map.blank = 0;
map.wall  = 1;
var player = function(){}; // const for player
player.pos = Array.zeros([dims]);// position of player
var shiphones = 2;
var siphoneList = [];
var sprite; // sprite object
var chsize; // charactor size (unit is pixcels)

var leftTask=0; // number of left box (or goal)
var gameState = "userinput"; 

var input = function(){};
input.type = "none";
input.move = Array.zeros([dims]);

//ENTRY POINT --------------------------
window.onload=function(){
  initGui();
  initEvent();
  initGame();
  setInterval(procAll, 1000/frameRate); // main loop
}
//MAIN LOOP ------------------------
var procAll=function(){
  switch(gameState){
    case "userinput":
    break;
    case "usermotion":
    var next = player.pos.clone();
    var isFail = false;
    for(var d=0;d<dims;d++){
      next[d]+=input.move[d];
      if(!(0<=next[d] && next[d]<map.size[d])){
        isFail = true;
        break;
      }
    };
    if(isFail || map.map.at(next)!=map.blank){
      isFail = true;
    }
    if(!isFail){
      player.pos = next;
      isRequestedDraw = true;
    }
    gameState = "userinput";
    break;
  }
  if(isRequestedDraw){
    procDraw();
    isRequestedDraw = false;
  }
  procEvent();
}
//var for gui ----------------------------
var canvases = 1;
var canvas = new Array(canvases);
var ctx    = new Array(canvases);
var isRequestedDraw = true;
var frameRate;
frameRate = 60; // [fps]

var debugout;
var isKeyTyping;
//initialize -----------
//gui
var initGui=function(){
  for(var i=0;i<canvases;i++){
    canvas[i] = document.getElementById("canvas"+i);
    if(!canvas[i]||!canvas[i].getContext) return false;
    ctx[i] = canvas[i].getContext('2d');
  }
  isKeyTyping = false;
} 
//game
var initGame=function(){
  //graphics
  sprite = new Sprite("spritesheet.png");
  chsize = [8,8];
  chara.blank     = sprite.addChara(
    [chsize[0]*0, 0], [chsize[0], chsize[1]], 1, "blank");
  chara.wall      = sprite.addChara(
    [chsize[0]*1, 0], [chsize[0], chsize[1]], 1, "wall");
  chara.player = new Array(3);
  chara.player[0] = sprite.addChara(
    [chsize[0]*2, 0], [chsize[0], chsize[1]], 1, "player3");
  chara.player[1] = sprite.addChara(
    [chsize[0]*3, 0], [chsize[0], chsize[1]], 1, "player2");
  chara.player[2] = sprite.addChara(
    [chsize[0]*4, 0], [chsize[0], chsize[1]], 1, "player1");
  chara.siphon    = sprite.addChara(
    [chsize[0]*5, 0], [chsize[0], chsize[1]], 3, "siphon");
  
  //games
  //map
  for(var w=0;w<map.size[0];w++){
    for(var z=0;z<map.size[1];z++){
      for(var y=0;y<map.size[2];y++){
        for(var x=0;x<map.size[3];x++){
          if(Math.random()>1/16) map.map[w][z][y][x] = map.blank;
            else map.map[w][z][y][x] = map.wall;
        }
      }
    }
  }
  //siphone
  var initSiphones = 2;
  for(var i=0; i<shiphones;i++){
    siphoneList.push({"pos":
      [
        Math.floor(Math.random()*map.size[0]),
        Math.floor(Math.random()*map.size[1]),
        Math.floor(Math.random()*map.size[2]),
        Math.floor(Math.random()*map.size[3])
        ]
    });
    /* remove wall when siphone */
    map.map[siphoneList[i].pos[0]][siphoneList[i].pos[1]]
           [siphoneList[i].pos[2]][siphoneList[i].pos[3]]= 0;
  }
    
  map.sprite    = sprite.addBg(map.map, chsize, [0,0,0], "bg");
  player.sprite = sprite.addSprite(chara.player[0],
    player.pos.concat(1), "player");
  for(var i=0; i<shiphones;i++){
    siphoneList[i].sprite = sprite.addSprite(chara.siphon, 
      siphoneList[i].pos.concat(2), "siphone");
  }
}
Array.prototype.to2d = function(){
  return [(this[0]*map.size[1] + this[2])*chsize[0],
          (this[1]*map.size[2] + this[3])*chsize[1]];
}
/* draw map and sprite ------------------------
in:
 chid = Charactor ID
 pos  = [x,y,z] = drown position:
  x,y (unit = pixels)
  z   (unit = layers)
 -----------------------------------------*/
Sprite.prototype.drawAll4d = function(ctx){
  var animesLcm = 1;
  for(var i=0;i<this.charaList.length;i++){
    animesLcm = lcm(this.charaList[i].animes, animesLcm);
  }
  var sorted = this.spriteList.sort(function(a,b){
    return a.dstpos[4]-b.dstpos[4]});
  for(var i=0;i<sorted.length;i++){
    var sp = sorted[i];
    switch(sp.type){
      case "sprite":/*----------------------------------------*/
        var sp_dstpos_2d = sp.dstpos.to2d();
        if(sp.name=="player"){
          var a=1;
        }
        ctx.drawImage(this.sheet, 
          sp.ch.srcpos[0], sp.ch.srcpos[1], 
          sp.ch.size  [0], sp.ch.size  [1],
          sp_dstpos_2d[0], sp_dstpos_2d[1],
          sp.ch.size  [0], sp.ch.size  [1]);
      break;
      case "bg": /*----------------------------------------*/
        for(var w=0; w<sp.map.length;w++){
          for(var z=0; z<sp.map[w].length;z++){
            for(var y=0; y<sp.map[w][z].length;y++){
              for(var x=0; x<sp.map[w][z][y].length;x++){
                var ch = this.charaList[sp.map[w][z][y][x]];
                  ctx.drawImage(this.sheet, 
                    ch.srcpos[0], ch.srcpos[1], 
                    ch.size  [0], ch.size  [1],
                    sp.dstpos[1]+(y+w*map.size[3])*sp.chsize[1],
                    sp.dstpos[0]+(x+z*map.size[2])*sp.chsize[0],
                    ch.size[0]  , ch.size[1]);
              }
            }
          }
        }
      break;
      default:/*----------------------------------------*/
      break;
    }//switch
  }//for i
};
/*-----------------------------------
  draw graphic routine.
-----------------------------------*/
var procDraw = function(){
  //clear ---------
  ctx[0].clearRect(0, 0, canvas[0].width-1, canvas[0].height-1);
  //sprites -----------
  player.sprite.dstpos = player.pos;
  sprite.drawAll4d(ctx[0]);
  //border ---------
  ctx[0].strokeStyle='rgb(255,2,0)';
  ctx[0].strokeWeight='1';
  for(var w=0;w<map.size[0];w++){
    for(var z=0;z<map.size[1];z++){
      ctx[0].strokeRect(
        w          *map.size[2]*chsize[0], 
        z          *map.size[3]*chsize[1], 
        map.size[2]*chsize[0],
        map.size[3]*chsize[1]);
    }
  }
}


//event handlers after queue ------------
var handleMouseUp = function(){
  if(gameState=="userinput"){
    var d  = [mouseUpPos[0]-mouseDownPos[0], 
              mouseUpPos[1]-mouseDownPos[1]];
    var r2 = d[0]*d[0]+d[1]*d[1];
    if(r2>12*12){
      if(Math.abs(d[0])>Math.abs(d[1])){
        input.type = "move";
        input.move = [0, 0, (d[0]<0)? -1:+1, 0];
        gameState = "usermotion";
      }else{
        input.type = "move";
        input.move = [0, 0, 0, (d[0]<0)? -1:+1];
        gameState = "usermotion";
      }
    }
  }
}
var handleKeyDown = function(e){
  // play
    var c = String.fromCharCode(e.keyCode);
    var motion = "AW__DX__".indexOf(c);
    if(motion<0) return;
    if(e.shiftKey) motion+=2;
    var motiondiff = [
    //a  w  A  W  d  x  D  X
    [ 0, 0,-1, 0, 0, 0,+1, 0], //w
    [ 0, 0, 0,-1, 0, 0, 0,+1], //z
    [-1, 0, 0, 0,+1, 0, 0, 0], //y
    [ 0,-1, 0, 0, 0,+1, 0, 0], //x
  ];
  if(motion>=0){
    if(gameState=="userinput"){
      input.type = "move";
      for(var d=0;d<dims;d++) input.move[d] = motiondiff[d][motion];
      gameState = "usermotion";
    }
    e.preventDefault();
  }
}
