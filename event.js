/*----------------------------------
  4dsoko_event.js
  GUI event control. queueing the 
  events and process in serial order.
----------------------------------*/
//events ----------------------
//variables
var eventQueue = [];  //eventQueue[i] = <MouseEvent>
var eventsMax  = 100; 
var lastEvent;       
//mouse events
var isDragging = false;
var mouseDownPos = [-1,-1];
var mousePos     = [-1,-1];
var mouseUpPos   = [-1,-1];
// initialization
var initEvent = function(){
  eventQueue = new Array(0);
  canvas[0].ontouchstart = addTouchEvent;
  canvas[0].ontouchmove  = addTouchEvent;
  canvas[0].ontouchend   = addTouchEvent;
  canvas[0].onmousedown = addEvent;
  canvas[0].onmousemove = addEvent;
  canvas[0].onmouseup   = addEvent;
  canvas[0].onmouseout  = addEvent;
  window.onkeydown       = addEvent;
};
// procedure
var removeClientOffset = function(e){
  if(e.target.getBoundingClientRect){
    var rect = e.target.getBoundingClientRect();
    return [e.x-rect.left, e.y-rect.top];
  }
  return [e.x, e.y];
};
var procEvent = function(){
  while(eventQueue.length>0){
    var e = eventQueue.shift(); // <MouseEvent>
    switch(e.type){
      case "mousedown": // mouse down ---------
        mouseDownPos = removeClientOffset(e);
        mousePos     = mouseDownPos.clone();
        isDragging = true;
      break;
      case "mousemove":   // mouse move ---------
        mousePos = removeClientOffset(e);
      break;
      case "mouseup":   // mouse up ---------
      case "mouseout":   // mouse out ---------
        if(isDragging){
          mousePos   = removeClientOffset(e);
          mouseUpPos = mousePos.clone();
          isDragging = false;
          handleMouseUp();
        }
      break;
      case "touchstart": // mouse down ---------
        e.x = e.touches[0].clientX;
        e.y = e.touches[0].clientY;
        mouseDownPos = removeClientOffset(e);
        mousePos     = mouseDownPos.clone();
        isDragging = true;
      break;
      case "touchmove": // dragging ---------
        e.x = e.touches[0].clientX;
        e.y = e.touches[0].clientY;
        mousePos   = removeClientOffset(e);
      break;
      case "touchend":   // mouse up ---------
        mouseUpPos = mousePos.clone();
          /* copied last mousePos 
           because e with touchend event doesn't
           have member e.touches */
        handleMouseUp();
        isDragging = false;
      break;
      case "keydown":   // mouse up ---------
      if(!isKeyTyping) handleKeyDown(e);
      break;
      default:
      break;
    }
  }
};
// sub routines
// addEvent(Event e)
var addEvent = function(e){
  if(eventQueue.length < eventsMax && e!=undefined){
    eventQueue.push(e);
    lastEvent = e;//for debug
  }
  
  if(e.type!="keydown" || e.type=="mousewheel"){
    if(!isKeyTyping){
      e.preventDefault();
    }
  }
};
var addTouchEvent = function(){
  event.preventDefault();
  eventQueue.push(event);
}
