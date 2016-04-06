var pd = require('pretty-data').pd;
var fs = require('fs');
var biopax = require('../../index.js');
var expect = require('chai').expect;
var mocha = require('mocha');
var sinon = require('sinon');

describe('Public API', function() {

  it('should convert BioPAX from GPML to JSON', function(done) {
    var input = fs.readFileSync(
        __dirname + '/../inputs/biopax-from-playground-gpml.owl',
        {encoding: 'utf8'}
    );
    var expectedPath = __dirname + '/../expecteds/biopax-from-playground-gpml.json';
    var expected = require(expectedPath);
    // TODO test the following files as well
    //var str = fs.readFileSync(
    //__dirname + '/../inputs/biopax-from-one-of-each.owl', {encoding: 'utf8'});
    //var str = fs.readFileSync(
    //__dirname + '/../inputs/Pathway_01c4db97c8d95c5c2480943ea1cb3038.owl', {encoding: 'utf8'});
    //var input = fs.readFileSync(
    //__dirname + '/../inputs/Biopax-from-WP525.owl', {encoding: 'utf8'});

    var pathwayMetadata = {};
    pathwayMetadata.dbName = 'wikipathways';
    pathwayMetadata.dbId = 'WP525';
    pathwayMetadata.idVersion = '74871';

    biopax.toJson(input, pathwayMetadata, function(err, actual) {
      if (err) {
        return done(err);
      }
      var actualString = JSON.stringify(actual, null, '  ');
      var expectedString = JSON.stringify(expected, null, '  ');
      expect(actual).to.eql(expected);
      if (actualString !== expectedString) {
        var actualPretty = pd.json(actualString);
        console.log('actualPretty');
        console.log(actualPretty);
      }
      /*
      fs.writeFileSync(
          expectedPath,
          actualString,
          {encoding: 'utf8'}
      );
      //*/
      done();
    });
  });
});
