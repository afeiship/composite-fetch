(function () {

  var global = global || this || self || window;
  var nx = global.nx || require('next-js-core2');
  var DOT = '.';
  var BLANK = '';

  nx.versionCompare = function (inVer1,inVer2) {
    var nRes = 0
      , parts1 = inVer1.split('.')
      , parts2 = inVer2.split('.')
      , nLen = Math.max(parts1.length, parts2.length);

    for (var i = 0; i < nLen; i++) {
      var nP1 = (i < parts1.length) ? parseInt(parts1[i], 10) : 0
        , nP2 = (i < parts2.length) ? parseInt(parts2[i], 10) : 0;

      if (isNaN(nP1)) { nP1 = 0; }
      if (isNaN(nP2)) { nP2 = 0; }

      if (nP1 != nP2) {
        nRes = (nP1 > nP2) ? 1 : -1;
        break;
      }
    }

    return nRes;
  };


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = nx.versionCompare;
  }

}());
