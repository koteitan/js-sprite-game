Array.prototype.min = function(){
  var ret=this[0];
  for(var i=1;i<this.length;i++){
    ret = ret<this[i]?ret:this[i];
  }
  return ret;
}
Array.prototype.max = function(){
  var ret=this[0];
  for(var i=1;i<this.length;i++){
    ret = ret>this[i]?ret:this[i];
  }
  return ret;
}
Array.prototype.argmax = function(){
  var ret=0;
  for(var i=1;i<this.length;i++){
    ret = this[ret]>this[i]?ret:i;
  }
  return ret;
}
Array.prototype.argmin = function(){
  var ret=0;
  for(var i=1;i<this.length;i++){
    ret = this[ret]<this[i]?ret:i;
  }
  return ret;
}
Array.prototype.sum = function(){
  var ret = this[0];
  for(var i=1;i<this.length;i++){
    ret += this[i]
  }
  return ret;
}
Array.prototype.mean = function(){
    return this.sum()/this.length;
}
Array.prototype.clone = function(){
    if ( this[0].constructor == Array ) {
        var ar, n;
        ar = new Array( this.length );
        for ( n = 0; n < ar.length; n++ ) {
            ar[n] = this[n].clone();
        }
        return ar;
    }
    return Array.apply( null, this );
}
/* Value of multidimensional array
   with index array i[d]
   this function returns a[i[0]][i[1]][i[2]].  
   ex.
     [[1,2,3],[4,5,6],[7,8,9]].at([2,1])=8;
     [[1,2,3],[4,5,6],[7,8,9]].at([2])=[7,8,9];
*/
Array.prototype.at = function(i){
  var b = this;
  for(var d=0;d<i.length;d++) b = b[i[d]];
  return b;
}
/*
*/
Array.zeros = function(s){
  var f=function(s, d){
    var a = new Array(s[d]);
    if(d==s.length-1){
      for(var i=0;i<s[d];i++) a[i] = 0;
    }else{
      for(var i=0;i<s[d];i++) a[i] = f(s,d+1);
    }
    return a;
  };
  return f(s,0);
}
Array.prototype.toString = function(){
  var s="[";
  var i=0;
  for(i=0;i<this.length-1;i++){
    s+=this[i].toString()+", ";
  }
  s+=this[i].toString()+"]";
  return s;
}
