(function () {

  var global = global || this || self || window;
  var nx = global.nx || require('next-js-core2');
  var DOT = '.';
  var BLANK = '';

  nx.versionCompare = function (inVer1,inVer2) {
    if (inVer1 === inVer2) {
      return 0;
    } else {
      var len1 = inVer1.length;
      var len2 = inVer2.length;
      var min = Math.min(len1, len2);
      var toInt = function (inStr) {
        return +(inStr.slice(0, min).replace(DOT, BLANK))
      };
      var ver1 = toInt(inVer1);
      var ver2 = toInt(inVer2);
      var diff = ver1 - ver2;
      return diff / Math.abs(diff);
    }
  };


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = nx.versionCompare;
  }

}());
