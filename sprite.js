
/* add new sprite ------------------------
in: url = image png url
 -----------------------------------------*/
var Sprite = function(url){
   this.sheet = new Image();
   this.sheet.src = url + "?" + new Date().getTime();
   
   this.charaList = [];
   this.spriteList = [];
   
   this.charas = 0;
   this.sprites = 0;
   this.map = null;

   this.iAnime = 0;
   this.animes = 1;
};
/* add new charactor ------------------------
in:
  srcpos [2] = [x,y] = position of origin of the charactor 
                       in the sprite sheet (unit is pxcels)
  size   [2] = [x,y] = size of charactor in the sprite sheet 
                       (unit is pixels)
  animes  = number of frame of the animations
out:
 obtained Charactor
 -----------------------------------------*/
Sprite.prototype.addChara = function(srcpos, size, animes, name){
  var ch = {
    "srcpos":srcpos,
    "size"  :size,
    "animes":animes,
    "name"  :name,
    "id"    :this.charas++
  };
  this.animes = lcm(animes, this.animes);
  this.charaList.push(ch);
  return ch;
};
/* add background graphics ------------------------
in:
  map[x][y] = Charactor ID for position (x,y).
  dstpos = [x,y] = drown position:
   x,y (unit = pixels)
  layer = (unit = height of layers (lower is more back))
out:
 Obtained Sprite ID
 -----------------------------------------*/
Sprite.prototype.addBg = function(map, chsize, dstpos, layer, name){
  var sp = {
    "type"  :"bg",
    "map"   :map,
    "chsize":chsize,
    "dstpos":dstpos,
    "layer" :layer,
    "name"  :name,
    "id"    :this.sprites++
  };
  this.spriteList.push(sp);
  return sp;
};
/* add new sprite ------------------------
in:
 chid   = Charactor ID
 dstpos = [x,y] = drown position:
  x,y (unit = pixels)
 layer = height of layers (the lower is more back)
out:
 Obtained Sprite ID
 -----------------------------------------*/
Sprite.prototype.addSprite = function(ch, dstpos, layer, name){
  var sp={
    "type"  :"sprite",
    "ch"    :ch,
    "dstpos":dstpos,
    "layer" :layer,
    "name"  :name,
    "id"    :this.sprites++
  };
  this.spriteList.push(sp);
  return sp;
};
/* draw map and sprite ------------------------
in:
  ctx = destination context
 -----------------------------------------*/
Sprite.prototype.drawAll = function(ctx){
  var sorted = this.spriteList.sort(
    function(a,b){return a.depth-b.depth});
  for(var i=0;i<sorted.length;i++){
    var sp = sorted[i];
    switch(sp.type){
      case "sprite":/*----------------------------------------*/
        ctx.drawImage(this.sheet, 
          sp.ch.srcpos[0], sp.ch.srcpos[1], 
          sp.ch.size  [0], sp.ch.size  [1],
          sp.dstpos   [0], sp.dstpos   [1], 
          sp.ch.size  [0], sp.ch.size  [1]);
      break;
      case "bg": /*----------------------------------------*/
        for(var x=0; x<sp.map.length;x++){
          for(var y=0; y<sp.map[0].length;y++){
            var ch = this.charaList[sp.map[x][y]];
            var a = Math.floor(this.iAnime % ch.animes);
            ctx.drawImage(this.sheet, 
              ch.srcpos[0]+a*ch,size[0], ch.srcpos[1], 
              ch.size  [0], ch.size  [1],
              sp.dstpos[0]+x*sp.chsize[0], 
              sp.dstpos[1]+y*sp.chsize[1], 
              ch.size[0], ch.size[1]);
          }
        }
      break;
      default:/*----------------------------------------*/
      break;
    }//switch
  }//for i
};
Sprite.prototype.incAnime = function(d){
  this.iAnime=(this.iAnime+d)%this.animes;
}
