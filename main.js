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
var shiphones;
var siphoneList = [];
var sprite; // sprite object
var chsize; // charactor size (unit is pixcels)
var leftTask=0; // number of left box (or goal)
var gameState = "initializing";
var input = function(){};
input.type = "none";
input.move = Array.zeros([dims]);
var enemy;
var enemies;
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
    case "waitimage":
    if(sprite.sheet.complete){
      gameState = "userinput";
      isRequestedDraw = true;
    }
    break;
    case "userinput":
      sprite.incAnime(1/20);
      isRequestedDraw = true;
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
    gameState = "enemymotion";
    break;
    case "enemymotion":
    makeEnemyMotion();
    gameState = "userinput";
    isRequestedDraw = true;
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
  //-------------------------------
  //graphics
  //-------------------------------
  sprite = new Sprite("spritesheet.png");
  chsize = [8,8];
  chara.blank     = sprite.addChara(
    [chsize[0]*0, 0], chsize, 1, "blank");
  chara.wall      = sprite.addChara(
    [chsize[0]*1, 0], chsize, 1, "wall");
  chara.player = new Array(3);
  chara.player[0] = sprite.addChara(
    [chsize[0]*2, 0], chsize, 1, "player.hp3");
  chara.player[1] = sprite.addChara(
    [chsize[0]*3, 0], chsize, 1, "player.hp2");
  chara.player[2] = sprite.addChara(
    [chsize[0]*4, 0], chsize, 1, "player.hp1");
  chara.siphon    = sprite.addChara(
    [chsize[0]*5, 0], chsize, 3, "siphon");
  //enemies----------------
  chara.enemies = 4;
  enemyindex = function(){};
  enemyindex.lap = 0;
  enemyindex.virus = 1;
  enemyindex.daemon = 2;
  enemyindex.crypt = 3;
  chara.enemy = new Array(chara.enemies);  
  //enemies lap ----------------
  chara.enemy[0] = new Array(2);
  chara.enemy[0][0] = sprite.addChara(
    [chsize[0]*0, chsize[0]*1],chsize, 2, "lap.hp2");
  chara.enemy[0][1] = sprite.addChara(
    [chsize[0]*2, chsize[0]*1],chsize, 2, "lap.hp1");
  //enemies virus ----------------
  chara.enemy[1] = new Array(2);
  chara.enemy[1][0] = sprite.addChara(
    [chsize[0]*4,chsize[0]*1],chsize, 2, "virus.hp2");
  chara.enemy[1][1] = sprite.addChara(
    [chsize[0]*6,chsize[0]*1],chsize, 2, "virus.hp1");
  //enemies daemon ----------------
  chara.enemy[2] = new Array(3);
  chara.enemy[2][0] = sprite.addChara(
    [chsize[0]*0,chsize[0]*2],chsize, 2, "daemon.hp3");
  chara.enemy[2][1] = sprite.addChara(
    [chsize[0]*2,chsize[0]*2],chsize, 2, "daemon.hp2");
  chara.enemy[2][2] = sprite.addChara(
    [chsize[0]*4,chsize[0]*2],chsize, 2, "daemon.hp1");
  //enemies crypt ----------------
  chara.enemy[3] = new Array(3);
  chara.enemy[3][0] = sprite.addChara(
    [chsize[0]*0,chsize[0]*3],chsize, 2, "crypt.hp2");
  chara.enemy[3][1] = sprite.addChara(
    [chsize[0]*2,chsize[0]*3],chsize, 2, "crypt.hp1");
  chara.enemy[3][2] = sprite.addChara(
    [chsize[0]*4,chsize[0]*3],chsize, 1, "crypt.hidden");
  //-------------------------------
  //map
  //-------------------------------
  var blanklist = new Array(map.size.prod());
  var bi=0;
  for(var x=0;x<map.size[0];x++){
    for(var y=0;y<map.size[1];y++){
      for(var z=0;z<map.size[2];z++){
        for(var w=0;w<map.size[3];w++){
          blanklist[bi++] = [x,y,z,w];
        }
      }
    }
  }
  //player ----------------
  player.pos = blanklist.splice(
      Math.floor(Math.random()*blanklist.length),1)[0];
  player.hp = 3;
  //enemies ----------------
  var enemy_kinds = 4;
  var enemy_hpmax = [2,2,3,2];
  enemies = 10;
  enemy = new Array(enemies);
  for(var e=0;e<enemies;e++){
    enemy[e] = function(){};
    enemy[e].pos = blanklist.splice(
        Math.floor(Math.random()*blanklist.length),1)[0];
    enemy[e].type = Math.floor(Math.random()*enemy_kinds);
    enemy[e].hpmax = enemy_hpmax[enemy[e].type];
    enemy[e].hp    = enemy[e].hpmax;
  }
  //siphone----------------
  var initSiphones = 2;
  shiphones = initSiphones;
  siphoneList = new Array(shiphones);
  for(var i=0; i<shiphones;i++){
    siphoneList[i] = function(){};
    siphoneList[i].pos = blanklist.splice(
      Math.floor(Math.random()*blanklist.length),1)[0];
  }
  //wall--------------------
  var walls=Math.floor(map.size.prod()/8);
  for(var i=0; i<walls;i++){
    var pos = blanklist.splice(
      Math.floor(Math.random()*blanklist.length),1)[0];
      map.map[pos[0]][pos[1]][pos[2]][pos[3]] = map.wall;
  }
  //----------------------------------
  //sprites
  //----------------------------------
  map.sprite    = sprite.addBg(map.map, chsize, [0,0], 0, "bg");
  for(var i=0; i<shiphones;i++){
    siphoneList[i].sprite = sprite.addSprite(chara.siphon, 
      siphoneList[i].pos, 1, "siphone["+i+"]");
  }
  player.sprite = sprite.addSprite(chara.player[0],
    player.pos, 2, "player");
  for(var i=0; i<enemies;i++){
    enemy[i].sprite = sprite.addSprite(
      chara.enemy[enemy[i].type][enemy[i].hpmax-enemy[i].hp], 
      enemy[i].pos, 3, "enemy["+i+"]");
  }
  gameState = "waitimage"; 
}
Array.prototype.to2d = function(){
  return [(this[2]*map.size[0] + this[0])*chsize[0],
          (this[3]*map.size[1] + this[1])*chsize[1]];
}
/* draw map and sprite ------------------------
in:
 chid = Charactor ID
 dstpos = [x,y,z,w] = drown position:
  x,y,z,w (unit = charactors)
 layer  = height of layer (lower is more back)
 -----------------------------------------*/
Sprite.prototype.drawAll4d = function(ctx){
  var animesLcm = 1;
  for(var i=0;i<this.charaList.length;i++){
    animesLcm = lcm(this.charaList[i].animes, animesLcm);
  }
  var sorted = this.spriteList.sort(function(a,b){
    return a.layer-b.layer});
  for(var i=0;i<sorted.length;i++){
    var sp = sorted[i];
    switch(sp.type){
      case "sprite":/*----------------------------------------*/
        var sp_dstpos_2d = sp.dstpos.to2d();
        var a = Math.floor(this.iAnime % sp.ch.animes);
        ctx.drawImage(this.sheet, 
          sp.ch.srcpos[0]+a*sp.ch.size[0], sp.ch.srcpos[1], 
          sp.ch.size  [0], sp.ch.size  [1],
          sp_dstpos_2d[0], sp_dstpos_2d[1],
          sp.ch.size  [0], sp.ch.size  [1]);
      break;
      case "bg": /*----------------------------------------*/
        for(var x=0; x<sp.map.length;x++){
          for(var y=0; y<sp.map[x].length;y++){
            for(var z=0; z<sp.map[x][y].length;z++){
              for(var w=0; w<sp.map[x][y][z].length;w++){
                var ch = this.charaList[sp.map[x][y][z][w]];
                var a = Math.floor(this.iAnime % ch.animes);
                  ctx.drawImage(this.sheet, 
                    ch.srcpos[0]+a*ch.size[0], ch.srcpos[1], 
                    ch.size  [0], ch.size  [1],
                    sp.dstpos[0]+(x+z*map.size[0])*sp.chsize[0],
                    sp.dstpos[1]+(y+w*map.size[1])*sp.chsize[1],
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
  //border ---------
  ctx[0].strokeStyle='rgb(255,2,0)';
  ctx[0].strokeWeight='1';
  for(var w=0;w<map.size[0];w++){
    for(var z=0;z<map.size[1];z++){
      ctx[0].strokeRect(
        z*map.size[2]*chsize[0], 
        w*map.size[3]*chsize[1], 
          map.size[2]*chsize[0],
          map.size[3]*chsize[1]);
    }
  }
  //sprites -----------
  player.sprite.dstpos = player.pos;
  sprite.drawAll4d(ctx[0]);
}

var makeEnemyMotion = function(){
  for(var i=0;i<enemies;i++){
    var m;// 1=no, 0=mobile, 2=mobile but there exists other enemy
    var p = enemy[i].pos;
    //wall
    if(enemy[i].type==enemyindex.lap){
      m = Array.zeros(map.size);
    }else{
      m = map.map.clone();
    }
//    var m_sprite = sprite.addBg(m, chsize, [0,0], 4, "sm");
    for(var j=0;j<enemies;j++){
      //other enemies places are immobile
      if(j!=i) m[p[0]][p[1]][p[2]][p[3]] = 2;
    }
    var initialm = m.clone();
    var now = [player.pos.clone()];
    m[now[0][0]][now[0][1]][now[0][2]][now[0][3]]=1;// immobile
    var next = [];
    var arrived = [];
    while(now.length>0){
      for(var ni=0;ni<now.length;ni++){
        for(var d=0;d<dims;d++){
          var near;
          near = now[ni].clone();
          near[d]--;
          if(near[d]>=0 && m.at(near)!=1){
            next.push(near);
            if(near.isEqual(p)){
              arrived.push(now[ni]);
            }else{
              m[near[0]][near[1]][near[2]][near[3]]=1; // immobile
            }
          }
          near = now[ni].clone();
          near[d]++;
          if(near[d]<map.size[d] && m.at(near)!=1){
            next.push(near);
            if(near.isEqual(p)){
              arrived.push(now[ni]);
            }else{
              m[near[0]][near[1]][near[2]][near[3]]=1; // immobile
            }
          }
        }//d
//        sprite.drawAll4d(ctx[0]);
      }//ni
      if(arrived.length>0){
        //can arrive
        var doBreak=false;
        for(var ai=0;ai<arrived.length;ai++){
          if(initialm.at(arrived[ai])==0){
            enemy[i].pos = arrived[
              Math.floor(arrived.length*Math.random())];
              enemy[i].sprite.dstpos = enemy[i].pos;
            doBreak=true;
            break;
          }
        }
        if(doBreak) break;
      }//if arrived
      
      // cannot arrive
      if(next.length>0){
        now = next;
        next = [];
      }else{
        //no next
        break; //abandon to move
      }
    }//while(now.length>0)

    //rokumen soka
    var roku=0;
  }//i
}
//event handlers after queue ------------
var handleMouseUp = function(){
  if(gameState=="userinput"){
    var d  = [mouseUpPos[0]-mouseDownPos[0], 
              mouseUpPos[1]-mouseDownPos[1]];
    if(Math.abs(d[0]) > map.size[0]*chsize[0]||
       Math.abs(d[1]) > map.size[1]*chsize[1]){
      if(Math.abs(d[0])>Math.abs(d[1])){
        // move in x axis
        input.type = "move";
        input.move = [(d[0]<0)? -1:+1, 0, 0, 0];
        gameState = "usermotion";
      }else{
        // move in y axis
        input.type = "move";
        input.move = [0, (d[1]<0)? -1:+1, 0, 0];
        gameState = "usermotion";
      }
    }else{
      if(mouseUpPos[1] > (player.pos[3]+0)*chsize[1]*map.size[3]&& 
         mouseUpPos[1] < (player.pos[3]+1)*chsize[1]*map.size[3]){
        // mouse up in same z
        if(
          mouseUpPos[0] > (player.pos[2]+1)*chsize[0]*map.size[2]){
          // z++
          input.type = "move";
          input.move = [0, 0, +1, 0];
          gameState = "usermotion";
        }else if(
          mouseUpPos[0] < (player.pos[2]+0)*chsize[0]*map.size[2]){
          // z--
          input.type = "move";
          input.move = [0, 0, -1, 0];
          gameState = "usermotion";
          }
      }else if(
        mouseUpPos[0] > (player.pos[2]+0)*chsize[0]*map.size[2]&& 
        mouseUpPos[0] < (player.pos[2]+1)*chsize[0]*map.size[2]){
        // mouse up in same w
        if(mouseUpPos[1] > (player.pos[3]+1)*chsize[1]*map.size[3]){
          // w++
          input.type = "move";
          input.move = [0, 0, 0, +1];
          gameState = "usermotion";
        }else if(
           mouseUpPos[1] < (player.pos[3]+0)*chsize[1]*map.size[3]){
          // w--
          input.type = "move";
          input.move = [0, 0, 0, -1];
          gameState = "usermotion";
        }
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
    [-1, 0, 0, 0,+1, 0, 0, 0], //x
    [ 0,-1, 0, 0, 0,+1, 0, 0], //y
    [ 0, 0,-1, 0, 0, 0,+1, 0], //z
    [ 0, 0, 0,-1, 0, 0, 0,+1], //w
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
