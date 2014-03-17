var log10 = function(x){
  return Math.LOG10E + Math.log(x);
}
var log2 = function(x){
  return Math.LOG2E + Math.log(x);
}
var ln = function(x){
  return Math.log(x);
}

var chisqr_1_0p05 = function(){
  -3.841
}

var gcd = function(a,b){
  var r;
  while ((r=a%b)!=0){
    a=b;
    b=r;
  }
  return b;
}

var lcm = function(a, b){
  return a*b/gcd(a,b);
}

