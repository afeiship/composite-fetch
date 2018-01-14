var assert = require('assert');
var nx = require('next-js-core2');
require('../src/next-version-compare');

describe('next/versionCompare', function () {

  it('nx.versionCompare 1.0 & 1.0 should be 0', function () {
    var ver1 = '1.0';
    var ver2 = '1.0';

    assert.equal(nx.versionCompare(ver1,ver2), 0);
  });

  it('nx.versionCompare 1.0 & 2.0 should be -1', function () {
    var ver1 = '1.0';
    var ver2 = '2.0';

    assert.equal(nx.versionCompare(ver1,ver2), -1);
  });

  it('nx.versionCompare 2.0 & 1.0 should be 1', function () {
    var ver1 = '2.0';
    var ver2 = '1.0';

    assert.equal(nx.versionCompare(ver1,ver2), 1);
  });

  it('nx.versionCompare 1.1.0 & 0.9.0 should be 1', function () {
    var ver1 = '1.1.0';
    var ver2 = '0.9.0';

    assert.equal(nx.versionCompare(ver1,ver2), 1);
  });


  it('nx.versionCompare 6.5 & 6.4.9 should be 1', function () {
    var ver1 = '6.5';
    var ver2 = '6.4.9';

    assert.equal(nx.versionCompare(ver1,ver2), 1);
  });

});
