(function () {

  var global = global || this || self || window;
  var nx = global.nx || require('next-js-core2');
  var DOT = '.';
  var BLANK = '';

  nx.versionCompare = function (inVer1,inVer2) {
    var result = 0
      , parts1 = String(inVer1).split('.')
      , parts2 = String(inVer2).split('.')
      , max = Math.max(parts1.length, parts2.length);

    for (var i = 0; i < max; i++) {
      var nP1 = (i < parts1.length) ? parseInt(parts1[i], 10) : 0
        , nP2 = (i < parts2.length) ? parseInt(parts2[i], 10) : 0;

      if (isNaN(nP1)) { nP1 = 0; }
      if (isNaN(nP2)) { nP2 = 0; }

      if (nP1 != nP2) {
        result = (nP1 > nP2) ? 1 : -1;
        break;
      }
    }

    return result;
  };


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = nx.versionCompare;
  }

}());
