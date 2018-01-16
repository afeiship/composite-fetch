(function () {

  var global = global || this || self || window;
  var nx = global.nx || require('next-js-core2');
  var DOT = '.';
  var BLANK = '';

  nx.versionCompare = function (inVer1,inVer2) {
    var ver1 = String( inVer1 );
    var ver2 = String( inVer2 );
    switch(true){
      case ver1 === ver2:
        return 0;
      case ver1 > ver2:
        return 1;
      case ver1 < ver2:
        return -1;
    }
  };


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = nx.versionCompare;
  }

}());
