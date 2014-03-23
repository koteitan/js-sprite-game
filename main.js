/*----------------------------------
  4dsoko_main.js
  main program and entry point
----------------------------------*/
// static var on game
var isDebug1=1; //debug flag
var isDebug2=0; //debug flag
var mmax = 8; //length of edge of the world (common for dimensions)
// dinamic var on game
var mode=0; /* 0:play mode. 1:edit mode.*/
var chara = function(){};
var map = function(){};
map.size = [36,36];
map.map = new Array(map);
for(var x=0;x<map.size[0];x++){
  map.map[x]=new Array(map.size[1]);
  for(y in map.map[x]) map.map[x][y]=map.blank;
}
map.blank = 0;
map.wall  = 1;
var player = function(){}; // const for player
player.pos = [0,0];// position of player
var shiphones = 2;
var siphoneList = [];
var sprite; // sprite object
var chsize; // charactor size (unit is pixcels)

var leftTask=0; // number of left box (or goal)
var gameState = "userinput"; 

var input = function(){};
input.type = "none";
input.move = [0,0];

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
    var next = [player.pos[0]+input.move[0], player.pos[1]+input.move[1]];
    if(map.map[next[0]][next[1]]==map.blank){
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
  chara.blank     = sprite.addChara([chsize[0]*0, 0], [chsize[0], chsize[1]], 1, "blank");
  chara.wall      = sprite.addChara([chsize[0]*1, 0], [chsize[0], chsize[1]], 1, "wall");
  chara.player = new Array(3);
  chara.player[0] = sprite.addChara([chsize[0]*2, 0], [chsize[0], chsize[1]], 1, "player3");
  chara.player[1] = sprite.addChara([chsize[0]*3, 0], [chsize[0], chsize[1]], 1, "player2");
  chara.player[2] = sprite.addChara([chsize[0]*4, 0], [chsize[0], chsize[1]], 1, "player1");
  chara.siphon    = sprite.addChara([chsize[0]*5, 0], [chsize[0], chsize[1]], 3, "siphon");
  
  //games
  //background
  for(var x=0;x<map.size[0];x++){
    for(var y=0;y<map.size[1];y++){
      if(Math.random()>1/16) map.map[x][y] = map.blank;
                       else map.map[x][y] = map.wall;
    }
  }
  //siphone
  var initSiphones = 2;
  for(var i=0; i<shiphones;i++){
    siphoneList.push({"pos":
      [
        Math.floor(Math.random()*map.size[0]),
        Math.floor(Math.random()*map.size[1])
        ]
    });
    /* 重なったら壁を除去 */
    map.map[siphoneList[i].pos[0]][siphoneList[i].pos[1]] = 0;
  }
  map.sprite    = sprite.addBg(map.map, chsize, [0,0,0], "");
  player.sprite = sprite.addSprite(chara.player[0], [player.pos[0]*chsize[0], player.pos[1]*chsize[1], 1],"player");
  for(var i=0; i<shiphones;i++){
    siphoneList[i].sprite 
      = sprite.addSprite(chara.siphon, 
      [siphoneList[i].pos[0]*chsize[0],
       siphoneList[i].pos[1]*chsize[1], 2],"siphone");
  }
}
/*-----------------------------------
  draw graphic routine.
-----------------------------------*/
var procDraw = function(){
  //clear ---------
  ctx[0].clearRect(0, 0, canvas[0].width-1, canvas[0].height-1);
  //sprites -----------
  player.sprite.dstpos[0] = player.pos[0]*chsize[0];
  player.sprite.dstpos[1] = player.pos[1]*chsize[1];
  sprite.drawAll(ctx[0]);
  //border all ---------
  ctx[0].strokeStyle='rgb(255,2,0)';
  ctx[0].strokeWeight='1';
  if(isDragging){
    ctx[0].strokeStyle='rgb(255,255,2)';
  }
  ctx[0].strokeRect(0, 0, canvas[0].width-1, canvas[0].height-1);
}


//event handlers after queue ------------
var handleMouseUp = function(){
  if(gameState=="userinput"){
    var d  = [mouseUpPos[0]-mouseDownPos[0], mouseUpPos[1]-mouseDownPos[1]];
    var r2 = d[0]*d[0]+d[1]*d[1];
    if(r2>12*12){
      if(Math.abs(d[0])>Math.abs(d[1])){
        input.type = "move";
        input.move[0] = (d[0]<0)? -1:+1;
        input.move[1] = 0;
        gameState = "usermotion";
      }else{
        input.type = "move";
        input.move[0] = 0;
        input.move[1] = (d[1]<0)? -1:+1;
        gameState = "usermotion";
      }
    }
  }
}
var handleKeyDown = function(e){
  // play
  var c = String.fromCharCode(e.keyCode);
  var motion = "AWDX".indexOf(c);
    var motiondiff = [
    //a  w  d  x  
    [-1, 0, +1, 0], //x
    [ 0,-1, 0, +1], //y
  ];
  if(motion>=0){
    if(gameState=="userinput"){
      input.type = "move";
      input.move[0] = motiondiff[0][motion];
      input.move[1] = motiondiff[1][motion];
      gameState = "usermotion";
    }
    e.preventDefault();
  }
}
